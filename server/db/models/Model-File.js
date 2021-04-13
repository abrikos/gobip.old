import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema({
        extension: String,
        name: String,
        description: String,
        order: Number,

    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.virtual('isImage')
    .get(function () {
        return this.extension && ['jpeg', 'png', 'svg', 'jpg'].includes(this.extension.toLowerCase());
    });

modelSchema.virtual('path')
    .get(function () {
        return `/uploads/${this.name}.${this.extension}`;
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });


export default mongoose.model("File", modelSchema)


