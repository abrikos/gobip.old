import PokerApi from "./PokerApi";

const PokerModule = {
    defaultData: {
        hands: {},
        desk: [],
        round: 0,
        roundName: 'pre-flop',
        finish: false,
        bets: [{}, {}, {}, {}],
        results: {},
        betActions: ['call', 'bet', 'check', 'ford'],
        minBet: process.env.GAME_MIN_BET,
        initialStake: 100
    },
    rounds: ['blinds', 'pre-flop', 'flop', 'turn', 'river', 'finish'],

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
        if (game.module === 'Poker') {
            data.hands[req.session.userId] = PokerApi.randomSet(this._allCards(data), 2);
        } else {
            data.hands[req.session.userId] = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        game.data = data;
    },

    _allCards(data) {
        let allHands = data.desk;
        for (const userId in data.hands) {
            allHands = allHands.concat(data.hands[userId])
        }
        return allHands
    },

    _bigBlindCheck(game, data, req) {
        return game.activePlayerIdx === 0 && data.round === 1 && !data.bets[data.round][req.session.userId]
    },

    nextTurn(game, req) {
        const data = game.data;
        if (this._bigBlindCheck(game, game.data, req)) {
            game.activePlayerIdx = 0;
        } else {

            game.activePlayerIdx++;
            if (game.activePlayerIdx >= game.players.length - game.waitList.length && game.players.length >= 2) {
                game.activePlayerIdx = 0;
            }
            const sumBets = this._sumBets(data.bets[data.round]);
            const smallBlindSum = data.minBet * 3;
            if (sumBets === smallBlindSum && data.round === 0) game.activePlayerIdx = 1;
        }
        game.data = data;
    },

    _sumBets(bets) {
        return Object.values(bets).reduce((a, b) => a + b, 0);
    },

    checkTurn(game, req) {
        if (!game.activePlayer.equals(req.session.userId)) return {error: 500, message: 'Not you turn'}
        return {}
    },

    canJoin(game, req) {
        return game.data.round === 0 && !(this._betsCount(game.data) > 1 && game.activePlayerIdx === 0);
    },

    onBet(game, req) {
        const data = game.data;
        const maxBet = Math.max.apply(null, Object.values(data.bets[data.round]));
        const beforeBet = data.bets[data.round][req.session.userId];
        //if (!beforeBet) data.bets[data.round][req.session.userId] = 0;
        data.bets[data.round][req.session.userId] += req.body.bet * 1;
        if (data.bets[data.round][req.session.userId] < maxBet && !(game.activePlayerIdx === 1 && data.round === 0))
            return {error: 'Bet too small. Min: ' + (maxBet - beforeBet) + ' Curr: ' + data.bets[data.round][req.session.userId]}
        if ((this._isCall(data) && this._betsCount(data) > 1) || this._bigBlindCheck(game, data, req)) {
            game.activePlayerIdx = 0;
            data.round++;
            this._fillDesk(game);
            for (const p of game.players.filter(p => !game.waitList.includes(p.id))) {
                data.bets[data.round][p.id] = 0;
            }
            console.log('========', this._roundName(data), data.round)
            data.roundName = this._roundName(data);
            if (data.round >= 4) {
                data.finish = true;
            }
        }
        game.data = data;
        return {}
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
    },

    _calcBank(data) {
        let bank = 0;
        for (const b of data.bets) {
            bank += this._sumBets(b);
        }
        return bank;
    },

    _roundName(data) {
        return this.rounds[data.round];
    },

    _fillDesk(game) {
        const data = game.data;
        if (data.round < 2) return;
        const amountOfCards = data.round === 2 ? 3 : 1;
        if (game.module === 'Poker') {
            data.desk = PokerApi.randomSet(this._allCards(data), amountOfCards);
        } else {
            data.desk = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, amountOfCards);
        }
        game.data = data;
    },

    _betsCount(data) {
        return Object.keys(data.bets[data.round]).length
    },

    _isCall(data) {
        let sums = Object.values(data.bets[data.round]);
        const unique = [...new Set(sums)];
        return unique.length === 1
    },

}
export default PokerModule