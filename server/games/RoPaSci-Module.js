const RoPaSciModule = {
    label: "Rock Paper Scissors",
    defaultData: {
        variants: ['rock', 'scissors', 'paper'],
        bets: [],
        choices: []
    },
    adaptGameForClients(game, req) {
        return game;
    },

    doTurn(game, req) {
        const {choice} = req.body;
        const data = game.data;
        data.choices.push({choice, userId: req.session.userId})
        return data;
    },

    canJoin(game, req) {
        return true;
    },
    onJoin(game, req) {
        return true;
    },
}
export default RoPaSciModule