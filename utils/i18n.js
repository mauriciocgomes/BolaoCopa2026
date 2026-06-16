const translations = {
    pt: {
        title: 'Bolão Copa 2026',
        subtitle: 'Faça seus palpites nos jogos abaixo!',
        yourName: 'Selecione seu nome:',
        namePlaceholder: 'Digite seu nome',
        placeBet: 'Fazer Aposta',
        betsRegistered: 'Apostas Registradas',
        noBets: 'Nenhuma aposta registrada ainda.',
        bettor: 'Apostador',
        betsOpen: 'Apostas Abertas',
        betsClosed: 'Apostas Encerradas',
        errorAllFields: 'Todos os campos são obrigatórios',
        errorInvalidValues: 'Valores inválidos',
        errorGameNotFound: 'Jogo não encontrado',
        errorBetsClosed: 'Apostas encerradas para este jogo',
        successBetRegistered: 'Aposta registrada com sucesso!',
        errorLoadingGames: 'Erro ao carregar jogos. Tente novamente mais tarde.',
        errorSavingBet: 'Erro ao salvar aposta. Tente novamente.',
        backToHome: 'Voltar para a Página Inicial',
        footer: 'Bolão Copa 2026 - Desenvolvido com Node.js e Express',
        langPortuguese: 'Português',
        langEnglish: 'Inglês',
        officialResult: 'Resultado Oficial',
        points: 'pts',
        pointsExact: 'Placar exato = 3 pts',
        pointsResult: 'Acertar resultado = 1 pt'
    },
    en: {
        title: 'World Cup 2026 Betting Pool',
        subtitle: 'Place your bets on the matches below!',
        yourName: 'Select your name:',
        namePlaceholder: 'Enter your name',
        placeBet: 'Place Bet',
        betsRegistered: 'Registered Bets',
        noBets: 'No bets registered yet.',
        bettor: 'Bettor',
        betsOpen: 'Bets Open',
        betsClosed: 'Bets Closed',
        errorAllFields: 'All fields are required',
        errorInvalidValues: 'Invalid values',
        errorGameNotFound: 'Game not found',
        errorBetsClosed: 'Bets are closed for this game',
        successBetRegistered: 'Bet registered successfully!',
        errorLoadingGames: 'Error loading games. Please try again later.',
        errorSavingBet: 'Error saving bet. Please try again.',
        backToHome: 'Back to Home Page',
        footer: 'World Cup 2026 Betting Pool - Developed with Node.js and Express',
        langPortuguese: 'Portuguese',
        langEnglish: 'English',
        officialResult: 'Official Result',
        points: 'pts',
        pointsExact: 'Exact score = 3 pts',
        pointsResult: 'Correct result = 1 pt'
    }
};

function getTranslation(lang, key) {
    return translations[lang]?.[key] || translations['pt'][key] || key;
}

function getSupportedLanguages() {
    return ['pt', 'en'];
}

module.exports = {
    translations,
    getTranslation,
    getSupportedLanguages
};
