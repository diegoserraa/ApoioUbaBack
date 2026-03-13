// Controller: interface HTTP
const pedidosService = require('../services/pedidosEntregaService');

async function listarPedidos(req, res) {
  try {
    const pedidos = await pedidosService.listar();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function criarPedido(req, res) {
  try {
    const pedido = await pedidosService.criar(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function marcarComoEntregue(req, res) {
  try {
    const { id } = req.params;
    const { responsavel } = req.body;

    const pedidoAtualizado = await pedidosService.marcarComoEntregue(
      id,
      responsavel
    );

    res.status(200).json(pedidoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  listarPedidos,
  criarPedido,
  marcarComoEntregue
};