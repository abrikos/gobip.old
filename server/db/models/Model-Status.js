import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'status';


const modelSchema = new Schema({
        latest_block_height: {type: Number},
        initial_height: {type: Number},
        latest_block_time: {type: Date},
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
        return moment(this.latest_block_time).format('YYYY-MM-DD HH:mm:ss')
    });


export default mongoose.model(name, modelSchema)


