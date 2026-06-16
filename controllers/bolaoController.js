const { lerJogos, permiteApostas, formatarDataJogo, getBandeira } = require('../utils/jogosHelper');
const { lerApostasPorJogo, adicionarAposta, lerApostasPorParticipante } = require('../utils/csvHelper');
const { getTranslation } = require('../utils/i18n');
const { lerResultados, salvarResultado } = require('../utils/resultadosHelper');

/**
 * Calcula pontos de uma aposta baseado no resultado oficial
 * @param {Object} aposta - Objeto com palpite_time1 e palpite_time2
 * @param {Object} resultado - Objeto com placar_time1 e placar_time2
 * @returns {number} - Pontos ganhos (0, 1 ou 3)
 */
function calcularPontos(aposta, resultado) {
    if (!resultado) return 0;
    
    const palpite1 = parseInt(aposta.palpite_time1);
    const palpite2 = parseInt(aposta.palpite_time2);
    const real1 = parseInt(resultado.placar_time1);
    const real2 = parseInt(resultado.placar_time2);
    
    // Placar exato = 3 pontos
    if (palpite1 === real1 && palpite2 === real2) {
        return 3;
    }
    
    // Acertar resultado (vencedor ou empate) = 1 ponto
    const palpiteResultado = palpite1 > palpite2 ? 1 : palpite1 < palpite2 ? 2 : 0; // 1=time1, 2=time2, 0=empate
    const realResultado = real1 > real2 ? 1 : real1 < real2 ? 2 : 0;
    
    if (palpiteResultado === realResultado) {
        return 1;
    }
    
    return 0;
}

/**
 * Renderiza a página inicial com todos os jogos e suas apostas
 */
