const RoPaSciModule = {
    label: "Rock Paper Scissors",
    order:3,
    noCheckTurnsOrder: true,
    defaultData: {
        initialStake: 100,
        variants: ['rock', 'paper', 'scissors'],
        bets: [],
        turns: []
    },
    hideOpponentData(game, req) {
        if (game.finishTime) return game;
        const data = game.data;
        for (const t of data.turns) {
            if (t.userId !== req.session.userId) t.turn = 'hidden'
        }

        game.data = data;
        return game;
    },


    hasWinners(game) {
        const data = game.data;
        if (data.turns.length !== game.players.length) return false;
        const plain = data.turns.map(t => t.turn);
        let variant;
        if (!plain.includes(this.defaultData.variants[0])) variant = this.defaultData.variants[2];
        if (!plain.includes(this.defaultData.variants[1])) variant = this.defaultData.variants[0];
        if (!plain.includes(this.defaultData.variants[2])) variant = this.defaultData.variants[1];
        if (data.turns[0].turn === data.turns[1].turn) variant = data.turns[0].turn;
        const winners = data.turns.filter(t => t.turn === variant);
        for (const w of winners) {
            game.winners.push(game.players.find(p => p.equals(w.userId)));
        }
        return true;
    },
    nextTurn(game, req) {
        console.log(game.players.map(p => p.id).indexOf(req.session.userId))
        return game.players.map(p => p.id).indexOf(req.session.userId) + 1;
    },
    getBank(game) {
        return Object.values(game.stakes).reduce((a, b) => a + b, 0)
    },

    doTurn(game, req) {
        const {turn} = req.body;
        const data = game.data;
        if (data.turns.map(t => t.userId).includes(req.session.userId)) return;
        data.turns.push({turn, userId: req.session.userId})
        game.data = data;
        return true
    },

    canJoin(game, req) {
        return game.players.length < 2;
    },
    onJoinDoTurn(game, req) {
        return false;
    },
    onLeave(game, req) {
        const data = game.data;
        data.turns = data.turns.filter(t => t.userId !== req.session.userId)
        game.data = data;
    },
    canLeave(game, req) {
        return true;
        //return game.data.turns.length === 0;
    },
    onBet() {

    },

}
export default RoPaSciModule