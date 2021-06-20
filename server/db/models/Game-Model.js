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
        autoFold: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        name: String,
        module: String,
        type: String,
        dataStr: String,
        stakesStr: String,
        finishTime: {type: Number, default: 0},
        activePlayerIdx: {type: Number, default: 0},
        activePlayerTime: {type: Number, default: 0},
        minBet: {type: Number, default: process.env.GAME_MIN_BET},
        stakes2: {type: Object, default: {}},
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

modelSchema.methods.doModelTurn = async function (req) {
    const game = this;
    const module = Games[game.module];
    if (!module.doTurn(game, req)) return;
    console.log('TURN', game.iamPlayer(req).name, req.body.turn)
    if (module.isEnd(game)) {
        await game.payToWInners();
        //await game.reload();
    }
    await game.save()
}

console.log(moment().add(-1, 'hours'))

modelSchema.statics.deleteForgottenGames = async function () {
    const games = await this.find({updatedAt: {$lt: moment().utc().add(-1, 'hours').format('YYYY-MM-DD hh:mm')}})
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
    for (const game of games) {
        for (const p of game.players) {
            try {
                game.doModelLeave({session: {userId: p.id}}, true);
            } catch (e) {

            }
            game.delete()
        }
    }
}

modelSchema.statics.doTurn = async function (req) {
    const game = await this.findById(req.params.id)
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
    game.doModelTurn(req)
}

modelSchema.methods.doModelLeave = function (req, forgotten) {
    const game = this;
    if (!game.canLeave(req) && !forgotten) return;
    Games[game.module].onLeave(game, req);
    const player = game.players.find(p => p.equals(req.session.userId));
    game.players = game.players.filter(p => !p.equals(req.session.userId));
    game.waitList = game.waitList.filter(p => !p.equals(req.session.userId));
    const myStake = game.stakes[req.session.userId];
    player[`${game.type}Balance`] += myStake;
    player.save();
    delete game.stakes[req.session.userid];
    if (!game.players.length) game.delete();
}

modelSchema.methods.canLeave = function (req) {
    return Games[this.module].canLeave(this, req);
}

modelSchema.statics.canLeave = async function (req) {
    const game = await this.findById(req.params.id)
    return game.canLeave(req);
}

modelSchema.statics.leaveGame = function (req) {
    this.findById(req.params.id)
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .then(game => {
            game.doModelLeave(req);
            game.save()
                .catch(e => {
                })
        })
}

modelSchema.statics.doBet = async function (req) {
    const game = await this.findById(req.params.id).populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
    game.doModelBet(req)
}

modelSchema.methods.doModelBet = async function (req) {
    const game = this;
    const bet = req.body.bet * 1;
    if (game.winners.length) {
        const message = `Cannot bet. There is winners "${game.name}"`
        console.log(message);
        throw {error: 500, message}
    }
    await game.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
    if (!game.iamPlayer(req)) return game;
    console.log('BET', game.iamPlayer(req).name, bet)
    if (!game.activePlayer.equals(req.session.userId)) {
        console.log('Not you turn');
        throw {error: 500, message: 'Not you turn'}
    }
    if (game.stakes[req.session.userId] < bet) {
        const message = 'Stake too low';
        console.log('model bet error:', message);
        throw new Error(message);
    }
    if (bet < 0) await game.doFold();
    const betResult = Games[game.module].onBet(game, req);
    if (betResult && betResult.error) {
        console.log(betResult);
        throw betResult
    }
    game.changeStake(req, game.stakes[req.session.userId] - bet)
    game.activePlayerTime = moment().unix();
    return game.save()
}

modelSchema.methods.doFold = async function () {
    const spliced = this.players.splice(this.activePlayerIdx, 1);
    if (!spliced[0]) {
        this.delete();
        return;
    }
    Games[this.module].waitList && this.waitList.push(spliced[0].id);
    if (this.players.length === 1) {
        this.winners = this.players;
        await this.payToWInners()

    } else {
        this.activePlayerTime = moment().unix();
    }
    await this.save();
}

modelSchema.methods.changeStake = function (req, amount) {
    const s = this.stakes;
    s[req.session.userId] = amount;
    this.stakes = s;
}

modelSchema.statics.doJoin = async function (req) {
    const game = await this.findById(req.params.id).populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
    game.doModelJoin(req, true)
}

modelSchema.methods.doModelJoin = async function (req) {
    const game = this;
    if (Games[game.module].canJoin(game, req)) {
        game.players.push(req.session.userId);
        await game.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
        console.log('JOIN', game.iamPlayer(req).name, req.session.userId)
        game.changeStake(req, 0);
        const canPay = game.fromBalanceToStake(req, this.data.initialStake);
        if (canPay.error) {
            console.log('Join error:', canPay);
            throw canPay
        }
        Games[game.module].onJoin(game, req);
        if (req.body.bet) await game.doModelBet(req);
    } else {
        console.log('WAIT LIST')
        game.waitList.push(req.session.userId);
    }
    await game.save()
}

