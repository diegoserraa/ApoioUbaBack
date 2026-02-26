// Rotas: endpoints
const express = require('express');
const router = express.Router();
const pontosController = require('../controllers/pontoApoioController');

router.get('/', pontosController.listarPontos);
router.post('/', pontosController.criarPonto);

module.exports = router;