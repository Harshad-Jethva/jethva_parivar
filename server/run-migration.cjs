const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbName = process.env.PGDATABASE || 'shree_ram_mandir';

async function runSingle() {
  const targetClient = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'admin',
    database: dbName,
  });

  try {
    await targetClient.connect();
    console.log(`Connected to database "${dbName}".`);

    const migrationFile = path.resolve(__dirname, '../supabase/migrations/20260614090000_admin_tables.sql');
    console.log(`Reading migration: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('Running migration query...');
    await targetClient.query(sql);
    console.log('Migration 20260614090000_admin_tables.sql completed successfully!');
  } catch (err) {
    console.error('Error running single migration:', err);
  } finally {
    await targetClient.end();
  }
}

runSingle();
