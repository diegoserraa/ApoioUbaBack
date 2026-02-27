// Controller: interface HTTP
const pontosService = require('../services/pontoApoioService');

async function listarPontos(req, res) {
  try {
    const { tipo } = req.query;

    console.log("Tipo recebido na API:", tipo); // 👈 debug

    const pontos = await pontosService.listar(tipo);

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

async function login(req, res) {
  try {
    const { user, password } = req.body;

    const resultado = pontosService.loginAdmin(user, password);

    res.status(200).json(resultado);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = {
  listarPontos,
  criarPonto,
  login
};