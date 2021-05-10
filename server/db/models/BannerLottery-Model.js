import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'lottery';


const modelSchema = new Schema({
        banner: {type: mongoose.Schema.Types.ObjectId, ref: 'banner'},
        payment: {type: mongoose.Schema.Types.ObjectId, ref: 'payment'},
        closed: {type: Boolean, default: false},
        amount:{type:Number, default:0}
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

modelSchema.virtual('winDate')
    .get(function () {
        return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    });

modelSchema.virtual('liveTime')
    .get(function () {
        return moment().diff(moment(this.updatedAt),'seconds')
    });

modelSchema.virtual('txWin')
    .get(function () {
        return (this.payment && this.payment.results.length && this.payment.results[0].hash) || 'zzz';
    });


export default mongoose.model(name, modelSchema)


