import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'bet';


const modelSchema = new Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        walletF: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        walletA: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        payment: {type: mongoose.Schema.Types.ObjectId, ref: 'payment'},
        votesF: [Object],
        votesA: [Object],
        checkDate: {type: Date, required: true},
        condition: {type: String, required: true, message: p => `${p} is not a valid condition`, validate: {validator: v => ['<=', '>=', '='].indexOf(v) >= 0}},
        value: {type: Number, default: 0, min: 0},
        closed: Boolean,
        closeTx: String,
        pair: {type: String, required: true, validate: {validator: v => v.match(/(\w+)-(\w+)/)}, message: p => `${p.value} is not a valid pair`}
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('checkDateHuman')
    .get(function () {
        return this.checkDate && moment(this.checkDate).format('YYYY-MM-DD')
    });

modelSchema.virtual('balance')
    .get(function () {
        return {for: this.stakes.for * 1 / this.sum * 100 , against:  this.stakes.against * 1 / this.sum * 100 }
    });

modelSchema.virtual('stakes')
    .get(function () {
        return {for: this.votesF.map(v=>v.value).reduce((a,b)=>a+b,0), against: this.votesA.map(v=>v.value).reduce((a,b)=>a+b,0)}
    });

modelSchema.virtual('votes')
    .get(function () {
        return {for: this.votesF.length, against: this.votesA.length}
    });

modelSchema.virtual('userRefund')
    .get(function () {
        return this.sum /100 * process.env.BET_USER_PECRENT;
    });

modelSchema.virtual('prizeForWinners')
    .get(function () {
        return this.sum /100 * (100 - process.env.BET_USER_PECRENT);
    });

modelSchema.virtual('sum')
    .get(function () {
        return this.stakes.for + this.stakes.against;
    });

modelSchema.virtual('shareLink')
    .get(function () {
        return `/api/bet/share/${this.id}`;
    });

modelSchema.virtual('link')
    .get(function () {
        return `/bet/${this.id}`;
    });

modelSchema.virtual('conditionHuman')
    .get(function () {
        const conditions = {
            '<=': 'less than',
            '>=': 'more than',
            '=': 'equal',
        }
        return conditions[this.condition];
    });

modelSchema.virtual('name')
    .get(function () {
        if (!this.checkDate || !this.pair || !this.condition) return 'Bet without required parameters'

        return `${this.checkDateHuman} :: ${this.pair}  ${this.condition} ${this.value}`
    });

modelSchema.virtual('pairObject')
    .get(function () {
        if (!this.pair) return '';
        const p = this.pair.match(/(\w+)-(\w+)/)
        if (!p) return false;
        return {from: p[1], to: p[2]}
    });

export default mongoose.model(name, modelSchema)


