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

async function alterarStatus(req, res) {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== "boolean") {
      return res.status(400).json({
        error: "Campo 'ativo' deve ser boolean (true ou false)",
      });
    }

    const pontoAtualizado = await pontosService.alterarStatus(id, ativo);

    res.json({
      message: ativo
        ? "Ponto ativado com sucesso"
        : "Ponto inativado com sucesso",
      data: pontoAtualizado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listarPontos,
  criarPonto,
  alterarStatus
};