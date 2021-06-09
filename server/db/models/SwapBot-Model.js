import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'swapbot';

const modelSchema = new Schema({
        nameStr: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        coinsStr: String
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('name')
    .get(function () {
        return this.nameStr || this.id;
    })
    .set(function (v) {
        return this.nameStr = v;
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('path')
    .get(function () {
        return `/swapbot/${this.id}`
    });

modelSchema.virtual('coins')
    .get(function () {
        if (!this.coinsStr) return []
        return JSON.parse(this.coinsStr)
    })
    .set(function (obj) {
        if (!Array.isArray(obj)) return;
        this.coinsStr = JSON.stringify(obj)
    });

modelSchema.virtual('routes', {
    ref: 'swapbotroute',
    localField: '_id',
    foreignField: 'bot',
    //options:{match:{paymentTx:null}},
    justOne: false // set true for one-to-one relationship
});


export default mongoose.model(name, modelSchema)


