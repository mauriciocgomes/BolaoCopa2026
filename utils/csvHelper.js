const fs = require('fs').promises;
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'data', 'apostas.csv');
const CSV_HEADER = 'nome,jogo_id,palpite_time1,palpite_time2,data_aposta\n';

/**
 * Adiciona uma aposta ao arquivo CSV
 * @param {Object} aposta - Objeto com dados da aposta
 * @returns {Promise<void>}
 */
async function adicionarAposta(aposta) {
    const linha = `${aposta.nome},${aposta.jogo_id},${aposta.palpite_time1},${aposta.palpite_time2},${new Date().toISOString()}\n`;
    
    try {
        // Tenta verificar se o arquivo existe
        try {
            await fs.access(CSV_FILE);
            // Arquivo existe, apenas adiciona a linha
            await fs.appendFile(CSV_FILE, linha, 'utf8');
        } catch {
            // Arquivo não existe, cria com cabeçalho
            await fs.writeFile(CSV_FILE, CSV_HEADER + linha, 'utf8');
        }
    } catch (error) {
        throw new Error(`Erro ao salvar aposta: ${error.message}`);
    }
}

/**
 * Lê todas as apostas do arquivo CSV
 * @returns {Promise<Array>} - Array de objetos com as apostas
 */
async function lerApostas() {
    try {
        await fs.access(CSV_FILE);
        const conteudo = await fs.readFile(CSV_FILE, 'utf8');
        
        const linhas = conteudo.trim().split('\n');
        // Remove o cabeçalho
        const linhasDados = linhas.slice(1);
        
        return linhasDados
            .filter(linha => linha.trim() !== '')
            .map(linha => {
                const [nome, jogo_id, palpite_time1, palpite_time2, data_aposta] = linha.split(',');
                return {
                    nome: nome.trim(),
                    jogo_id: parseInt(jogo_id),
                    palpite_time1: parseInt(palpite_time1),
                    palpite_time2: parseInt(palpite_time2),
                    data_aposta: data_aposta ? data_aposta.trim() : null
                };
            });
    } catch {
        // Arquivo não existe, retorna array vazio
        return [];
    }
}

/**
 * Lê apostas de um jogo específico
 * @param {number} jogoId - ID do jogo
 * @returns {Promise<Array>} - Array de apostas para o jogo
 */
async function lerApostasPorJogo(jogoId) {
    const todasApostas = await lerApostas();
    return todasApostas.filter(aposta => aposta.jogo_id === jogoId);
}

module.exports = {
    adicionarAposta,
    lerApostas,
    lerApostasPorJogo
};
