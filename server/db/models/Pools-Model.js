const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'pools';


const modelSchema = new Schema({
        pair: {type: String},
    });

export default mongoose.model(name, modelSchema)


