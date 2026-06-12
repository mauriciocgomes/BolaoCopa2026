/**
 * Sistema de bandeiras usando regional indicators (ISO 3166-1 alpha-2)
 * Funciona em todos os navegadores modernos
 */

// Mapeamento de países para códigos ISO de 2 letras
const codigosPais = {
    'Alemanha': 'DE',
    'Arábia Saudita': 'SA',
    'Argentina': 'AR',
    'Argélia': 'DZ',
    'Áustria': 'AT',
    'Austrália': 'AU',
    'África do Sul': 'ZA',
    'Bélgica': 'BE',
    'Bósnia e Herzegovina': 'BA',
    'Brasil': 'BR',
    'Cabo Verde': 'CV',
    'Canadá': 'CA',
    'Catar': 'QA',
    'Colômbia': 'CO',
    'Coreia do Sul': 'KR',
    'Costa do Marfim': 'CI',
    'Croácia': 'HR',
    'Curaçao': 'CW',
    'Egito': 'EG',
    'Equador': 'EC',
    'Escócia': 'GB',
    'Espanha': 'ES',
    'Estados Unidos': 'US',
    'França': 'FR',
    'Gana': 'GH',
    'Haiti': 'HT',
    'Holanda': 'NL',
    'Inglaterra': 'GB',
    'Irã': 'IR',
    'Iraque': 'IQ',
    'Japão': 'JP',
    'Jordânia': 'JO',
    'Marrocos': 'MA',
    'México': 'MX',
    'Nova Zelândia': 'NZ',
    'Noruega': 'NO',
    'Panamá': 'PA',
    'Paraguai': 'PY',
    'Portugal': 'PT',
    'República Democrática do Congo': 'CD',
    'República Tcheca': 'CZ',
    'Senegal': 'SN',
    'Suécia': 'SE',
    'Suíça': 'CH',
    'Tunísia': 'TN',
    'Turquia': 'TR',
    'Uzbequistão': 'UZ',
    'Uruguai': 'UY'
};

/**
 * Converte código ISO de 2 letras para emoji de bandeira
 * @param {string} codigo - Código ISO de 2 letras (ex: 'BR', 'DE')
 * @returns {string} - Emoji de bandeira
 */
function codigoParaBandeira(codigo) {
    if (!codigo || codigo.length !== 2) return '🏳️';
    
    // Converter letras para regional indicators
    // A = 0x1F1E6, B = 0x1F1E7, etc.
    const char1 = codigo.charCodeAt(0);
    const char2 = codigo.charCodeAt(1);
    
    // Verificar se são letras maiúsculas
    if (char1 < 65 || char1 > 90 || char2 < 65 || char2 > 90) {
        return '🏳️';
    }
    
    const regional1 = String.fromCodePoint(0x1F1E6 + (char1 - 65));
    const regional2 = String.fromCodePoint(0x1F1E6 + (char2 - 65));
    
    return regional1 + regional2;
}

/**
 * Retorna o emoji da bandeira do país
 * @param {string} pais - Nome do país
 * @returns {string} - Emoji da bandeira
 */
function getBandeira(pais) {
    const codigo = codigosPais[pais];
    if (!codigo) return '🏳️';
    return codigoParaBandeira(codigo);
}

module.exports = {
    getBandeira,
    codigoParaBandeira,
    codigosPais
};
