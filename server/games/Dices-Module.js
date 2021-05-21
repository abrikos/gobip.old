const DicesModule = {
    defaultData: {
        hands: {},
        desk: [],
        round: 0,
        waitList:[],
        roundName: 'pre-flop',
        finish: false,
        bets: [{}, {}, {}, {}],
        results: {},
        betActions: ['call', 'bet', 'check', 'ford'],
        minBet: process.env.GAME_MIN_BET,
        initialStake: 100
    },
    rounds: ['pre-flop', 'flop', 'turn', 'river', 'finish'],

    onJoin(game, req) {
        const data = game.data;
        if (game.players.length === 1) {
            //BIG blind
            req.body.bet = data.minBet * 2;
            //console.log('BIG BLIND', req.body)
        } else if (game.players.length === 2) {
            //SMALL blind
            req.body.bet = data.minBet * 1;
            //console.log('SMALL BLIND', req.body)
        }
        data.bets[data.round][req.session.userId] = 0;
        data.hands[req.session.userId] = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 2);
        game.data = data;
    },

    nextTurn(game,req){
        const data = game.data;
        game.activePlayerIdx++;
        if (game.activePlayerIdx >= game.players.length - data.waitList.length && game.players.length >= 2) {
            game.activePlayerIdx = 0;
        }
        const sumBets = Object.values(data.bets[data.round]).reduce((a,b)=>a+b,0);
        const smallBlindSum = data.minBet * 3;
        if(sumBets === smallBlindSum) game.activePlayerIdx = 1;
        game.data = data;
    },

    checkTurn(game, req) {
        if (!game.activePlayer.equals(req.session.userId)) return {error: 500, message: 'Not you turn'}
        return {}
    },

    canJoin(game, req){
        const data = game.data;
        const canJoin = data.round === 0 && !(Object.keys(data.bets[0]).length>1 && game.activePlayerIdx ===0);
        if(!canJoin) data.waitList.push(req.session.userId);
        game.data = data;
        return canJoin;

    },

    onBet(game, req) {
        const data = game.data;
        //const roundName = this.defaultData.rounds[data.round];
        //data[`${roundName}Bets`].push({userId, bet});
        data.bets[data.round][req.session.userId] = req.body.bet * 1 + data.bets[data.round][req.session.userId] * 1;
        /*if (this._isCall(game)) {
            if (!data.round) {

            }
            data.round++;
            data.roundName = this.rounds[data.round];
            if (data.round >= 4) {
                data.finish = true;
            }
        }*/
        //data.choices.push({choice, userId: req.session.userId})
        //return {status:502, message:'aaaaaa', error:true}
        game.data = data;
    },


    adaptGameForClients(game, req) {
        return game;
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

    roundName(game){
        return this.rounds[game.data.round];
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