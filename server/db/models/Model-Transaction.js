import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'transaction';


const modelSchema = new Schema({
        hash: {type: String, unique:true},
        from: {type: String},
        coin: {type: Object},
        //symbol: {type: String, required: true},
        //message: {type: Object},
        value: {type: Number},
        type: {type: Number},
        //chainId: {type: Number, required: true},
        date: {type: Date},
        //data: {type: Object},
        //wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
    },
    {
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('dateHuman')
    .get(function () {
        return moment(this.date).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.statics.createNew = function (tx) {
    try {
        tx.value = tx.data.value * 1e-18;
        tx.coin = tx.data.coin.symbol;
        return this.create(tx)
    } catch (e) {
        console.log('Model-Transaction ERROR', e.message)
    }

};

export default mongoose.model(name, modelSchema)


