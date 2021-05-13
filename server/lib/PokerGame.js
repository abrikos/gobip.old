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
        if (bet.error) throw bet.error;
        poker.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0]
        await poker.save()
        return poker;
    },

    async join(id, userId) {
        const poker = await Mongoose.poker.findById(id)
        if (poker.result) throw "Game closed";
        poker.opponent = await Mongoose.user.findById(userId)
        const bet = await poker.makeBet(poker.blind/2, userId)
        if (bet.error) throw bet.error
        await poker.save();
        return poker;

    },

    async bet(id, userId, BET) {

        if (!(BET >= 0)) throw 'POST: wrong bet';
        const poker = await Mongoose.poker.findById(id)
            .populate('user')
            .populate('opponent')
        console.log(`..........  BET ${poker.turn}`, BET )
        if (poker.result) throw'Game closed'
        if (BET < poker.minBet && !poker.isCall) throw 'Bet too small. Min ' + poker.minBet
        if (!poker.playerTurn.equals(userId)) throw'Not your turn'
        if (!poker.isPlayer(userId)) throw 'You are not a player'

        const bet = await poker.makeBet(BET, userId)
        //console.log('          Bet now:',poker[`${poker.turn}Sum`])
        if (bet.error) throw bet.error

        poker.turn = poker.otherPlayer
        //console.log('    Call ',poker.isCall, poker.opponentBets.length ,  poker.userBets.length)

        if(poker.isCall) {
            if (poker.opponentBets.length === 2 && poker.userBets.length === 1) {
                poker.turn = 'user';
            } else {
                poker.status = 'new-round';
            }
        }

        if (poker.status === 'new-round') {
            poker.status = 'round-started';
            poker.turn = 'user';
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
        //const user = '6099e5f877de382dfb5b62dc';
        //const opponent = '6099e55eb46b362b5157465c';
        const user = process.env.POKER_USER;
        const opponent = process.env.POKER_OPPONENT;
        let poker = await this.create(user, 'virtual')
        poker = await this.join(poker.id, opponent);

        poker = await this.bet(poker.id, opponent, 15);
        poker = await this.bet(poker.id, user, 10);
        //TODO Call situation, but not waiting turn of opponent
        poker = await this.bet(poker.id, user, 0);
        poker = await this.bet(poker.id, opponent, 20);
        poker = await this.bet(poker.id, user, 20);
return



        poker = await this.bet(poker.id, user, 13);
        poker = await this.bet(poker.id, opponent, 20);
        poker = await this.bet(poker.id, user, 7);
        //poker = await this.bet(poker.id, opponent, 10);
console.log(poker.userSum, poker.opponentSum)
        return
        poker = await this.bet(poker.id, user, 0);
        poker = await this.bet(poker.id, opponent, 0);

        poker = await this.bet(poker.id, user, 0);
        poker = await this.bet(poker.id, opponent, 0);
    }
}

PokerGame.test()
export default PokerGame;