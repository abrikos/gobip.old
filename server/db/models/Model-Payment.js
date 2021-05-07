import moment from "moment";
import params from "src/params";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'payment';

const listSchema = new Schema({
    to: "String",
    value: {type: "Number", default: 0},
})

const mixerSchema = new Schema({
    fromSeed: {type: 'String'},
    fromAddress: {type: 'String'},
    payload: {type: "String"},
    to: "String",
    value: {type: "Number", default: 0}
})

const modelSchema = new Schema({
        fromMultiSend: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        tx: {type: "String", unique: true},
        profits: [listSchema],
        refunds: [listSchema],
        mixers: [mixerSchema],
        status: {type: Number, default: 0},
        //data: {type: Object},
        //wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('dateHuman')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('txParams')
    .get(function () {
        return {
            chainId: params.network.chain,
            //type: TX_TYPE.SEND,
            data: {
                list: this.profits
            },
            gasCoin: 0, // coin id
            gasPrice: 1
        }
    });

modelSchema.virtual('transaction', {
    ref: 'transaction',
    localField: 'transactions',
    foreignField: 'hash',
    //options:{match:{paymentTx:null}},
    justOne: true // set true for one-to-one relationship
});


export default mongoose.model(name, modelSchema);



