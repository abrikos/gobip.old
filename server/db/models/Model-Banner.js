import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'banner';

const modelSchema = new Schema({
        url: {type: String, label: 'Name'},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'wallet'},

    },
    {
        timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'},
        //toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    })

modelSchema.virtual('path')
    .get(function () {
        return `/uploads/${this.id}.jpg`
    })



export default mongoose.model(name, modelSchema)


