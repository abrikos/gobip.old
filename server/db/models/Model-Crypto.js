import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'crypto';


const modelSchema = new Schema({
        from: {type: String},
        to: {type: String},
        value: {type: Number, default: 0}
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


