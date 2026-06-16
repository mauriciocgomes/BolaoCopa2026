const fs = require('fs').promises;
const path = require('path');

const RESULTADOS_FILE = path.join(__dirname, '..', 'data', 'resultados.csv');

/**
 * Lê todos os resultados do arquivo CSV
 * @returns {Promise<Array>} - Array de resultados
 */
async function lerResultados() {
    try {
        const conteudo = await fs.readFile(RESULTADOS_FILE, 'utf8');
        const linhas = conteudo.trim().split('\n');
        
        // Remove o cabeçalho
        if (linhas.length <= 1) return [];
        
        const resultadoLinhas = linhas.slice(1);
        
        return resultadoLinhas.map(linha => {
            const [jogo_id, placar_time1, placar_time2, data_atualizacao] = linha.split(',');
            return {
                jogo_id: parseInt(jogo_id),
                placar_time1: parseInt(placar_time1),
                placar_time2: parseInt(placar_time2),
                data_atualizacao
            };
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Arquivo não existe, retorna array vazio
            return [];
        }
        throw new Error(`Erro ao ler resultados: ${error.message}`);
    }
}

/**
 * Busca resultado de um jogo específico
 * @param {number} jogoId - ID do jogo
 * @returns {Promise<Object|null>} - Resultado ou null
 */
async function buscarResultadoPorJogo(jogoId) {
    const resultados = await lerResultados();
    return resultados.find(r => r.jogo_id === jogoId) || null;
}

/**
 * Salva ou atualiza o resultado de um jogo
 * @param {number} jogoId - ID do jogo
 * @param {number} placarTime1 - Gols do time 1
 * @param {number} placarTime2 - Gols do time 2
 */
async function salvarResultado(jogoId, placarTime1, placarTime2) {
    const resultados = await lerResultados();
    
    // Remove resultado existente do mesmo jogo
    const resultadosFiltrados = resultados.filter(r => r.jogo_id !== jogoId);
    
    // Adiciona novo resultado
    const novoResultado = {
        jogo_id: jogoId,
        placar_time1: placarTime1,
        placar_time2: placarTime2,
        data_atualizacao: new Date().toISOString()
    };
    
    resultadosFiltrados.push(novoResultado);
    
    // Salva no arquivo
    const header = 'jogo_id,placar_time1,placar_time2,data_atualizacao';
    const linhas = resultadosFiltrados.map(r => 
        `${r.jogo_id},${r.placar_time1},${r.placar_time2},${r.data_atualizacao}`
    );
    
    const conteudo = [header, ...linhas].join('\n') + '\n';
    await fs.writeFile(RESULTADOS_FILE, conteudo, 'utf8');
    
    return novoResultado;
}

module.exports = {
    lerResultados,
    buscarResultadoPorJogo,
    salvarResultado
};
