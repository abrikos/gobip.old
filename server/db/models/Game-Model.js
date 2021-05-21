import moment from "moment";
import randomWords from "random-words";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'game';


const modelSchema = new Schema({
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        waitList: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        name: String,
        module: String,
        type: String,
        dataStr: String,
        stakesStr: String,
        started: {type: Boolean, default: false},
        activePlayerIdx: {type: Number, default: 0},
        stakes: {type: Object, default: {}},
        history: [{type: Object}],
        //wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
    },
    {
        timestamps: {createdAt: 'createdAt'},
        toObject: {virtuals: true},
        // use if your results might be retrieved as JSON
        // see http://stackoverflow.com/q/13133911/488666
        toJSON: {virtuals: true}
    });

modelSchema.methods.fundStake = function (req) {
    let amount = req.body.amount * 1 || this.data.initialStake;
    const player = this.players.find(p => p.id === req.session.userId);
    if (player[`${this.type}Balance`] < amount) return {error: 500, message: 'Insufficient funds'}
    player[`${this.type}Balance`] -= amount;
    player.save();
    this.stakes[req.session.userId] += amount;
    return {}
}

modelSchema.methods.doModelBet = async function (req) {
    const bet = req.body.bet * 1;
    await this.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
    console.log('BET', this.iamPlayer(req).name, bet)
    const check = Games[this.module].checkTurn(this, req);
    if (check && check.error) {
        console.log(check);
        throw check;
    }
    const betResult =Games[this.module].onBet(this, req);
    if(betResult.error){console.log(betResult); throw betResult}
    if (this.stakes[req.session.userId] < bet) {
        const message = 'Stake too low';
        console.log('model bet error:', message);
        throw new Error(message);
    }
    this.stakes[req.session.userId] -= bet;
    Games[this.module].nextTurn(this, req)
    await this.save()
}

modelSchema.methods.doModelJoin = async function (req) {
    this.players.push(req.session.userId);
    await this.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
    console.log('JOIN', this.iamPlayer(req).name, req.session.userId)
    this.stakes[req.session.userId] = 0;
    if (Games[this.module].canJoin(this, req)) {
        const canPay = this.fundStake(req);
        if (canPay.error) {
            console.log('Join error:', canPay);
            throw canPay
        }
        Games[this.module].onJoin(this, req);
        if (req.body.bet) await this.doModelBet(req);
    }else{
        this.waitList.push(req.session.userId);
    }
    return this.save();
}

modelSchema.methods.adaptGameForClients = function (req) {
    Games[this.module].adaptGameForClients(this, req);
    return this;
}

modelSchema.methods.iamPlayer = function (req) {
    return this.players.find(p => p.equals(req.session.userId));
}


modelSchema.statics.modules = Object.keys(Games)

modelSchema.statics.start = async function (req) {
    const {module, type} = req.body;
    const g = new this({module, type, data: Games[module].defaultData});
    g.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0];
    console.log(g.module, ' ========START GAME=======',  g.name)
    await g.doModelJoin(req);

    return g.save();
}

modelSchema.virtual('activePlayer')
    .get(function () {
        return this.players[this.activePlayerIdx];
    });

modelSchema.virtual('link')
    .get(function () {
        return `/game/${this.module}/${this.id}`;
    });

modelSchema.virtual('data')
    .get(function () {
        return this.dataStr ? JSON.parse(this.dataStr) : {};
    })
    .set(function (v) {
        this.dataStr = JSON.stringify(v);
    });

modelSchema.virtual('stakesX')
    .get(function () {
        return this.stakesStr ? JSON.parse(this.stakesStr) : {};
    })
    .set(function (v) {
        this.stakesStr = JSON.stringify(v);
    });

modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
    });


export default mongoose.model(name, modelSchema);



