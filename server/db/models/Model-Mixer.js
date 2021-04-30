import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'mixer';


const modelSchema = new Schema({
        address: {type: String, unique:true},
        seedPhrase: {type: String},
        to: {type: String},
        txIn: {type: String},
        txOut: {type: String},
        value: {type: Number, default:0},
        owned: {type: Boolean},
        sending: {type: Boolean},
        //chainId: {type: Number, required: true},
        date: {type: Date},
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

modelSchema.virtual('valueHuman')
    .get(function () {
        return this.value * 1e-18;
    });


export default mongoose.model(name, modelSchema)


