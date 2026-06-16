const express = require('express');
const router = express.Router();
const { index, fazerAposta, adminResultados, salvarResultadoJogo } = require('../controllers/bolaoController');

// Rota principal - lista de jogos
router.get('/', index);

// Rota para enviar aposta
router.post('/apostar', fazerAposta);

// Rota para administração de resultados
router.get('/admin/resultados', adminResultados);

// Rota para salvar resultado
router.post('/admin/resultados', salvarResultadoJogo);

module.exports = router;
