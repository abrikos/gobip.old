import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'training';


const modelSchema = new Schema({
        name: String,
        options: Object,
        trainingSource: Object,
        trainingResult: Object
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


export default mongoose.model(name, modelSchema)


