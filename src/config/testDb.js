const db = require('./db');

async function test() {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Conexão OK! Hora do banco:', res.rows[0]);
  } catch (err) {
    console.error('Erro de conexão detalhado:');
    console.error(err); // mostra o objeto completo do erro
  }
}

test();