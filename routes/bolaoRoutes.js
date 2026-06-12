const express = require('express');
const router = express.Router();
const { index, fazerAposta } = require('../controllers/bolaoController');

// Rota principal - lista de jogos
router.get('/', index);

// Rota para enviar aposta
router.post('/apostar', fazerAposta);

module.exports = router;