modelSchema.methods.fromBalanceToStake = function (req, amount) {
    const player = this.players.find(p => p.id === req.session.userId);
    if (player[`${this.type}Balance`] < amount) return {error: 500, message: 'Insufficient funds'}
    player[`${this.type}Balance`] -= amount;
    player.save();
    this.changeStake(req, this.stakes[req.session.userId] + amount)
    return {}
}

modelSchema.statics.hideOpponentData = async function (req) {
    const game = await this.findById(req.params.id)
        .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
    if (!game) return null
    return Games[game.module].hideOpponentData(game, req)
}

modelSchema.methods.iamPlayer = function (req) {
    return this.players.find(p => p.equals(req.session.userId));
}

modelSchema.methods.payToWInners = async function () {
    const bank = Games[this.module].getBank(this);
    for (const p of this.winners) {
        const amount = bank / this.winners.length;
        p[`${this.type}Balance`] += amount;
        console.log('winner', p.name, amount, p[`${this.type}Balance`])
        await p.save()
    }
    this.finishTime = moment().unix();
    await this.save()
}

modelSchema.statics.reloadFinished = async function () {
    const games = await this.find({finishTime: {$lt: moment().unix() - 10, $gt: 0}});
    for (const game of games) {
        game.reload()
    }
}

modelSchema.methods.reload = async function () {
    this.finishTime = 0;
    this.history.push({data: this.data, winners: this.winners, date: new Date()});
    this.winners = [];
    this.data = Games[this.module].defaultData;
    await this
        .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .execPopulate()
    const players = this.players.concat(this.waitList);
    if (Games[this.module].shiftFirstTurn) {
        players.push(players.shift());
    }
    this.players = [];
    this.activePlayerTime = 0;
    this.activePlayerIdx = 0;
    this.waitList = [];
    for (const p of players) {
        const req = {
            body: {},
            session: {userId: p.id},
        }
        await this.doModelJoin(req)
    }
    await this.save();
}

modelSchema.statics.modules = function () {
    const modules = [];
    for (const k of Object.keys(Games)) {
        modules.push({
            name: k,
            label: Games[k].label || k,
            order: Games[k].order
        })
    }
    return modules.sort((a, b) => a.order * 1 > b.order * 1);
}

modelSchema.statics.timeFoldPlayers = function () {
    this.find({activePlayerTime: {$lt: moment().unix() - process.env.GAME_TURN_TIME, $gt: 0}})
        .then(async games => {
            for (const g of games) {
                if (Games[g.module].noTimer) {
                    g.activePlayerTime = 0;
                    g.save()
                    continue;
                }
                if (g.players.length < 2 || !g.players[g.activePlayerIdx]) continue
                if (g.winners.length) continue;
                if (!g.players.length) continue;
                const req = {
                    session: {userId: g.players[g.activePlayerIdx]},
                    body: {bet: -1}
                };
                g.autoFold.push(req.session.userId);
                await g.doModelBet(req);
                if (g.autoFold.filter(u => u.equals(req.session.userId)).length > 2) {
                    g.players = g.players.filter(u => u.equals(req.session.userId))
                    console.log('USER', req.session.userId)
                    console.log('AUTOFOLD', g.autoFold)
                    console.log('WAIT LIST', g.waitList)
                    console.log('AUTOFOLD LENGTH', g.autoFold.filter(u => u.equals(req.session.userId)).length)
                    g.waitList = g.waitList.filter(u => !u.equals(req.session.userId))
                    g.autoFold = g.autoFold.filter(u => !u.equals(req.session.userId))
                    await g.save()
                }
            }
        })
}

modelSchema.statics.start = async function (req) {
    const {module, type} = req.body;
    console.log(module)
    const g = new this({module: module.name, type, data: Games[module.name].defaultData});
    g.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0];
    console.log(g.module, ' ========START GAME=======', g.name)
    await g.doModelJoin(req, true);
    return g;
}

modelSchema.virtual('moduleHuman')
    .get(function () {
        return Games[this.module].label;
    });

modelSchema.virtual('activePlayer')
    .get(function () {
        return this.players ? this.players[this.activePlayerIdx] : {};
    });

modelSchema.virtual('timeLeft')
    .get(function () {
        return !Games[this.module].noTimer && this.activePlayerTime && this.activePlayerTime + process.env.GAME_TURN_TIME * 1 - moment().unix();
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



