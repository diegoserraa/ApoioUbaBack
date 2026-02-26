// Controller: interface HTTP
const pontosService = require('../services/pontoApoioService');

async function listarPontos(req, res) {
  try {
    const pontos = await pontosService.listar();
    res.status(200).json(pontos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function criarPonto(req, res) {
  try {
    const ponto = await pontosService.criar(req.body);
    res.status(201).json(ponto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  listarPontos,
  criarPonto
};