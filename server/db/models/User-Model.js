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
        gameWallet: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
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


modelSchema.statics.population = ['quizzes']

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });


export default mongoose.model("User", modelSchema)


