const { lerJogos, permiteApostas, formatarDataJogo, getBandeira } = require('../utils/jogosHelper');
const { lerApostasPorJogo, adicionarAposta } = require('../utils/csvHelper');
const { getTranslation } = require('../utils/i18n');

/**
 * Renderiza a página inicial com todos os jogos e suas apostas
 */
async function index(req, res) {
    try {
        const jogos = await lerJogos();
        
        // Para cada jogo, busca as apostas e verifica se ainda permite apostas
        const jogosCompletos = await Promise.all(
            jogos.map(async (jogo) => {
                const apostas = await lerApostasPorJogo(jogo.id);
                return {
                    ...jogo,
                    dataHoraFormatada: formatarDataJogo(jogo.dataHora),
                    permiteApostas: permiteApostas(jogo.dataHora),
                    apostas: apostas,
                    bandeira1: getBandeira(jogo.time1),
                    bandeira2: getBandeira(jogo.time2)
                };
            })
        );
        
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);
        
        res.render('index', { 
            jogos: jogosCompletos,
            titulo: t('title'),
            lang: lang,
            t: t,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Erro ao carregar página inicial:', error);
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);
        res.status(500).render('error', { 
            mensagem: t('errorLoadingGames'),
            lang: lang,
            t: t
        });
    }
}

/**
 * Processa o POST de uma nova aposta
 */
async function fazerAposta(req, res) {
    try {
        const { nome, jogo_id, palpite_time1, palpite_time2 } = req.body;
        
        // Validações básicas
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);
        
        if (!nome || !jogo_id || palpite_time1 === '' || palpite_time2 === '') {
            return res.redirect(`/?error=${encodeURIComponent(t('errorAllFields'))}&lang=${lang}`);
        }
        
        const numJogoId = parseInt(jogo_id);
        const numPalpite1 = parseInt(palpite_time1);
        const numPalpite2 = parseInt(palpite_time2);
        
        if (isNaN(numJogoId) || isNaN(numPalpite1) || isNaN(numPalpite2)) {
            return res.redirect(`/?error=${encodeURIComponent(t('errorInvalidValues'))}&lang=${lang}`);
        }
        
        // Verifica se o jogo existe e permite apostas
        const { lerJogos, permiteApostas, buscarJogoPorId } = require('../utils/jogosHelper');
        const jogos = await lerJogos();
        const jogo = jogos.find(j => j.id === numJogoId);
        
        if (!jogo) {
            return res.redirect(`/?error=${encodeURIComponent(t('errorGameNotFound'))}&lang=${lang}`);
        }
        
        if (!permiteApostas(jogo.dataHora)) {
            return res.redirect(`/?error=${encodeURIComponent(t('errorBetsClosed'))}&lang=${lang}`);
        }
        
        // Salva a aposta
        await adicionarAposta({
            nome: nome.trim(),
            jogo_id: numJogoId,
            palpite_time1: numPalpite1,
            palpite_time2: numPalpite2
        });
        
        res.redirect(`/?success=${encodeURIComponent(t('successBetRegistered'))}&lang=${lang}`);
    } catch (error) {
        console.error('Erro ao salvar aposta:', error);
        res.redirect(`/?error=${encodeURIComponent(t('errorSavingBet'))}&lang=${lang}`);
    }
}

module.exports = {
    index,
    fazerAposta
};
