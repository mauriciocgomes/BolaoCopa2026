const express = require('express');
const router = express.Router();
const path = require('path');
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

// Rota para download do arquivo de apostas (CSV)
router.get('/download/apostas.csv', (req, res) => {
    const filePath = path.join(__dirname, '..', 'data', 'apostas.csv');
    res.download(filePath, 'apostas.csv', (err) => {
        if (err) {
            console.error('Erro ao baixar arquivo:', err);
            res.status(500).send('Erro ao baixar arquivo');
        }
    });
});

// Rota para download do arquivo de resultados (CSV)
router.get('/download/resultados.csv', (req, res) => {
    const filePath = path.join(__dirname, '..', 'data', 'resultados.csv');
    res.download(filePath, 'resultados.csv', (err) => {
        if (err) {
            console.error('Erro ao baixar arquivo:', err);
            res.status(500).send('Erro ao baixar arquivo');
        }
    });
});

module.exports = router;
