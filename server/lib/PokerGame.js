import Mongoose from "../db/Mongoose";
import PokerApi from "./PokerApi";

const randomWords = require('random-words');
const PokerGame = {
    async create(userId, type) {
        const poker = new Mongoose.poker({user: userId})
        //poker.desk = PokerApi.randomSet([], 5);
        poker.type = type;
        poker.user = await Mongoose.user.findById(userId);
        poker.userCards = PokerApi.randomSet(poker.allCards, 2);
        poker.opponentCards = PokerApi.randomSet(poker.allCards, 2);

        const bet = await poker.makeBet(poker.blind, userId)
        if (bet.error) throw bet;
        poker.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0]
        await poker.save()
        return poker;
    },

    async join(id, userId) {
        const poker = await Mongoose.poker.findById(id)
        if (poker.result) throw {message: "Game closed"};
        poker.opponent = await Mongoose.user.findById(userId)
        const bet = await poker.makeBet(poker.blind / 2, userId)
        if (bet.error) throw bet
        await poker.save();
        return poker;

    },

    async bet(id, userId, BET) {

        if (!(BET >= 0)) throw {message: 'POST: wrong bet'};
        const poker = await Mongoose.poker.findById(id)
            .populate('user')
            .populate('opponent')
        if (poker.result) throw {message: 'Game closed'}
        if (BET < poker.minBet && !poker.isCall) throw {message: 'Bet too small. Min ' + poker.minBet}
        if (!poker.playerTurn === userId) throw {message: 'Not your turn'};
        if (!poker.isPlayer(userId)) throw {message: 'You are not a player'};

        const bet = await poker.makeBet(BET, userId)
        if (bet.error) throw bet
        console.log(`..........  BET ${poker.turn}`, BET, 'userSum', poker.userSum, 'oppsum', poker.opponentSum)
        poker.turn = poker.otherPlayer

        if (poker.isCall) {
            if (poker.opponentBets.length === 2 && poker.userBets.length === 1) {
                poker.turn = 'user';
            } else {
                if ((poker.userBets.length === 1 && poker.opponentBets.length === 1) || poker.userSum > 0)
                    poker.status = 'new-round';
            }
        }

        if (poker.status === 'new-round') {
            poker.status = 'round-started';
            poker.turn = 'user';
            poker.bank += poker.userSum + poker.opponentSum;
            console.log(poker.bank)
            poker.userBets = [];
            poker.opponentBets = [];
            poker.desk = poker.desk.concat(PokerApi.randomSet(poker.allCards, poker.desk.length ? 1 : 3));
            console.log('NEW ROUND', poker.round)
        }
        if (poker.round === 'finish') {
            poker.setWinner()
            console.log('EEEEEEEEEEEEEEEEEEEEEEEE',)
        }
        await poker.save();
        return poker;
    },

    async test() {
        try {
            const user = process.env.POKER_USER;
            const opponent = process.env.POKER_OPPONENT;
            let poker = await this.create(user, 'virtual')
            poker = await this.join(poker.id, opponent);
            //================================================
            poker = await this.bet(poker.id, opponent, 5);
            poker = await this.bet(poker.id, user, 0);

            //return
            poker = await this.bet(poker.id, user, 0);
            poker = await this.bet(poker.id, opponent, 20);
            poker = await this.bet(poker.id, user, 20);
        } catch (e) {
            console.log('ERRRR', e.message)
        }

    }
}

PokerGame.test()
export default PokerGame;