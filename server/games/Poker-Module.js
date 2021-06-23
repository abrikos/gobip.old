import PokerApi from "./PokerApi";

const PokerModule = {
    testMode: true,
    order: 2,
    label: 'Texas Hold`Em Poker',
    useWaitList: true,
    shiftFirstTurn: true,
    useTimer: true,
    roundsCount: 6,
    initialStake: 100,
    defaultData: {
        hands: {},
        desk: [],
        roundName: 'pre-flop',
        finish: false,
        //bets: [{}, {}, {}, {}, {}, {}],
        results: {},
        betActions: ['call', 'bet', 'check', 'ford'],

    },
    rounds: ['blinds', 'pre-flop', 'flop', 'turn', 'river', 'finish'],

    onJoin(game, userId) {
        const data = game.data;
        let doTurn = false;
        if (game.players.length === 2) {
            //SMALL blind
            this.doTurn(game, game.players[0].id, {turn: {bet: game.minBet}})
            this.doTurn(game, game.players[1].id, {turn: {bet: game.minBet / 2}})
            game.activePlayerIdx = 1;
        }

        //if (doTurn) this._insertBet(game, req, 0);
        if (game.module === 'Poker') {
            data.hands[userId] = PokerApi.randomSet(this._allCards(data), 2);
        } else {
            data.hands[userId] = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        game.data = data;
    },

    _insertBet(game, userId, value) {
        game.bets.push({round: game.round, userId: userId, value})

    },

    _allCards(data) {
        let allHands = data.desk;
        for (const userId in data.hands) {
            allHands = allHands.concat(data.hands[userId])
        }
        return allHands
    },

    _playerBet(game, userId) {
        return game.playersBets[userId];
    },

    _bigBlindCheck(game, data, userId) {
        return game.activePlayerIdx === 0 && game.round === 1 && !this._playerBet(game, userId)
    },

    getBank(game) {
        let bank = 0;
        for (const bet of game.bets) {
            bank += bet.value
        }
        return bank;
    },
    onLeave(game, userId) {
        const data = game.data;
        /*if(game.players.length === 1){
            game.activePlayerIdx = 1;
            game.activePlayerTime = 0;
            game.finishTime = 0;
            game.data = this.defaultData;
        }*/
        game.data = data;
    },

    canJoin(game) {
        return game.bets.map(b => b.value).reduce((a, b) => a + b, 0) <= game.minBet * 1.5;
    },

    canLeave(game, req) {
        return true;
    },

    doFold(game, userId) {
        console.log('doFold');
        const player = game.players.find(p => p.equals(userId));
        game.players = game.players.filter(p => !p.equals(userId));
        if (this.useWaitList) game.waitList.push(player);
        if (game.players.length === 1) {
            game.winners = game.players;
        }
    },

    hasWinners(game) {
        const data = game.data;
        if (game.round > 4) {
            console.log('===============FINISH');
            let maxPriority = 0;
            let maxSum = 0;
            for (const c in data.hands) {
                const h = data.hands[c];
                const res = PokerApi.calc(h, data.desk);
                if (res.priority > maxPriority) maxPriority = res.priority;
                if (res.sum > maxSum) maxSum = res.sum;
                data.results[c] = res;
            }
            let winners = Object.keys(data.results).filter(k => data.results[k].priority === maxPriority)
            if (winners.length > 1)
                winners = winners.filter(k => data.results[k].sum === maxSum);
            game.winners = game.players.filter(p => winners.includes(p.id));
        }
        game.data = data;
        return game.winners.length;
    },

    _roundBets(game) {
        return game.bets.filter(b => b.round === game.round)
    },

    doTurn(game, userId, body) {
        const {bet} = body.turn;
        if (game.winners.length) {
            const message = `Cannot bet. There is winners "${game.name}"`
            console.log(message);
            return
        }
        console.log('BET', game.iamPlayer(userId).name, bet)
        if (game.stakes[userId] < bet) {
            const message = 'Stake too low';
            return console.log('model bet error:', message);
        }
        if (bet < 0) return this.doFold(game, userId);

        const data = game.data;


        const maxBet = game.maxBet;
        if (bet >= 0) {
            //if (!beforeBet) this._insertBet(game, req, 0);
            if (game.playersBets[userId] + bet < maxBet && !(game.activePlayerIdx === 0 && game.round === 0)) {
                return {error:'Call to ' + (maxBet) + ', or rise. Your bet: ' + bet}
            }
            this._insertBet(game, userId, bet * 1)
        }
        if ((this._isCall(game, data) && this._betsCount(game) > 1) || this._bigBlindCheck(game, data, userId)) {
            game.activePlayerIdx = -1;
            game.round++;
            console.log('======== NEW ROUND ', this._roundName(game), game.round)
            data.roundName = this._roundName(game);
            if (game.round < 5) this._fillDesk(game, data);

        } else if (game.round === 0 && game.activePlayerIdx === 1 && game.players.length === 2) {
            console.log('small blind do bet')
            //game.activePlayerIdx = 0; // will be added +1 in model method
        }
        if(game.round===2 && game.activePlayerIdx === -1 ){
            game.activePlayerIdx = 0
        }

        game.changeStake(userId, game.stakes[userId] - bet)
        game.data = data;
        return {}
    },

    hideOpponentData(game, userId) {
        //return game;
        const data = game.data;
        for (const k of Object.keys(data.hands)) {
            if (k !== userId) {
                data.hands[k] = [0, 0]
            }
        }
        if (game.round < 2)
            data.desk = Array(data.desk.length).fill(0)
        //data.hands = data.hands.filter(h=>h[userId])
        //game.data.hands = game.data.hands.map(h=>h.userId===userId? h :[0,0])
        game.data = data;
        return game;
    },

    _roundName(game) {
        return this.rounds[game.round];
    },

    _fillDesk(game, data) {
        if (game.round < 2) return;
        const amountOfCards = game.round === 2 ? 3 : 1;
        let newCards;
        if (game.module === 'Poker') {
            newCards = PokerApi.randomSet(this._allCards(data), amountOfCards);
        } else {
            newCards = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, amountOfCards);
        }
        data.desk = data.desk.concat(newCards)
        game.data = data;
    },

    _betsCount(game) {
        return this._roundBets(game).length
    },

    _isCall(game, data) {
        let sums = Object.values(game.playersBets);
        const unique = [...new Set(sums)];
        return sums.length === game.players.length && unique.length === 1
    },

}
export default PokerModule