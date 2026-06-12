const { lerJogos, permiteApostas, formatarDataJogo } = require('../utils/jogosHelper');
const { lerApostasPorJogo, adicionarAposta } = require('../utils/csvHelper');

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
                    apostas: apostas
                };
            })
        );
        
        res.render('index', { 
            jogos: jogosCompletos,
            titulo: 'Bolão Copa 2026',
            error: req.query.error || null,
            success: req.query.success || null
        });
    } catch (error) {
        console.error('Erro ao carregar página inicial:', error);
        res.status(500).render('error', { 
            mensagem: 'Erro ao carregar jogos. Tente novamente mais tarde.' 
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
        if (!nome || !jogo_id || palpite_time1 === '' || palpite_time2 === '') {
            return res.redirect('/?error=Todos os campos são obrigatórios');
        }
        
        const numJogoId = parseInt(jogo_id);
        const numPalpite1 = parseInt(palpite_time1);
        const numPalpite2 = parseInt(palpite_time2);
        
        if (isNaN(numJogoId) || isNaN(numPalpite1) || isNaN(numPalpite2)) {
            return res.redirect('/?error=Valores inválidos');
        }
        
        // Verifica se o jogo existe e permite apostas
        const { lerJogos, permiteApostas, buscarJogoPorId } = require('../utils/jogosHelper');
        const jogos = await lerJogos();
        const jogo = jogos.find(j => j.id === numJogoId);
        
        if (!jogo) {
            return res.redirect('/?error=Jogo não encontrado');
        }
        
        if (!permiteApostas(jogo.dataHora)) {
            return res.redirect('/?error=Apostas encerradas para este jogo');
        }
        
        // Salva a aposta
        await adicionarAposta({
            nome: nome.trim(),
            jogo_id: numJogoId,
            palpite_time1: numPalpite1,
            palpite_time2: numPalpite2
        });
        
        res.redirect('/?success=Aposta registrada com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar aposta:', error);
        res.redirect('/?error=Erro ao salvar aposta. Tente novamente.');
    }
}

module.exports = {
    index,
    fazerAposta
};
