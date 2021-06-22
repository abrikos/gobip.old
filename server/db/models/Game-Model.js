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

modelSchema.methods.test = function (req) {
    return Games[this.module].isWinner(this)
}

modelSchema.statics.deleteForgottenGames = async function () {
    const games = await this.find({updatedAt: {$lt: moment().utc().add(-5, 'hours').format('YYYY-MM-DD hh:mm')}})
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
    for (const game of games) {
        for (const p of game.players) {
            try {
                game.doModelLeave({session: {userId: p.id}}, true);
            } catch (e) {

            }
            console.log('Delete game', game.id)
            game.delete()
        }
    }
}

modelSchema.methods.doModelLeave = async function (req, forgotten) {
    const game = this;
    if (!game.canLeave(req) && !forgotten) return;
    console.log('LEAVE', game.iamPlayer(req) && game.iamPlayer(req).name)
    const prevIndex = game.players.map(p => p.id).indexOf(req.session.id) - 1;
    game.activePlayerIdx = prevIndex < 0 ? 0 : prevIndex;
    let player = game.players.find(p => p.equals(req.session.userId));
    if (!player) player = game.waitList.find(p => p.equals(req.session.userId));
    game.fromStakeToBalance(player);
    game.players = game.players.filter(p => !p.equals(req.session.userId));
    game.waitList = game.waitList.filter(p => !p.equals(req.session.userId));
    Games[game.module].onLeave(game, req);
    if(game.players.length < 2) {
        game.winners = game.players;
        game.payToWinners();
        await game.reload();
    }
}

modelSchema.methods.fromStakeToBalance = function (player) {
    if(!player) return;
    const game = this;
    const myStake = game.stakes[player.id] * 1;
    player[`${game.type}Balance`] += myStake;
    player.save();
    delete game.stakes[player.id];
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
        .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .then(game => {
            game.doModelLeave(req);
            game.save()
                .catch(e => {
                })
        })
}

modelSchema.statics.doTurn = async function (req) {
    this.findById(req.params.id).populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .then(async game => {
            if (!game.activePlayer.equals(req.session.userId)) return;
            game.doModelTurn(req);
            //game.doModelBet(req, req.body.bet * 1)
        })
        .catch(console.log)

}


modelSchema.methods.doModelTurn = async function (req) {
    const game = this;
    const module = Games[game.module];
    module.doTurn(game, req);
    console.log('TURN', game.iamPlayer(req).name, req.body)
    if (module.hasWinners(game)) {
        game.payToWinners();
        //await game.reload();
    }else {
        game.activePlayerIdx++;
        if (game.activePlayerIdx >= game.players.length) game.activePlayerIdx = 0;
        if (module.startTimer) game.activePlayerTime = moment().unix();
    }
    await game.save()
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
            return console.log('Join error:', canPay);
        }
        if(Games[game.module].onJoinDoTurn(game, req)){
            await game.doModelTurn(req)
        }
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

modelSchema.methods.payToWinners = function () {
    const bank = Games[this.module].getBank(this);
    for (const p of this.winners) {
        const amount = bank / this.winners.length;
        p[`${this.type}Balance`] += amount;
        console.log('winner', p.name, amount, p[`${this.type}Balance`])
        p.save()
    }
    this.finishTime = moment().unix();
}

modelSchema.statics.reloadFinished = async function () {
    const games = await this.find({finishTime: {$lt: moment().unix() - process.env.GAME_RELOAD_TIME * 1, $gt: 0}});
    for (const game of games) {
        game.reload()
    }
}

modelSchema.methods.reload = async function () {
    console.log('RELOAD game')
    this.finishTime = 0;
    this.history.push({data: this.data, winners: this.winners, date: new Date()});
    this.winners = [];
    this.data = Games[this.module].defaultData;

    await this
        .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .execPopulate()
    const players = this.players.concat(this.waitList);
    if (!players.length) {
        this.delete();
        return;
    }
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
        modules.push({name: k, ...Games[k]})
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
                };
                g.autoFold.push(req.session.userId);
                await g.doModelBet(req, -1);
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
    const g = new this({module: module.name, type, data: Games[module.name].defaultData});
    g.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0];
    console.log(g.module, ' ========START GAME=======', g.name, g.id)
    await g.doModelJoin(req, true);
    return g;
}

modelSchema.virtual('description')
    .get(function () {
        return Games[this.module].description;
    });

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

modelSchema.virtual('timeFinishLeft')
    .get(function () {
        return this.finishTime && this.finishTime + process.env.GAME_RELOAD_TIME * 1 - moment().unix();
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



