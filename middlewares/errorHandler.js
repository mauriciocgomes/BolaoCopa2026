/**
 * Middleware para tratamento de erros 404
 */
function notFoundHandler(req, res, next) {
    res.status(404).render('error', {
        mensagem: 'Página não encontrada'
    });
}

/**
 * Middleware para tratamento de erros gerais
 */
function errorHandler(err, req, res, next) {
    console.error('Erro:', err.stack);
    res.status(500).render('error', {
        mensagem: 'Erro interno do servidor'
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
