import moment from "moment";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'transaction';


const modelSchema = new Schema({
        hash: {type: String, unique:true},
        from: {type: String},
        coin: {type: Object},
        //symbol: {type: String, required: true},
        //message: {type: Object},
        //toMain: {type: Boolean, default: false},
        value: {type: Number},
        //chainId: {type: Number, required: true},
        //date: {type: Number, required: true},
        //data: {type: Object},
        //wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
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


