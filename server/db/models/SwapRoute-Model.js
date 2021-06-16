import moment from "moment";
import SwapBotApi from "../../lib/SwapRouteApi";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'swaproute';


const modelSchema = new Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        ids: [Number],
        symbols: [String],
        payDate: Date,
        execDate: Date,
        lastTx: String,
        minToBuy: {type: Number, default: 105},
        amount: {type: Number, default: 100},
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

modelSchema.virtual('execDateHuman')
    .get(function () {
        return this.execDate && moment(this.execDate).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('payDateHuman')
    .get(function () {
        return this.payDate && moment(this.payDate).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('payedUntil')
    .get(function () {
        return this.payDate && moment(this.payDate).add(process.env.SWAP_PAY_PERIOD, 'days').format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('payNeeded')
    .get(function () {
        return process.env.SWAP_PAY_PER_ROUTE * 1 -  this.wallet.balance;
    });

modelSchema.virtual('nameHuman')
    .get(function () {
        return this.symbols.join(' > ') || this.id;
    })

modelSchema.virtual('name')
    .get(function () {
        return this.symbols.join(' > ');
    })
    .set(function (v){
        SwapBotApi.checkRoute(v)
            .then(route=>{
                this.ids = route.ids;
                this.symbols = route.symbols;
            })
            .catch(e=>{
                console.log('zzzzzzzzzzz',e.message)
            })
    });


export default mongoose.model(name, modelSchema)


