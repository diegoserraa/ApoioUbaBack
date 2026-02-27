// Rotas: endpoints
const express = require('express');
const router = express.Router();
const pontosController = require('../controllers/pontoApoioController');
const { verificarAdmin } = require('../middlewares/authMiddleware');


router.get('/', pontosController.listarPontos);
router.post('/', verificarAdmin, pontosController.criarPonto);
router.post('/login', pontosController.login);

module.exports = router;