async function index(req, res) {
    try {
        const jogos = await lerJogos();
        const resultados = await lerResultados();
        
        // Cria mapa de resultados por jogo
        const resultadosMap = {};
        resultados.forEach(r => {
            resultadosMap[r.jogo_id] = r;
        });
        
        // Data atual para filtrar jogos do dia
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        // Para cada jogo, busca as apostas e verifica se ainda permite apostas
        const jogosCompletos = await Promise.all(
            jogos.map(async (jogo) => {
                const apostas = await lerApostasPorJogo(jogo.id);
                const resultado = resultadosMap[jogo.id] || null;
                
                // Calcula pontos para cada aposta
                const apostasComPontos = apostas.map(aposta => ({
                    ...aposta,
                    pontos: calcularPontos(aposta, resultado)
                }));
                
                // Verifica se o jogo é hoje
                const dataJogo = new Date(jogo.dataHora);
                const ehJogoDeHoje = dataJogo >= hoje && dataJogo < amanha;
                
                return {
                    ...jogo,
                    dataHoraFormatada: formatarDataJogo(jogo.dataHora),
                    permiteApostas: permiteApostas(jogo.dataHora),
                    apostas: apostasComPontos,
                    bandeira1: getBandeira(jogo.time1),
                    bandeira2: getBandeira(jogo.time2),
                    resultado: resultado,
                    ehJogoDeHoje: ehJogoDeHoje
                };
            })
        );
        
        // Separa jogos de hoje dos demais
        const jogosDeHoje = jogosCompletos.filter(j => j.ehJogoDeHoje);
        const outrosJogos = jogosCompletos.filter(j => !j.ehJogoDeHoje);
        
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);
        
        // Calcula pontuação total por participante
        const pontuacaoParticipantes = {};
        
        jogosCompletos.forEach(jogo => {
            jogo.apostas.forEach(aposta => {
                if (!pontuacaoParticipantes[aposta.nome]) {
                    pontuacaoParticipantes[aposta.nome] = {
                        nome: aposta.nome,
                        totalPontos: 0,
                        placaresExatos: 0,
                        resultadosCorretos: 0
                    };
                }
                
                if (aposta.pontos > 0) {
                    pontuacaoParticipantes[aposta.nome].totalPontos += aposta.pontos;
                    if (aposta.pontos === 3) {
                        pontuacaoParticipantes[aposta.nome].placaresExatos++;
                    } else if (aposta.pontos === 1) {
                        pontuacaoParticipantes[aposta.nome].resultadosCorretos++;
                    }
                }
            });
        });
        
        // Converte para array e ordena por pontuação (maior primeiro)
        const rankingParticipantes = Object.values(pontuacaoParticipantes)
            .sort((a, b) => b.totalPontos - a.totalPontos);
        
        // Lista de participantes em ordem alfabética
        const participantes = [
            'Cata',
            'Clara',
            'Clau',
            'Duda',
            'Jared',
            'Kin',
            'Marcelo',
            'Matias',
            'Mauricio',
            'Nei',
            'Raquel',
            'Vanessa'
        ];
        
        res.render('index', { 
            jogos: jogosCompletos,
            jogosDeHoje: jogosDeHoje,
            outrosJogos: outrosJogos,
            titulo: t('title'),
            lang: lang,
            t: t,
            participantes: participantes,
            ranking: rankingParticipantes,
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
        
        // Carrega resultados para verificar se apostas estão encerradas
        const resultados = await lerResultados();
        const resultadosMap = {};
        resultados.forEach(r => {
            resultadosMap[r.jogo_id] = r;
        });
        
        if (!permiteApostas(jogo.dataHora)) {
            return res.redirect(`/?error=${encodeURIComponent(t('errorBetsClosed'))}&lang=${lang}`);
        }
        
        // Verifica se o jogo já tem resultado (encerra apostas)
        const resultadoExistente = resultadosMap[numJogoId];
        if (resultadoExistente) {
            return res.redirect(`/?error=${encodeURIComponent('Apostas encerradas para este jogo (resultado já definido)')}&lang=${lang}`);
        }
        
        // Verifica se o participante já apostou neste jogo
        const apostasExistentes = await lerApostasPorJogo(numJogoId);
        const jaApostou = apostasExistentes.some(aposta => 
            aposta.nome.toLowerCase() === nome.trim().toLowerCase()
        );
        
        if (jaApostou) {
            return res.redirect(`/?error=${encodeURIComponent('Você já fez uma aposta neste jogo!')}&lang=${lang}`);
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

/**
 * Renderiza página de administração de resultados
 */
async function adminResultados(req, res) {
    try {
        const jogos = await lerJogos();
        const resultados = await lerResultados();
        
        // Cria mapa de resultados por jogo
        const resultadosMap = {};
        resultados.forEach(r => {
            resultadosMap[r.jogo_id] = r;
        });
        
        const jogosComResultados = jogos.map(jogo => ({
            ...jogo,
            dataHoraFormatada: formatarDataJogo(jogo.dataHora),
            resultado: resultadosMap[jogo.id] || null
        }));
        
        // Ordena jogos: sem resultado primeiro (por data), com resultado no final
        jogosComResultados.sort((a, b) => {
            // Jogos sem resultado vêm antes dos com resultado
            if (!a.resultado && b.resultado) return -1;
            if (a.resultado && !b.resultado) return 1;
            
            // Se ambos têm ou não têm resultado, ordena por data
            return new Date(a.dataHora) - new Date(b.dataHora);
        });
        
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);
        
        res.render('admin-resultados', {
            jogos: jogosComResultados,
            lang: lang,
            t: t,
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Erro ao carregar admin de resultados:', error);
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
 * Processa POST para salvar resultado de um jogo
 */
async function salvarResultadoJogo(req, res) {
    try {
        const { jogo_id, placar_time1, placar_time2, lang } = req.body;
        
        // Validação
        if (!jogo_id || placar_time1 === '' || placar_time2 === '') {
            return res.redirect('/admin/resultados?error=' + encodeURIComponent('Todos os campos são obrigatórios'));
        }
        
        const numJogoId = parseInt(jogo_id);
        const numPlacar1 = parseInt(placar_time1);
        const numPlacar2 = parseInt(placar_time2);
        
        if (isNaN(numJogoId) || isNaN(numPlacar1) || isNaN(numPlacar2)) {
            return res.redirect('/admin/resultados?error=' + encodeURIComponent('Valores inválidos'));
        }
        
        // Salva o resultado
        await salvarResultado(numJogoId, numPlacar1, numPlacar2);
        
        res.redirect('/admin/resultados?success=' + encodeURIComponent('Resultado salvo com sucesso!'));
    } catch (error) {
        console.error('Erro ao salvar resultado:', error);
        res.redirect('/admin/resultados?error=' + encodeURIComponent('Erro ao salvar resultado'));
    }
}

/**
 * Renderiza página com todas as apostas de um participante
 */
async function verApostasParticipante(req, res) {
    try {
        const nomeParticipante = req.params.nome;
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);

        const apostasParticipante = await lerApostasPorParticipante(nomeParticipante);
        const jogos = await lerJogos();
        const resultados = await lerResultados();

        const resultadosMap = {};
        resultados.forEach(r => {
            resultadosMap[r.jogo_id] = r;
        });

        const jogosMap = {};
        jogos.forEach(jogo => {
            jogosMap[jogo.id] = jogo;
        });

        const apostasCompletas = apostasParticipante.map(aposta => {
            const jogo = jogosMap[aposta.jogo_id];
            const resultado = resultadosMap[aposta.jogo_id] || null;
            const pontos = calcularPontos(aposta, resultado);

            return {
                ...aposta,
                jogo: jogo ? {
                    time1: jogo.time1,
                    time2: jogo.time2,
                    bandeira1: getBandeira(jogo.time1),
                    bandeira2: getBandeira(jogo.time2),
                    dataHoraFormatada: formatarDataJogo(jogo.dataHora)
                } : null,
                resultado: resultado,
                pontos: pontos
            };
        }).sort((a, b) => {
            if (!a.jogo || !b.jogo) return 0;
            return new Date(b.jogo.dataHora) - new Date(a.jogo.dataHora);
        });

        const estatisticas = {
            totalApostas: apostasCompletas.length,
            placaresExatos: apostasCompletas.filter(a => a.pontos === 3).length,
            resultadosCorretos: apostasCompletas.filter(a => a.pontos === 1).length,
            totalPontos: apostasCompletas.reduce((sum, a) => sum + a.pontos, 0)
        };

        res.render('participante', {
            nome: nomeParticipante,
            apostas: apostasCompletas,
            estatisticas: estatisticas,
            lang: lang,
            t: t
        });
    } catch (error) {
        console.error('Erro ao carregar apostas do participante:', error);
        const lang = req.lang || 'pt';
        const t = (key) => getTranslation(lang, key);
        res.status(500).render('error', {
            mensagem: t('errorLoadingGames'),
            lang: lang,
            t: t
        });
    }
}

module.exports = {
    index,
    fazerAposta,
    adminResultados,
    salvarResultadoJogo,
    verApostasParticipante
};
