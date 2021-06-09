import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'swapbotroute';


const modelSchema = new Schema({
        bot: {type: mongoose.Schema.Types.ObjectId, ref: 'swapbot'},
        ids: [Number],
        symbols: [String],
        payDate: Date,
        profit: {type: Number, default: 0},
        amount: {type: Number, default: 100},
        enabled: {type: Boolean, default: false},
        lastError: String,
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

modelSchema.virtual('payDateHuman')
    .get(function () {
        return this.payDate && moment(this.payDate).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('payedUntil')
    .get(function () {
        return this.payDate && moment(this.payDate).add(process.env.SWAP_PAY_PERIOD, 'days').format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('name')
    .get(function () {
        return this.symbols.join(' > ');
    });


export default mongoose.model(name, modelSchema)


