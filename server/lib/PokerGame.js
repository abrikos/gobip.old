import Mongoose from "../db/Mongoose";
import PokerApi from "../games/PokerApi";
import moment from "moment";
import randomWords from 'random-words';
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
        return poker.save()
    },

    async join(id, userId) {
        const poker = await Mongoose.poker.findById(id)
        if (poker.result) throw {message: "Game closed"};
        poker.opponent = await Mongoose.user.findById(userId)
        const bet = await poker.makeBet(poker.blind / 2, userId)
        if (bet.error) throw bet
        poker.timer = moment().unix();
        return poker.save();
    },

    async again(id, userId) {
        const poker = await Mongoose.poker.findById(id)
        const who = poker.who(userId)
        poker[`${who}Again`] = true;
        await poker.save();
        if (!poker.result) throw {message: "Game online"};
        //console.log('again?', poker.userAgain, poker.opponentAgain)
        if (poker.userAgain && poker.opponentAgain) {
            const newPoker = await this.create(poker.opponent, poker.type);
            await this.join(newPoker.id, poker.user);
            poker.pokerAgainId = newPoker.id;
            poker.save()
        }
    },

    async checkFold(){
        const pokers = await Mongoose.poker.find({opponent:{$ne: null}, result:null})
            .populate(['user', 'opponent'])
        for(const poker of pokers){
            if (poker.isPlaying && poker.secondsLeft <= 0) {
                poker.doFold()
                poker.save()
            }
        }
    },

    async bet(id, userId, BET) {
        const poker = await Mongoose.poker.findById(id)
            .populate('user')
            .populate('opponent')

        if (!(BET >= 0)) {
            await poker.doFold()
            return poker.save()
        }
        if (poker.result) throw {message: 'Game closed'}
        if (BET < poker.minBet && !poker.isCall) throw {message: 'Bet too small. Min ' + poker.minBet}
        if (!poker.playerTurn === userId) throw {message: 'Not your turn'};
        if (!poker.isPlayer(userId)) throw {message: 'You are not a player'};

        const bet = await poker.makeBet(BET, userId)
        if (bet.error) throw bet
        //console.log(`..........  BET ${poker.turn}`, BET, 'userSum', poker.userSum, 'oppsum', poker.opponentSum)
        poker.turn = poker.otherPlayer

        if (poker.isCall) {
            if (poker.opponentBets.length === 2 && poker.userBets.length === 1) {
                poker.turn = 'user';
            } else {
                if ((poker.opponentBets.length === 1 && poker.userBets.length === 1) || poker.userSum > 0)
                    poker.status = 'new-round';
            }
        }

        if (poker.round === 'river' && poker.status === 'new-round') {
            poker.fillBank()
            poker.calcWinner()
            console.log('Winner Set',)
        }else if (poker.status === 'new-round') {
            poker.status = 'round-started';
            poker.turn = 'user';
            poker.fillBank()
            poker.desk = poker.desk.concat(PokerApi.randomSet(poker.allCards, poker.desk.length ? 1 : 3));
            console.log('NEW ROUND', poker.round)
        }

        poker.timer = moment().unix();
        return poker.save();
    },

    runTest: false,
    async test() {
        try {
            console.log('start test')
            const user = process.env.POKER_USER;
            const opponent = process.env.POKER_OPPONENT;
            let poker = await this.create(user, 'virtual')
            poker = await this.join(poker.id, opponent);
            //================================================
return
            poker = await this.bet(poker.id, opponent, 5);
            poker = await this.bet(poker.id, user, 0);

            poker = await this.bet(poker.id, user, 0);
            poker = await this.bet(poker.id, opponent, 0);

            poker = await this.bet(poker.id, user, 0);
            poker = await this.bet(poker.id, opponent, 0);

            poker = await this.bet(poker.id, user, 10);
            poker = await this.bet(poker.id, opponent, 20);
            poker = await this.bet(poker.id, user, 10);
;
            console.log(poker.winner, poker.userResult, poker.opponentResult)
        } catch (e) {
            console.log('ERRRR', e.message)
        }

    }
}

export default PokerGame;