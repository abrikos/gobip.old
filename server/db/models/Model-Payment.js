import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'payment';


const modelSchema = new Schema({
        fromMultiSend: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        tx: {type: "String", unique: true},
        multiSends: [Object],
        singleSends: [Object],
        results: [Object],
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

modelSchema.virtual('transaction', {
    ref: 'transaction',
    localField: 'transactions',
    foreignField: 'hash',
    //options:{match:{paymentTx:null}},
    justOne: true // set true for one-to-one relationship
});


export default mongoose.model(name, modelSchema);



