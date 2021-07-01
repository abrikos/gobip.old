import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'referral';


const modelSchema = new Schema({
    type: {type: String},
    amount: {type: Number, default: 0},
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    referral: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {
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


export default mongoose.model(name, modelSchema)


