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
        winner: String,
        desk: {type: [Object], default: []},
        userCards: {type: [Object], default: []},
        opponentCards: {type: [Object], default: []},
        userBets: {type: [Number], default: []},
        opponentBets: {type: [Number], default: []},
        bank: {type: Number, default: 0},
        status: {type: String, default: 'round-started'},
        result: Object,
        userCheck: Boolean,
        opponentCheck: Boolean,
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

modelSchema.methods.setWinner = function () {
    if (this.desk.length < 5) return {error: 'game not finished'}
    const cU = this.userResult;
    const cO = this.opponentResult;
    this.winner = cU.sum > cO.sum ? 'user' : 'opponent';
    this.result = cU.sum > cO.sum ? cU : cO;


}


modelSchema.methods.makeBet = async function (bet, userId) {
    const player = this.user.equals(userId) ? this.user : this.opponent;
    const smallBlind = this.opponentBets.length === 0;
    const who = this.user.equals(player) ? 'user' : 'opponent';
    this[`${who}Bets`].push(bet)
    if (smallBlind) this.playerTurn = this.opponent;
    if (this.type === 'real') {
        if (player.balanceReal < 0) return {error: 500, message: 'Insufficient funds'};
        player.balanceReal -= bet;
    } else {
        if (player.balanceVirtual < 0) return {error: 500, message:'Insufficient funds'};
        player.balanceVirtual -= bet;
    }
    await player.save()
    return {bet};

}

modelSchema.virtual('playerTurn')
    .get(function () {
        return this[this.turn].id
    });

modelSchema.virtual('otherPlayer')
    .get(function () {
        return this.turn === 'user' ? 'opponent' : 'user'
    });

modelSchema.virtual('round')
    .get(function () {
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


