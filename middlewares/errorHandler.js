const { getTranslation } = require('../utils/i18n');

/**
 * Middleware para tratamento de erros 404
 */
function notFoundHandler(req, res, next) {
    const lang = req.lang || 'pt';
    const t = (key) => getTranslation(lang, key);
    res.status(404).render('error', {
        mensagem: 'Página não encontrada',
        lang: lang,
        t: t
    });
}

/**
 * Middleware para tratamento de erros gerais
 */
function errorHandler(err, req, res, next) {
    console.error('Erro:', err.stack);
    const lang = req.lang || 'pt';
    const t = (key) => getTranslation(lang, key);
    res.status(500).render('error', {
        mensagem: t('errorLoadingGames'),
        lang: lang,
        t: t
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
