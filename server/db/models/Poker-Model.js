import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'poker';


const modelSchema = new Schema({
        name: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        opponent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        playerTurn: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        desk: [Object],
        cardsUser: [Object],
        cardsOpponent: [Object],
        betsUser: [Number],
        betsOpponent: [Number],
        closed: Boolean,
        type: {type: String, default: 'virtual'},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.method.isPLayer = function (userId) {
    return this.user.equals(userId) || (this.opponent && this.opponent.equals(userId))
}

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('bank')
    .get(function () {
        return this.sumUser + this.sumOpponent;
    });

modelSchema.virtual('sumUser')
    .get(function () {
        return this.betsUser ? this.betsUser.reduce((a, b) => a + b, 0) : 0
    });

modelSchema.virtual('sumOpponent')
    .get(function () {
        return this.betsOpponent ? this.betsOpponent.reduce((a, b) => a + b, 0) : 0
    });

modelSchema.virtual('lastBetOpponent')
    .get(function () {
        return this.betsOpponent ? this.betsOpponent[this.betsOpponent.length - 1] : 0
    });

modelSchema.virtual('lastBetUser')
    .get(function () {
        return this.betsUser ? this.betsUser[this.betsUser.length - 1] : 0
    });


export default mongoose.model(name, modelSchema)


