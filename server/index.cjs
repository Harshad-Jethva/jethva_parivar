const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const db = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_jwt_session_validation_12345';

// Security Helper Functions
function verifyPassword(password, storedValue) {
  try {
    const [salt, hash] = storedValue.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (e) {
    return false;
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}


function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
  req.user = decoded;
  next();
};

app.use(cors());
app.use(express.json());

// List of allowed tables for querying and modifying
const allowedTables = [
  'users',
  'events',
  'event_registrations',
  'donations',
  'gallery',
  'aarti_timings',
  'blogs',
  'volunteers',
  'services',
  'service_bookings',
  'testimonials',
  'site_settings',
  'trustees',
  'notifications',
  'pages',
  'page_sections',
  'menus',
  'forms',
  'form_submissions',
  'redirects',
  'faqs',
  'media',
  'audit_logs'
];

// 1. Generic GET endpoint for table querying
app.get('/api/:table', async (req, res, next) => {
  const { table } = req.params;

  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: `Table '${table}' is not queryable or does not exist.` });
  }

  // Restrict sensitive admin tables from public read queries
  const restrictedReadTables = ['users', 'audit_logs', 'form_submissions', 'redirects', 'forms'];
  if (restrictedReadTables.includes(table)) {
    return authenticateAdmin(req, res, next);
  }
  next();
}, async (req, res) => {
  const { table } = req.params;

  let queryText = `SELECT * FROM "${table}"`;
  const queryParams = [];
  let paramIndex = 1;
  const whereClauses = [];

  // Process filters
  if (req.query.filters) {
    try {
      const filters = JSON.parse(req.query.filters);
      for (const filter of filters) {
        const { field, op, value } = filter;

        // Prevent SQL injection by validating field name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
          console.warn(`Blocked potentially unsafe field name: ${field}`);
          continue;
        }

        if (op === 'eq') {
          whereClauses.push(`"${field}" = $${paramIndex}`);
          queryParams.push(value);
          paramIndex++;
        } else if (op === 'gte') {
          whereClauses.push(`"${field}" >= $${paramIndex}`);
          queryParams.push(value);
          paramIndex++;
        }
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid filters parameter format.' });
    }
  }

  if (whereClauses.length > 0) {
    queryText += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Process sorting
  if (req.query.orderField) {
    const orderField = req.query.orderField;
    const orderAscending = req.query.orderAscending === 'true';

    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(orderField)) {
      queryText += ` ORDER BY "${orderField}" ${orderAscending ? 'ASC' : 'DESC'}`;
    } else {
      console.warn(`Blocked potentially unsafe order field: ${orderField}`);
    }
  }

  // Process limit
  if (req.query.limit) {
    const limit = parseInt(req.query.limit, 10);
    if (!isNaN(limit) && limit > 0) {
      queryText += ` LIMIT ${limit}`;
    }
  }

  try {
    const result = await db.query(queryText, queryParams);
    let rows = result.rows;
    if (table === 'users') {
      rows = rows.map(r => {
        const { password_hash, ...rest } = r;
        return rest;
      });
    }
    res.json(rows);
  } catch (err) {
    console.error(`Database error on GET /api/${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Generic POST endpoint for inserting records
app.post('/api/:table', (req, res, next) => {
  const { table } = req.params;
  // Public submittable tables that do not require admin authentication
  const publicPostTables = ['form_submissions', 'event_registrations', 'service_bookings', 'donations', 'testimonials'];
  if (publicPostTables.includes(table)) {
    return next();
  }
  return authenticateAdmin(req, res, next);
}, async (req, res) => {
  const { table } = req.params;
  const data = req.body;

  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: `Insertion not allowed on table '${table}'.` });
  }

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Body must be a JSON object.' });
  }

  if (table === 'users' && data.password) {
    data.password_hash = hashPassword(data.password);
    delete data.password;
  }

  const fields = Object.keys(data).filter(field => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field));
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for insertion.' });
  }

  const columns = fields.map(f => `"${f}"`).join(', ');
  const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ');
  const values = fields.map(f => data[f]);

  const queryText = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) RETURNING *`;

  try {
    const result = await db.query(queryText, values);
    const newRow = result.rows[0];

    // Log to Audit Logs
    if (table !== 'audit_logs') {
      try {
        const logEmail = req.user?.email || 'anonymous';
        await db.query(
          `INSERT INTO audit_logs (user_email, action, target_table, target_id, old_value, new_value) VALUES ($1, $2, $3, $4, $5, $6)`,
          [logEmail, 'create', table, newRow.id, null, JSON.stringify(newRow)]
        );
      } catch (auditErr) {
        console.error('Audit log insertion failed on create:', auditErr.message);
      }
    }

    if (table === 'users') {
      delete newRow.password_hash;
    }

    res.status(201).json(newRow);
  } catch (err) {
    console.error(`Database error on POST /api/${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Generic PUT endpoint for updating records
app.put('/api/:table/:id', authenticateAdmin, async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: `Update not allowed on table '${table}'.` });
  }

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: 'Body must be a JSON object.' });
  }

  if (table === 'users' && data.password) {
    data.password_hash = hashPassword(data.password);
    delete data.password;
  }

  // Retrieve current row first to log old value
  let oldRow = null;
  try {
    const oldRes = await db.query(`SELECT * FROM "${table}" WHERE id = $1`, [id]);
    if (oldRes.rows.length > 0) {
      oldRow = oldRes.rows[0];
    }
  } catch (err) {
    console.warn(`Could not fetch old row for table ${table}:`, err.message);
  }

  const fields = Object.keys(data).filter(field => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field) && field !== 'id' && field !== 'created_at' && field !== 'updated_at');
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  // Check if table has updated_at column
  let hasUpdatedAt = false;
  try {
    const colRes = await db.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = 'updated_at'`,
      [table]
    );
    hasUpdatedAt = colRes.rowCount > 0;
  } catch (err) {
    // ignore
  }

  const setClauses = fields.map((f, idx) => `"${f}" = $${idx + 2}`).join(', ');
  const values = [id, ...fields.map(f => data[f])];

  let queryText = `UPDATE "${table}" SET ${setClauses}`;
  if (hasUpdatedAt) {
    queryText += `, updated_at = NOW()`;
  }
  queryText += ` WHERE id = $1 RETURNING *`;

  try {
    const result = await db.query(queryText, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Record with id ${id} not found in ${table}.` });
    }
    const updatedRow = result.rows[0];

    // Log to Audit Logs
    if (table !== 'audit_logs') {
      try {
        const logEmail = req.user?.email || 'anonymous';
        await db.query(
          `INSERT INTO audit_logs (user_email, action, target_table, target_id, old_value, new_value) VALUES ($1, $2, $3, $4, $5, $6)`,
          [logEmail, 'update', table, id, JSON.stringify(oldRow), JSON.stringify(updatedRow)]
        );
      } catch (auditErr) {
        console.error('Audit log insertion failed on update:', auditErr.message);
      }
    }

    if (table === 'users') {
      delete updatedRow.password_hash;
    }

    res.json(updatedRow);
  } catch (err) {
    console.error(`Database error on PUT /api/${table}/${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. Generic DELETE endpoint for deleting records
app.delete('/api/:table/:id', authenticateAdmin, async (req, res) => {
  const { table, id } = req.params;

  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: `Deletion not allowed on table '${table}'.` });
  }

  // Retrieve current row first to log old value
  let oldRow = null;
  try {
    const oldRes = await db.query(`SELECT * FROM "${table}" WHERE id = $1`, [id]);
    if (oldRes.rows.length > 0) {
      oldRow = oldRes.rows[0];
    }
  } catch (err) {
    console.warn(`Could not fetch old row for deletion from ${table}:`, err.message);
  }

  try {
    const result = await db.query(`DELETE FROM "${table}" WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Record with id ${id} not found in ${table}.` });
    }

    // Log to Audit Logs
    if (table !== 'audit_logs' && oldRow) {
      try {
        const logEmail = req.user?.email || 'anonymous';
        await db.query(
          `INSERT INTO audit_logs (user_email, action, target_table, target_id, old_value, new_value) VALUES ($1, $2, $3, $4, $5, $6)`,
          [logEmail, 'delete', table, id, JSON.stringify(oldRow), null]
        );
      } catch (auditErr) {
        console.error('Audit log insertion failed on delete:', auditErr.message);
      }
    }
    const deletedRow = result.rows[0];
    if (table === 'users' && deletedRow) {
      delete deletedRow.password_hash;
    }
    res.json({ success: true, deleted: deletedRow });
  } catch (err) {
    console.error(`Database error on DELETE /api/${table}/${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Account credentials not initialized.' });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate token (expires in 24 hours)
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000
    });

    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, full_name, role, avatar_url, language, is_active FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Auth check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
