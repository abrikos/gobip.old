import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        externalId: {type: Number},
        strategy: String,
        name: {type: String},
        address: String,
        photo: String,
        email: String,
        referral: String,
        parent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        gameWallet: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        swapWallet: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        admin: {type: Boolean},
        virtualBalance: {type: Number, default: 100000},
        realBalance: {type: Number, default: 0},
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

modelSchema.virtual('referrals', {
    ref: 'User',
    localField: '_id',
    foreignField: 'parent',
    //options:{match:{paymentTx:null}},
    justOne: false // set true for one-to-one relationship
});

modelSchema.virtual('referralLog', {
    ref: 'referral',
    localField: '_id',
    foreignField: 'parent',
    options: {sort: {createdAt: -1}, limit: 100},
    justOne: false // set true for one-to-one relationship
});

export default mongoose.model("User", modelSchema)


