import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'poker';


const modelSchema = new Schema({
        name: String,
        walletsUser: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        walletsOpponent: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        opponent: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        desk: [Object],
        cardsUser: [Object],
        cardsOpponent: [Object],
        betsUser: [Number],
        betsOpponent: [Number],

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



export default mongoose.model(name, modelSchema)


