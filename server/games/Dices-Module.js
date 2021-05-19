const DicesModule = {
    defaultData: {
        hands: [],
        desk: [],
        bets: [],
        results: []
    },

    onJoin(game,req){
        const data = game.data;
        data.hands.push({userId: req.session.userId, dices:[1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0,2)})
        return data;
    },

    adaptGameForClients(game, req) {
        return game;
    },

    doTurn(game, req) {
        const {choice} = req.body;
        const data = game.data;
        //data.choices.push({choice, userId: req.session.userId})
        return data;
    }

}
export default DicesModule