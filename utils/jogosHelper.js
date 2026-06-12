const fs = require('fs').promises;
const path = require('path');

const JOGOS_FILE = path.join(__dirname, '..', 'data', 'jogos.json');

// Mapeamento de países para emojis de bandeira
const bandeiras = {
    'Alemanha': '🇩🇪',
    'Arábia Saudita': '🇸🇦',
    'Argentina': '🇦🇷',
    'Argélia': '🇩🇿',
    'Áustria': '🇦🇹',
    'Austrália': '🇦🇺',
    'África do Sul': '🇿🇦',
    'Bélgica': '🇧🇪',
    'Bósnia e Herzegovina': '🇧🇦',
    'Brasil': '🇧🇷',
    'Cabo Verde': '🇨🇻',
    'Canadá': '🇨🇦',
    'Catar': '🇶🇦',
    'Colômbia': '🇨🇴',
    'Coreia do Sul': '🇰🇷',
    'Costa do Marfim': '🇨🇮',
    'Croácia': '🇭🇷',
    'Curaçao': '🇨🇼',
    'Egito': '🇪🇬',
    'Equador': '🇪🇨',
    'Escócia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Espanha': '🇪🇸',
    'Estados Unidos': '🇺🇸',
    'França': '🇫🇷',
    'Gana': '🇬🇭',
    'Haiti': '🇭🇹',
    'Holanda': '🇳🇱',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Irã': '🇮🇷',
    'Iraque': '🇮🇶',
    'Japão': '🇯🇵',
    'Jordânia': '🇯🇴',
    'Marrocos': '🇲🇦',
    'México': '🇲🇽',
    'Nova Zelândia': '🇳🇿',
    'Noruega': '🇳🇴',
    'Panamá': '🇵🇦',
    'Paraguai': '🇵🇾',
    'Portugal': '🇵🇹',
    'República Democrática do Congo': '🇨🇩',
    'República Tcheca': '🇨🇿',
    'Senegal': '🇸🇳',
    'Suécia': '🇸🇪',
    'Suíça': '🇨🇭',
    'Tunísia': '🇹🇳',
    'Turquia': '🇹🇷',
    'Uzbequistão': '🇺🇿',
    'Uruguai': '🇺🇾'
};

/**
 * Retorna o emoji da bandeira do país
 * @param {string} pais - Nome do país
 * @returns {string} - Emoji da bandeira ou 🏳️ se não encontrado
 */
function getBandeira(pais) {
    return bandeiras[pais] || '🏳️';
}

/**
 * Lê os jogos do arquivo JSON
 * @returns {Promise<Array>} - Array de jogos
 */
async function lerJogos() {
    try {
        const conteudo = await fs.readFile(JOGOS_FILE, 'utf8');
        return JSON.parse(conteudo);
    } catch (error) {
        throw new Error(`Erro ao ler jogos: ${error.message}`);
    }
}

/**
 * Busca um jogo específico por ID
 * @param {number} id - ID do jogo
 * @returns {Promise<Object|null>} - Objeto do jogo ou null
 */
async function buscarJogoPorId(id) {
    const jogos = await lerJogos();
    return jogos.find(jogo => jogo.id === id) || null;
}

/**
 * Verifica se o jogo ainda permite apostas (data atual < data do jogo)
 * @param {string} dataHoraJogo - Data/hora do jogo em formato ISO 8601
 * @returns {boolean} - true se ainda permite apostas
 */
function permiteApostas(dataHoraJogo) {
    const agora = new Date();
    const dataJogo = new Date(dataHoraJogo);
    return agora < dataJogo;
}

/**
 * Formata a data do jogo para exibição
 * @param {string} dataHoraISO - Data em formato ISO
 * @returns {string} - Data formatada
 */
function formatarDataJogo(dataHoraISO) {
    const data = new Date(dataHoraISO);
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

module.exports = {
    lerJogos,
    buscarJogoPorId,
    permiteApostas,
    formatarDataJogo,
    getBandeira
};
