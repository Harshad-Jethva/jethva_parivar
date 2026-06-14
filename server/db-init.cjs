const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbName = process.env.PGDATABASE || 'shree_ram_mandir';

async function init() {
  console.log('Starting local PostgreSQL database initialization...');

  // 1. Connect to the default 'postgres' database to check/create our target database
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'admin',
    database: 'postgres', // connect to default db first
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');

    // Check if target database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating it...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // 2. Connect to the target database to run migrations
  const targetClient = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'admin',
    database: dbName,
  });

  try {
    await targetClient.connect();
    console.log(`Connected to target database "${dbName}".`);

    // Enable extensions
    await targetClient.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await targetClient.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Find and sort migration files
    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found at ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sorts chronologically

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Processing migration: ${file}`);
      let sqlContent = fs.readFileSync(filePath, 'utf8');

      // Clean SQL content: remove Supabase RLS and policy configurations
      let cleanedSql = sqlContent.replace(/ALTER TABLE\s+\w+\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY\s*;/gi, '');
      cleanedSql = cleanedSql.replace(/CREATE\s+POLICY\s+[\s\S]*?;/gi, '');
      cleanedSql = cleanedSql.replace(/DROP\s+POLICY\s+[\s\S]*?;/gi, '');

      // Run the cleaned migration script
      await targetClient.query(cleanedSql);
      console.log(`Migration ${file} executed successfully.`);
    }

    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

init();
