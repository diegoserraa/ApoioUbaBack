// Rotas: endpoints
const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosEntregaController');
const { verificarToken } = require('../middlewares/authMiddleware');

// GET - listar pedidos
router.get('/', verificarToken, pedidosController.listarPedidos);

// POST - criar pedido
router.post('/', pedidosController.criarPedido);

// ✅ PUT - marcar como entregue
router.put('/:id/entregar', verificarToken, pedidosController.marcarComoEntregue);

module.exports = router;