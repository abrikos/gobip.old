import moment from "moment";
import {TX_TYPE} from "minter-js-sdk";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'payment';

const dataSchema = new Schema({
    to: "String",
    value: {type: "Number", default: 0},
    coin: {type: "Number", default: 0}
})

const modelSchema = new Schema({
        from: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        list: [dataSchema],
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
            chainId: process.env.CHAIN_ID,
            type: TX_TYPE.MULTISEND,
            //type: TX_TYPE.SEND,
            data: {
                list: this.list
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


export default mongoose.model(name, modelSchema)


