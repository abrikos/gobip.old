import moment from "moment";
import PokerApi from "../../lib/PokerApi";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'poker';


const modelSchema = new Schema({
        name: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        opponent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        turn: {type: String, default: 'opponent'},
        winners: [String],
        desk: {type: [Object], default: []},
        userCards: {type: [Object], default: []},
        opponentCards: {type: [Object], default: []},
        userBets: {type: [Number], default: []},
        opponentBets: {type: [Number], default: []},
        bank: {type: Number, default: 0},
        timer: {type: Number, default: 0},
        status: {type: String, default: 'round-started'},
        result: Object,
        userCheck: Boolean,
        opponentCheck: Boolean,
        userAgain: Boolean,
        opponentAgain: Boolean,
        pokerAgainId: String,
        type: {type: String, default: 'virtual'},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });


modelSchema.methods.who = function (userId) {
    return this.user.equals(userId) ? 'user' : 'opponent'
}

modelSchema.methods.isPlayer = function (userId) {
    return this.user.equals(userId) || (this.opponent && this.opponent.equals(userId)) || false
}

modelSchema.methods.moveBank = function () {
    const prize = (this.bank - process.env.POKER_SMALL_BLINDE * 1) / this.winners.length;
    for (const w of this.winners){
        this[w][`${this.type}Balance`] += prize;
        this[w].save()
    }
    return prize
}

modelSchema.methods.fillBank = function () {
    this.bank += this.userSum + this.opponentSum;
    this.userBets = [];
    this.opponentBets = [];
}

modelSchema.methods.calcWinner = function () {
    if (this.desk.length < 5) return {error: 'game not finished'}
    const cU = this.userResult;
    const cO = this.opponentResult;

    if(cU.sum >= cO.sum) this.winners.push('user');
    if(cU.sum <= cO.sum) this.winners.push('opponent');
    this.result = cU.sum > cO.sum ? cU : cO;
    this.moveBank()
}

modelSchema.methods.doFold = function () {
    this.winner = this.otherPlayer;
    this.fillBank();
    const prize = this.moveBank()
    this.result = this[`${this.winner}Result`]
    this.status = 'fold'
    console.log(this.turn, 'FOLD', prize, this.winner);
}


modelSchema.methods.makeBet = async function (bet, userId) {
    const who = this.who(userId);
    const player = this[who];
    this[`${who}Bets`].push(bet)
    if (this.type === 'real') {
        player.realBalance -= bet;
        if (player.realBalance < 0) return {error: 500, message: 'Insufficient funds'};
    } else {
        player.virtualBalance -= bet;
        if (player.virtualBalance < 0) return {error: 500, message: 'Insufficient funds'};
    }
    await player.save()
    return {bet};
}

modelSchema.virtual('isPlaying')
    .get(function () {
        return this.opponent && this.user;
    });

modelSchema.virtual('timerEnabled')
    .get(function () {
        return this.secondsLeft >=0 && this.secondsLeft <= process.env.POKER_TURN_TIMER;
    });

modelSchema.virtual('secondsLeft')
    .get(function () {
        if(this.result) return 10000;
        return this.timer + process.env.POKER_TURN_TIMER * 1 - moment().unix();
    });

modelSchema.virtual('playerTurn')
    .get(function () {
        return this[this.turn] && this[this.turn].id
    });

modelSchema.virtual('turnUser')
    .get(function () {
        return this[this.turn]
    });

modelSchema.virtual('otherPlayer')
    .get(function () {
        return this.turn === 'user' ? 'opponent' : 'user'
    });

modelSchema.virtual('round')
    .get(function () {
        if(this.status==='fold') return 'fold'
        if (!this.desk) return '-'
        const a = ['pre-flop', '', '', 'flop', 'turn', 'river', 'finish']
        return a[this.desk.length]
    });

modelSchema.virtual('userResult')
    .get(function () {
        return this.userCards ? PokerApi.calc(this.userCards, this.desk) : {}
    });

modelSchema.virtual('opponentResult')
    .get(function () {
        return this.opponentCards ? PokerApi.calc(this.opponentCards, this.desk) : {}
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('availableActions')
    .get(function () {
        if (this.minBet) {
            return ['bet', 'fold']
        }
        if (this.isCall) {
            return ['check', 'bet']
        }
        return ['check', 'bet', 'fold'];
    });

modelSchema.virtual('isCall')
    .get(function () {
        return this.minBet === 0;
    });

modelSchema.virtual('blind')
    .get(function () {
        return process.env.POKER_SMALL_BLINDE * 2;
    });

modelSchema.virtual('allCards')
    .get(function () {
        if (!this.userCards || !this.opponentCards) return this.desk;
        return this.userCards.concat(this.opponentCards).concat(this.desk);
    });


modelSchema.virtual('minBet')
    .get(function () {
        return Math.abs(this.userSum - this.opponentSum);
    });

modelSchema.virtual('userSum')
    .get(function () {
        return this.userBets ? this.userBets.reduce((a, b) => a + b, 0) : 0
    });

modelSchema.virtual('opponentSum')
    .get(function () {
        return this.opponentBets ? this.opponentBets.reduce((a, b) => a + b, 0) : 0
    });


export default mongoose.model(name, modelSchema)


