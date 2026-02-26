// Repository: camada de acesso ao banco
const db = require('../config/db');

async function listarPontos() {
  const result = await db.query(
    `SELECT 
       id, nome, endereco, bairro, itens_recebidos, 
       horario, telefone, latitude, longitude, created_at
     FROM pontos_doacao
     WHERE ativo = true
     ORDER BY created_at DESC`
  );

  return result.rows;
}

async function criarPonto(ponto) {
  const {
    nome,
    endereco,
    bairro,
    itens_recebidos,
    horario,
    telefone,
    latitude,
    longitude
  } = ponto;

  const result = await db.query(
    `INSERT INTO pontos_doacao
       (nome, endereco, bairro, itens_recebidos, horario, telefone, latitude, longitude, ativo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
     RETURNING id, nome, endereco, bairro, itens_recebidos, horario, telefone, latitude, longitude, created_at`,
    [nome, endereco, bairro, itens_recebidos, horario, telefone, latitude, longitude]
  );

  return result.rows[0];
}

module.exports = {
  listarPontos,
  criarPonto
};