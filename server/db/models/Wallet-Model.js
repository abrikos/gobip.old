import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'wallet';


const modelSchema = new Schema({
        address: {type: String, unique:true},
        seedPhrase: {type: String},
        to: {type: String},
        balance: {type: Number, default:0},
        type: {type: String},
        profits:[Object],
        addressPaymentFrom: String,
        //chainId: {type: Number, required: true},
        date: {type: Date},
        //data: {type: Object},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
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

modelSchema.virtual('banner', {
    ref: 'banner',
    localField: '_id',
    foreignField: 'wallet',
    //options:{match:{paymentTx:null}},
    justOne: true // set true for one-to-one relationship
});

modelSchema.virtual('betF', {
    ref: 'bet',
    localField: '_id',
    foreignField: 'walletF',
    //options:{match:{paymentTx:null}},
    justOne: true // set true for one-to-one relationship
});

modelSchema.virtual('betA', {
    ref: 'bet',
    localField: '_id',
    foreignField: 'walletA',
    //options:{match:{paymentTx:null}},
    justOne: true // set true for one-to-one relationship
});


export default mongoose.model(name, modelSchema)


