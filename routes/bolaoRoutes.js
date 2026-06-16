const express = require('express');
const router = express.Router();
const { index, fazerAposta, adminResultados, salvarResultadoJogo, verApostasParticipante } = require('../controllers/bolaoController');

// Rota principal - lista de jogos
router.get('/', index);

// Rota para enviar aposta
router.post('/apostar', fazerAposta);

// Rota para administração de resultados
router.get('/admin/resultados', adminResultados);

// Rota para salvar resultado
router.post('/admin/resultados', salvarResultadoJogo);

// Rota para ver apostas de um participante
router.get('/participante/:nome', verApostasParticipante);

module.exports = router;
