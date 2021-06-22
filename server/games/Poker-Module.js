import PokerApi from "./PokerApi";
import moment from "moment";

const PokerModule = {
    testMode: true,
    order: 2,
    label: 'Texas Hold`Em Poker',
    useWaitList: true,
    shiftFirstTurn: true,
    //noTimer: true,
    defaultData: {
        hands: {},
        desk: [],
        round: 0,
        roundName: 'pre-flop',
        finish: false,
        bets: [{}, {}, {}, {}, {}, {}],
        results: {},
        betActions: ['call', 'bet', 'check', 'ford'],
        initialStake: 100
    },
    rounds: ['blinds', 'pre-flop', 'flop', 'turn', 'river', 'finish'],

    get setTimer(){
        return !this.noTimer
    },

    onJoinDoTurn(game, req) {
        const data = game.data;
        let doTurn = false;
        if (game.players.length === 1) {
            //BIG blind
            req.body.bet = game.minBet * 2;
            doTurn = true;
            //console.log('BIG BLIND', req.body)
        } else if (game.players.length === 2) {
            //SMALL blind
            req.body.bet = game.minBet * 1;
            doTurn = true;
            //console.log('SMALL BLIND', req.body)
        }
        if(doTurn) data.bets[data.round][req.session.userId] = 0;
        if (game.module === 'Poker') {
            data.hands[req.session.userId] = PokerApi.randomSet(this._allCards(data), 2);
        } else {
            data.hands[req.session.userId] = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 2);
        }
        game.data = data;
        return doTurn;
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

    _sumBets(bets) {
        return Object.values(bets).reduce((a, b) => a + b, 0);
    },

    getBank(game) {
        let bank = 0;
        if (!game.data.bets) return;
        for (const round of game.data.bets) {
            bank += this._sumBets(round)
        }
        return bank;
    },
    onLeave(game, req) {
        const data = game.data;
        /*if(game.players.length === 1){
            game.activePlayerIdx = 1;
            game.activePlayerTime = 0;
            game.finishTime = 0;
            game.data = this.defaultData;
        }*/
        game.data = data;
    },
    canJoin(game, req) {
        return game.data.round === 0 && !(this._betsCount(game.data) > 1 && game.players.length < 2);
    },

    canLeave(game, req) {
        return true;
    },

    doFold(game,req){
        const player = game.players.find(p=>p.equals(req.session.userId));
        game.players = game.players.filter(p=>!p.equals(req.session.userId));
        if(this.useWaitList) game.waitList.push(player);
        if (game.players.length === 1) {
            game.winners = game.players;
        }
    },

    hasWinners(game) {
        const data = game.data;
        if (data.round > 4) {
            //console.log('FINISH');
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

    doTurn(game, req) {
        const {bet} = req.body;
        if (game.winners.length) {
            const message = `Cannot bet. There is winners "${game.name}"`
            console.log(message);
            return
        }
        console.log('BET', game.iamPlayer(req).name, bet)
        if (game.stakes[req.session.userId] < bet) {
            const message = 'Stake too low';
            return console.log('model bet error:', message);
        }
        if (bet < 0) return this.doFold(game,req);

        const data = game.data;

        const maxBet = Math.max.apply(null, Object.values(data.bets[data.round]));
        const beforeBet = data.bets[data.round][req.session.userId];

        if (req.body.bet >= 0) {
            if (!beforeBet) data.bets[data.round][req.session.userId] = 0;
            data.bets[data.round][req.session.userId] += req.body.bet * 1;
            if (data.bets[data.round][req.session.userId] < maxBet && !(game.activePlayerIdx === 0 && data.round === 0)) {
                return console.log( 'Bet too small. Min: ' + (maxBet - beforeBet) + ' Curr: ' + data.bets[data.round][req.session.userId])
            }
        }

        if ((this._isCall(game, data) && this._betsCount(data) > 1) || this._bigBlindCheck(game, data, req)) {
            game.activePlayerIdx = -1;
            data.round++;
            console.log('======== NEW ROUND ', this._roundName(data), data.round)
            data.roundName = this._roundName(data);
            if(data.round < 5) this._fillDesk(game, data);

        } else if (data.round === 0 && game.activePlayerIdx === 1 && game.players.length === 2) {
            console.log('small blind')
            game.activePlayerIdx = 0; // will be added +1 in model method
        }
        game.changeStake(req, game.stakes[req.session.userId] - bet)
        game.data = data;
        return {}
    },

    hideOpponentData(game, req) {
        //return game;
        const data = game.data;
        for (const k of Object.keys(data.hands)) {
            if (k !== req.session.userId) {
                data.hands[k] = [0, 0]
            }
        }
        if (data.round < 2)
            data.desk = Array(data.desk.length).fill(0)
        //data.hands = data.hands.filter(h=>h[req.session.userId])
        //game.data.hands = game.data.hands.map(h=>h.userId===req.session.userId? h :[0,0])
        game.data = data;
        return game;
    },

    _roundName(data) {
        return this.rounds[data.round];
    },

    _fillDesk(game, data) {
        if (data.round < 2) return;
        const amountOfCards = data.round === 2 ? 3 : 1;
        let newCards;
        if (game.module === 'Poker') {
            newCards = PokerApi.randomSet(this._allCards(data), amountOfCards);
        } else {
            newCards = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, amountOfCards);
        }
        data.desk = data.desk.concat(newCards)
        game.data = data;
    },

    _betsCount(data) {
        return Object.keys(data.bets[data.round]).length
    },

    _isCall(game, data) {
        let sums = Object.values(data.bets[data.round]);
        const unique = [...new Set(sums)];
        return sums.length === game.players.length && unique.length === 1
    },

}
export default PokerModule