import moment from "moment";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'ethereum';


const modelSchema = new Schema({
        open: {type: Number},
        high: {type: Number},
        low: {type: Number},
        close: {type: Number},
        volCrypto: {type: Number},
        volUsd: {type: Number},
        trades: {type: Number},
        closeNext: {type: Number, default:0},
        date: {type: Date, unique:true},
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


export default mongoose.model(name, modelSchema)


