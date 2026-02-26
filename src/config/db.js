require('dotenv').config();

const { Pool } = require('pg');

const isRender = process.env.RENDER === 'true'; // ✅ variável para detectar Render

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false, // SSL só no Render
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { query };