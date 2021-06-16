import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'coin';

const modelSchema = new Schema({
        symbol: {type: String},
        id: {type: Number}
    }
);


export default mongoose.model(name, modelSchema)


