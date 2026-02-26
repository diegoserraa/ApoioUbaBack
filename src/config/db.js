require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
  host: process.env.DB_URL.split('@')[1].split(':')[0], // força IPv4
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { query };