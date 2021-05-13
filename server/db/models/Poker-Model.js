import moment from "moment";
import PokerApi from "../../lib/PokerApi";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'poker';


const modelSchema = new Schema({
        name: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        opponent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        playerTurn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        winner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        desk: {type: [Object], default: []},
        userCards: {type: [Object], default: []},
        opponentCards: {type: [Object], default: []},
        userBets: {type: [Number], default: []},
        opponentBets: {type: [Number], default: []},
        checks: {type: Number, default: 1},
        status: String,
        prize: Number,
        result: Object,
        bargain: {type: Boolean, default: true},
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

modelSchema.methods.getOtherPlayer = function (userId) {
    return this.user.equals(userId) ?  this.opponent : this.user;
}

modelSchema.methods.setWinner = function () {
    if (this.desk.length < 5) return {error: 'game not finished'}
    const cU = this.userResult;
    const cO = this.opponentResult;
    this.winner = cU.sum > cO.sum ? this.user : this.opponent;
    this.result = cU.sum > cO.sum ? cU : cO;

}


modelSchema.methods.makeBet = async function (bet, userId) {
    if (!(bet * 1)) return {error: 'API: Wrong bet ' + bet};
    const player = this.user.equals(userId) ? this.user : this.opponent;
    const other = this.getOtherPlayer(player);
    const smallBlind = this.opponentBets.length === 0;
    const who = this.user.equals(player) ? 'user' : 'opponent';
    this[`${who}Bets`].push(bet)
    this.playerTurn = other;
    if (smallBlind) this.playerTurn = this.opponent;
    if (this.type === 'real') {
        if (player.balanceReal < 0) return {error: 'Insufficient funds'};
        player.balanceReal -= bet;
    } else {
        if (player.balanceVirtual < 0) return {error: 'Insufficient funds'};
        player.balanceVirtual -= bet;
    }
    await player.save()
    return {bet};

}


modelSchema.virtual('isFlop')
    .get(function () {
        return !(this.desk && this.desk.length);
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
        if (!this.opponent) return false;
        if (!this.userBets || !this.opponentBets) return false;
        return this.userBets.length === this.opponentBets.length && !this.minBet;
    });

modelSchema.virtual('allCards')
    .get(function () {
        if (!this.userCards || !this.opponentCards) return this.desk;
        return this.userCards.concat(this.opponentCards).concat(this.desk);
    });

modelSchema.virtual('bank')
    .get(function () {
        return this.userSum + this.opponentSum;
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

modelSchema.virtual('lastBetOpponent')
    .get(function () {
        return this.opponentBets ? this.opponentBets[this.opponentBets.length - 1] : 0
    });

modelSchema.virtual('lastBetUser')
    .get(function () {
        return this.userBets ? this.userBets[this.userBets.length - 1] : 0
    });


export default mongoose.model(name, modelSchema)


