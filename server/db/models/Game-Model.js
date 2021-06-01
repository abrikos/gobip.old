import moment from "moment";
import randomWords from "random-words";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'game';


const modelSchema = new Schema({
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        waitList: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        winners: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        name: String,
        module: String,
        type: String,
        dataStr: String,
        stakesStr: String,
        started: {type: Boolean, default: false},
        activePlayerIdx: {type: Number, default: 0},
        activePlayerTime: {type: Number, default: 0},
        minBet: {type: Number, default: process.env.GAME_MIN_BET},
        //stakes: {type: Object, default: {}},
        //data: {type: Object, default: {}},
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
    this.changeStake(req, this.stakes[req.session.userId] + amount)
    return {}
}

modelSchema.methods.doModelBet = async function (req) {
    const bet = req.body.bet * 1;
    if (this.winners.length) {
        const message = 'Game ended ' + this.name
        console.log(message);
        throw {error: 500, message}
    }
    await this.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
    console.log('BET', this.iamPlayer(req).name, bet)
    if (!this.activePlayer.equals(req.session.userId)) {
        console.log('Not you turn');
        throw {error: 500, message: 'Not you turn'}
    }
    if (this.stakes[req.session.userId] < bet) {
        const message = 'Stake too low';
        console.log('model bet error:', message);
        throw new Error(message);
    }
    if(bet<0) this.doFold();
    const betResult = Games[this.module].onBet(this, req);
    if (betResult.error) {
        console.log(betResult);
        throw betResult
    }
    this.changeStake(req, this.stakes[req.session.userId] - bet)
    this.activePlayerTime = moment().unix();
    console.log('RESULTS', this.data.results)
    return this.save()
}

modelSchema.methods.doFold = function () {
    const spliced = this.players.splice(this.activePlayerIdx, 1);
    if (!spliced[0]) {
        this.delete();
        return;
    }
    this.waitList.push(spliced[0].id);
    if (this.players.length === 1) {
        this.winners = this.players;
        this.payToWInners()
    }
    this.activePlayerTime = moment().unix();
}

modelSchema.methods.changeStake = function (req, amount) {
    const s = this.stakes;
    s[req.session.userId] = amount;
    this.stakes = s;
}

modelSchema.methods.doModelJoin = async function (req) {
    if (Games[this.module].canJoin(this, req)) {
        this.players.push(req.session.userId);
        await this.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
        console.log('JOIN', this.iamPlayer(req).name, req.session.userId)
        this.changeStake(req, 0);
        const canPay = this.fundStake(req);
        if (canPay.error) {
            console.log('Join error:', canPay);
            throw canPay
        }
        Games[this.module].onJoin(this, req);
        if (req.body.bet) await this.doModelBet(req);
    } else {
        console.log('WAIT LIST')
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

modelSchema.methods.payToWInners = function () {
    const bank = Games[this.module].getBank(this)
    for (const p of this.winners) {
        const amount = bank / this.winners.length;
        console.log('winner',p.name, amount)
        p[`${this.type}Balance`] += amount;
    }
    this.activePlayerTime = 0;
}

modelSchema.methods.reload = function () {
    this.data = Games[this.module].defaultData;
    this.activePlayerTime = 0;
    this.activePlayerIdx = 0;
}

modelSchema.statics.modules = Object.keys(Games)

modelSchema.statics.timeFoldPlayers = function () {
    this.find({activePlayerTime: {$lt: moment().unix() - process.env.GAME_TURN_TIME, $gt: 0}})
        .then(async games => {
            for (const g of games) {
                if (g.winners.length) continue;
                if(!g.players.length) continue;
                const req = {
                    session: {userId: g.players[g.activePlayerIdx]},
                    body: {bet: -1}
                };
                await g.doModelBet(req);
            }
        })
}

modelSchema.statics.start = async function (req) {
    const {module, type} = req.body;
    const g = new this({module, type, data: Games[module].defaultData});
    g.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0];
    console.log(g.module, ' ========START GAME=======', g.name)
    await g.doModelJoin(req);

    return g.save();
}
/*
modelSchema.methods.getBank = function (){
    return Games[this.module].getBank(this);
}
*/

/*
modelSchema.methods.maxBet= function () {
        console.log('zzzzzzz',Object.keys(this))
        return Games[this.module].getMaxBet(this);
    };
*/

modelSchema.virtual('activePlayer')
    .get(function () {

        return this.players ? this.players[this.activePlayerIdx] : {};
    });

modelSchema.virtual('timeLeft')
    .get(function () {
        return this.activePlayerTime + process.env.GAME_TURN_TIME * 1 - moment().unix();
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



modelSchema.virtual('stakes')
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



