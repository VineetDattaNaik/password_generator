const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Vineet@0702@npcknuachueatwthqjwn.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to Supabase PostgreSQL database');
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    // More detailed error logging
    console.error('Database Connection Error Details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    return false;
  }
};

// Helper function to execute queries with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', { text, error: err.message });
    throw err;
  }
};

// Export an async initialization function
const initialize = async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to establish initial database connection');
    process.exit(1);
  }
  return { query, pool };
};

module.exports = {
  initialize,
  query,
  pool
};
