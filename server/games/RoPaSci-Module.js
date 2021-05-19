const RoPaSciModule = {
    defaultData: {
        variants: ['rock', 'scissors', 'paper'],
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
    }

}
export default RoPaSciModule