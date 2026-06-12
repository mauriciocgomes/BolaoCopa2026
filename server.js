const express = require('express');
const path = require('path');
const bolaoRoutes = require('./routes/bolaoRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de idioma
app.use((req, res, next) => {
    const lang = req.query.lang || req.cookies?.lang || 'pt';
    req.lang = ['pt', 'en'].includes(lang) ? lang : 'pt';
    res.locals.lang = req.lang;
    next();
});

// Rotas
app.use('/', bolaoRoutes);

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`  BOLÃO COPA 2026 - Servidor`);
    console.log(`  Rodando em: http://localhost:${PORT}`);
    console.log(`=================================`);
});

module.exports = app;
