import moment from "moment";
import randomWords from "random-words";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'game';


const modelSchema = new Schema({
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        name: String,
        module: String,
        type: String,
        dataStr: String,
        iam: Object,
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

modelSchema.methods.joinUser = async function (req) {
    this.players.push(req.session.userId);
    this.data = Games[this.module].onJoin(this, req);
    return this.save();
}

modelSchema.methods.adaptGameForClients = async function (req) {
    return Games[this.module].adaptGameForClients(this, req);
}

modelSchema.methods.doModelTurn = async function (req) {
    this.data = Games[this.module].doTurn(this, req);
    return this.save();
}

modelSchema.methods.iamPlayer = function (req) {
    return this.players.map(p => p.id).indexOf(req.session.userId);
}

modelSchema.statics.modules = Object.keys(Games)

modelSchema.statics.start = async function (req) {
    const {module, type} = req.body;
    const g = new this({module, type, data: Games[module].defaultData});
    await g.joinUser(req);
    g.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0];
    return g.save();
}

modelSchema.virtual('link')
    .get(function () {
        return `/game/${this.module}/${this.id}`;
    });

modelSchema.virtual('data')
    .get(function () {
        return this.dataStr ? JSON.parse(this.dataStr) : {};
    })
    .set(function (v){
        this.dataStr = JSON.stringify(v);
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
    });


export default mongoose.model(name, modelSchema);



