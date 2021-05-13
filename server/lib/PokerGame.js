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
        const bet = await poker.makeBet(process.env.POKER_SMALL_BLINDE * 2, userId)
        if (bet.error) throw bet.error;
        poker.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0]
        await poker.save()
        return poker;
    },

    async join(id, userId) {
        const poker = await Mongoose.poker.findById(id)
        if (poker.result) throw "Game closed";
        poker.opponent = await Mongoose.user.findById(userId)
        const bet = await poker.makeBet(process.env.POKER_SMALL_BLINDE, userId)
        if (bet.error) throw bet.error
        await poker.save();
        return poker;

    },

    async bet(id, userId, BET) {
        console.log('------------')
        if (!(BET >= 0)) throw'POST: wrong bet';
        const poker = await Mongoose.poker.findById(id)
            .populate('user')
            .populate('opponent')
        if (poker.result) throw'Game closed'
        if (BET < poker.minBet && !poker.isCall) throw 'Bet too small. Min ' + poker.minBet
        if (!poker.playerTurn.equals(userId)) throw'Not your turn'
        if (!poker.isPlayer(userId)) throw 'You are not a player'

        if (BET > 0) {
            console.log('BET', BET)
            const bet = await poker.makeBet(BET, userId)
            if (bet.error) throw bet.error

            if (poker.minBet
            ) {
                //Raise
                poker.checks = 1;
            } else {
                //Cala
                if (!poker.isflop) poker.checks++;
            }
        } else {
            if (!poker.isflop) poker.checks++;
        }

        console.log('CHEKS', poker.checks, 'IsFlop', poker.isflop)

        if (poker.checks === 2) {
            console.log('CALL (2 checks)')
            poker.playerTurn = poker.user;
            poker.desk = poker.desk.concat(PokerApi.randomSet(poker.allCards, poker.desk.length ? 1 : 3));
        }


        /* if (0) {
             poker.bargain = true;
             console.log('bargain on BET', poker.bargain)
             poker.playerTurn = poker.getOtherPlayer(userId);
             console.log('SWITCH TURN on BET', poker.playerTurn.name)
             console.log('IS call', poker.isCall)

             if (poker.isCall && poker.desk.length) poker.bargain = false;
         } else {
             poker.bargain = false;
             console.log('bargain on CHEK', poker.bargain)
             poker.playerTurn = poker.desk.length ? poker.getOtherPlayer(userId) : poker.user;
             console.log('SWITCH TURN on CHECK', poker.playerTurn.name)


         }*/


        if (poker.desk.length === 5 && !poker.bargain) {
            poker.setWinner()
            console.log('EEEEEEEEEEEEEEEEEEEEEEEE',)

        }
        await poker.save();
        return poker;
    },

    async test() {
        const user = '6099e5f877de382dfb5b62dc';
        const opponent = '6099e55eb46b362b5157465c';
        let poker = await this.create(user, 'virtual')
        poker = await this.join(poker.id, opponent);
        poker = await this.bet(poker.id, opponent, 15);
        console.log('MinBet', poker.status)
    }
}

PokerGame.test()
export default PokerGame;