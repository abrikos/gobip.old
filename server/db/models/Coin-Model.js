import moment from "moment";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'coin';

const modelSchema = new Schema({
        symbol: {type: String, unique: true},
        id: {type: Number, unique: true}
    }
);


export default mongoose.model(name, modelSchema)


