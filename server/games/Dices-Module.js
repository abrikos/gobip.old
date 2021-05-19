const DicesModule = {
    defaultData: {
        hands: {},
        desk: [],
        activePlayer: 0,
        round: 0,
        roundName: 'pre-flop',
        finish: false,
        bets: [{}, {}, {}, {}],
        /*preBets: [],
        flopBets: [],
        turnBets: [],
        riverBets: [],
        results: [],*/
        betActions: ['call', 'bet', 'check', 'ford'],
        minBet: process.env.GAME_MIN_BET
    },
    rounds: ['pre-flop', 'flop', 'turn', 'river', 'finish'],

    onJoin(game, req) {
        const data = game.data;
        let bet = req.body.bet * 1;
        if (Object.keys(data.bets[0]).length === 0) {
            //BIG blind
            bet = data.minBet * 2;
            data.bets[0][req.session.userId] = bet;
            data.activePlayer++;
        } else if (Object.keys(data.bets[0]).length === 1) {
            //SMALL blind
            bet = data.minBet * 1;
            data.bets[0][req.session.userId] = bet;
        }else{
            data.bets[data.round][req.session.userId] = 0;
        }
        data.hands[req.session.userId] = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 2);
        return data;
    },

    doBet(game, req) {
        if(!game.activePlayer.equals( req.session.userId)) return {error:500, message:'Not you turn'}
        const data = game.data;
        //const roundName = this.defaultData.rounds[data.round];
        //data[`${roundName}Bets`].push({userId, bet});
        data.bets[data.round][req.session.userId] = req.body.bet * 1 + data.bets[data.round][req.session.userId] * 1;
        data.activePlayer = data.activePlayer >= game.players.length - 1 ? 0 : data.activePlayer + 1;
        if (this._isCall(game)) {
            data.activePlayer = 0;
            if (!data.round) {

            }
            data.round++;
            data.roundName = this.rounds[data.round];
            if (data.round >= 4) {
                data.finish = true;
            }
        }
        //data.choices.push({choice, userId: req.session.userId})
        //return {status:502, message:'aaaaaa', error:true}
        return data;
    },


    _iamPlayer(game, req) {
        return game.players.map(p => p.id).indexOf(req.session.userId);
    },

    adaptGameForClients(game, req) {
        const data = game.data;
        for (const k of Object.keys(data.hands)) {
            if (k !== req.session.userId) {
                data.hands[k] = [0, 0]
            }
        }
        //data.hands = data.hands.filter(h=>h[req.session.userId])
        //game.data.hands = game.data.hands.map(h=>h.userId===req.session.userId? h :[0,0])
        game.data = data;
        return game;
    },




    _fillDesk(game, roundName) {

    },

    _isCall(game) {
        let sums = [];
        for (const p of game.players) {
            sums.push(game.data.bets[game.data.round][p.id]);
        }
        const unique = [...new Set(sums)];
        return unique.length === 1
    },

}
export default DicesModule