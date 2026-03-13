// Rotas: endpoints
const express = require('express');
const router = express.Router();
const pontosController = require('../controllers/pontoApoioController');
const { verificarToken } = require('../middlewares/authMiddleware');


router.get('/', pontosController.listarPontos);
router.post('/', verificarToken, pontosController.criarPonto);
router.patch("/:id/ativo", verificarToken, pontosController.alterarStatus);

module.exports = router;