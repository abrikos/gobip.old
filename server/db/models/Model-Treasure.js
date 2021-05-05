import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'treasure';


const modelSchema = new Schema({
        address: {type: String, unique:true},
        seedPhrase: {type: String},
        balance: {type: "Number"},
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

modelSchema.virtual('balanceHuman')
    .get(function () {
        return this.balance * 1e-18;
    });


export default mongoose.model(name, modelSchema)


