import moment from "moment";
import randomWords from "random-words";
import * as Games from "server/games";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const name = 'game';

const stakeSchema = new Schema({userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, value: Number})

const modelSchema = new Schema({
        players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        waitList: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        winners: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        autoFold: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        name: String,
        module: String,
        type: String,
        dataStr: String,
        bets: [Object],
        stake: {type: Number, default: 100},
        round: {type: Number, default: 0},
        finishTime: {type: Number, default: 0},
        activePlayerIdx: {type: Number, default: 0},
        activePlayerTime: {type: Number, default: 0},
        minBet: {type: Number, default: process.env.GAME_MIN_BET},
        stakesArray: [stakeSchema],
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
    const games = await this.find({updatedAt: {$lt: moment().utc().add(-6, 'hours').format('YYYY-MM-DD hh:mm')}})
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
    for (const game of games) {
        console.log('Delete game', game.name, game.updatedAt())
        for (const p of game.players) {
            await game.doModelLeave(p.id, true)
                .catch(console.log)
        }
        await game.delete()
    }
}

modelSchema.statics.leaveGame = function (req) {
    return new Promise(async (resolve, reject) => {
        this.findById(req.params.id)
            .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
            .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
            .then(game => {
                game.doModelLeave(req.session.userId)
                    .then(resolve)
                    .catch(reject);
            })
    })
}

modelSchema.methods.doModelLeave = function (userId, forgotten) {
    return new Promise(async (resolve, reject) => {
        const game = this;
        if (!game.canLeave(userId) && !forgotten) return;
        console.log('LEAVE', game.iamPlayer(userId) && game.iamPlayer(userId).name)
        const prevIndex = game.players.map(p => p.id).indexOf(userId) - 1;
        game.activePlayerIdx = prevIndex < 0 ? 0 : prevIndex;
        let player = game.players.find(p => p.equals(userId));
        if (!player) player = game.waitList.find(p => p.equals(userId));
        player[`${game.type}Balance`] += game.stakes[player.id] * 1;
        await player.save();
        game.players = game.players.filter(p => !p.equals(userId));
        game.waitList = game.waitList.filter(p => !p.equals(userId));
        Games[game.module].onLeave(game, userId);
        try {
            this.stakesArray = this.stakesArray.filter(s => !s.userId.equals(userId))
        } catch (e) {

        }
        if (game.players.length === 1) {
            game.activePlayerTime = 0;
            game.activePlayerIdx = 0;
        }
        if (!game.players.length) {
            await game.delete()
        } else {
            await game.save()
        }

        resolve()
    })
}


modelSchema.methods.canLeave = function (userId) {
    return Games[this.module].canLeave(this, userId);
}

modelSchema.statics.canLeave = async function (req) {
    const game = await this.findById(req.params.id)
    return game.canLeave(req.session.userId);
}


modelSchema.statics.doTurn = function (req) {
    return new Promise((resolve, reject) => {
        this.findById(req.params.id).populate({
            path: 'players',
            select: ['name', 'photo', 'realBalance', 'virtualBalance'],
            populate: {path: 'parent', select: ['realBalance', 'virtualBalance'],}
        })
            .then(game => {
                if (!Games[game.module].noCheckTurnsOrder && !game.activePlayer.equals(req.session.userId)) return reject({message: 'Not your turn'});
                game.autoFold = game.autoFold.filter(u => !u.equals(req.session.userId))
                game.doModelTurn(req.session.userId, req.body)
                    .then(resolve)
                    .catch(reject)

                //game.doModelBet(req, req.body.bet * 1)
            })
            .catch(reject)
    })

}

modelSchema.methods.doModelTurn = async function (userId, body) {
    return new Promise(async (resolve, reject) => {
        const game = this;
        if (!game.iamPlayer(userId)) return reject('You are not in the players list' + userId)
        if (!game.activePlayer.equals(userId)) return reject('Not your turn ' + userId + ' - ' + game.activePlayer.id)
        console.log('TURN', game.iamPlayer(userId) && game.iamPlayer(userId).name)
        const module = Games[game.module];
        const turnResult = module.doTurn(game, userId, body);
        if (turnResult.error) return reject({message: turnResult.error})
        if (module.hasWinners(game)) {
            await game.payToWinners();
            //await game.newTable();
        } else {
            if (!module.customTurn) {
                game.nextPlayer()
            }
            if (module.useTimer && game.players.length > 1) game.activePlayerTime = moment().unix();
        }
        await game.save()
        resolve()
    })
}

modelSchema.methods.nextPlayer = function () {
    const game = this;
    game.activePlayerIdx++;
    if (game.activePlayerIdx >= game.players.length) game.activePlayerIdx = 0;
    if (Games[game.module].useTimer) game.activePlayerTime = moment().unix();
}

modelSchema.methods.changeStake = function (userId, value) {
    const s = this.stakesArray.find(ss => ss.userId.equals(userId));
    if (!s) {
        this.stakesArray.push({userId, value})
    } else {
        s.value += value;
    }
}

modelSchema.statics.doJoin = async function (req) {
    return new Promise(async (resolve, reject) => {
        const game = await this.findById(req.params.id).populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
        game.doModelJoin(req.session.userId)
            .then(resolve)
            .catch(reject)
    })
}

modelSchema.methods.doModelJoin = async function (userId) {
    return new Promise(async (resolve, reject) => {
        const game = this;
        const module = Games[game.module];
        if (module.canJoin(game, userId)) {
            game.players.push(userId);
            await game.populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']).execPopulate()
            console.log('JOIN', game.iamPlayer(userId).name, userId)
            if (!game.stakes[userId]) {
                const canPay = await game.fromBalanceToStake(userId, game.stake);
                if (canPay.error) {
                    return reject({message: 'Join error:' + canPay.error});
                }
            }
            module.onJoin(game, userId)
        } else {
            console.log('WAIT LIST');
            game.waitList.push(userId);
        }
        await game.save();
        resolve()
    })
}

modelSchema.methods.fromBalanceToStake = async function (userId, amount) {
    const player = this.players.find(p => p.id === userId);
    if (player[`${this.type}Balance`] < amount) return {error: 500, message: 'Insufficient funds'}
    player[`${this.type}Balance`] -= amount;
    await player.save();
    this.changeStake(userId, amount)
    return {}
}

modelSchema.statics.hideOpponentData = async function (req) {
    const game = await this.findById(req.params.id)
        .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance']);
    if (!game) return null
    return Games[game.module].hideOpponentData(game, req.session.userId)
}

modelSchema.methods.iamPlayer = function (userId) {
    return this.players.find(p => p.equals(userId));
}

modelSchema.methods.payToWinners = async function () {
    const bank = Games[this.module].getBank(this);
    for (const p of this.winners) {
        const amount = bank / this.winners.length;
        const toWinner = amount * (1 - process.env.REFERRAL_PERCENT / 100);
        const toParent = amount - toWinner;
        console.log('winner', p.name, toWinner, 'toParent:', toParent)
        if (Games[this.module].prizeToStake) {
            this.changeStake(p.id, toWinner)
        } else {
            p[`${this.type}Balance`] += toWinner;
        }
        if(p.parent) {
            p.parent[`${this.type}Balance`] += toParent;
            await p.parent.save();
            if (this.type === 'real') {
                const ref = this.model('referral')({type: 'to games balance', amount: toParent, parent: p.parent, referral: p})
                await ref.save()
            }
        }
        await p.save()
    }
    this.finishTime = moment().unix();
}

modelSchema.statics.reloadFinished = async function () {
    const games = await this.find({finishTime: {$lt: moment().unix() - process.env.GAME_RELOAD_TIME * 1, $gt: 0}});
    for (const game of games) {
        await game.newTable()
        await game.save();
    }
}

modelSchema.methods.newTable = async function () {
    console.log('newTable of game')
    const module = Games[this.module];
    this.finishTime = 0;
    this.history.push({data: this.data, winners: this.winners, date: new Date()});
    this.winners = [];
    this.data = module.defaultData;

    await this
        .populate('waitList', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .execPopulate()
    const players = this.players.concat(this.waitList);
    if (!players.length) {
        this.delete();
        return;
    }
    if (module.shiftFirstTurn) {
        players.push(players.shift());
    }
    this.players = players;
    this.activePlayerTime = 0;
    this.activePlayerIdx = 0;
    this.waitList = [];
    this.bets = [];
    this.stakesArray = this.stakesArray.filter(s => players.map(p => p.id).includes(s.userId));
    module.initTable(this)
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
        .populate('players', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .populate('winners', ['name', 'photo', 'realBalance', 'virtualBalance'])
        .then(async games => {
            for (const g of games) {
                if (!Games[g.module].useTimer) {
                    g.activePlayerTime = 0;
                    await g.save()
                    continue;
                }
                if (g.players.length < 2 || !g.players[g.activePlayerIdx]) continue
                if (g.winners.length) continue;
                if (!g.players.length) continue;
                const userId = g.players[g.activePlayerIdx].id;
                g.autoFold.push(userId);
                await g.doModelTurn(userId, {turn: {bet: -1}});
                if (g.autoFold.filter(u => u.equals(userId)).length > 1) {
                    g.players = g.players.filter(u => !u.equals(userId))
                    console.log('PLAYERS', g.players.length)
                    console.log('WAITLIST 1', g.waitList.length)
                    console.log('USER', userId)
                    g.waitList = g.waitList.filter(u => !u.equals(userId))
                    g.autoFold = g.autoFold.filter(u => !u.equals(userId))
                    console.log('WAITLIST 2', g.waitList.length)
                    await g.save()
                }
            }
        })
}

modelSchema.statics.start = async function (req) {
    const {module, type, stake} = req.body;
    const g = new this({module: module.name, type, data: Games[module.name].defaultData, stake});
    g.name = randomWords({exactly: 1, wordsPerString: 3, formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))})[0];
    console.log(g.module, ' ========START GAME=======', g.name, g.id)
    await g.doModelJoin(req.session.userId);
    return g;
}

modelSchema.virtual('bank')
    .get(function () {
        return Games[this.module].getBank(this)
    });

modelSchema.virtual('blinds')
    .get(function () {
        const obj = {blinds: 2};
        if (!this.players) return obj;
        if (this.players[0]) obj[this.players[0].id] = 'Big'
        if (this.players[1]) obj[this.players[1].id] = 'Small'
        return obj;
    });

modelSchema.virtual('playersBets')
    .get(function () {
        const obj = {}
        if (!this.players) return obj;
        for (const p of this.players) {
            //obj[p.id] = 0;
            for (const b of this.bets.filter(b => b.round === this.round && b.userId === p.id)) {
                if (b.value >= 0) {
                    if (!obj[p.id]) {
                        obj[p.id] = 0
                    }
                    obj[b.userId] += b.value
                }
            }
        }
        return obj;
    });

modelSchema.virtual('maxBet')
    .get(function () {
        if (!this.bets) return 0;
        const roundBets = this.bets.filter(b => b.round === this.round);
        const obj = {}
        for (const b of roundBets) {
            if (!obj[b.userId]) obj[b.userId] = 0;
            obj[b.userId] += b.value
        }
        return Math.max.apply(null, Object.values(obj))
    });

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
        if (!Games[this.module].useTimer || !this.activePlayerTime) return false;
        const t = this.activePlayerTime + process.env.GAME_TURN_TIME * 1 - moment().unix();
        return t / (process.env.GAME_TURN_TIME * 1) * 100;
    });

modelSchema.virtual('reloadTimer')
    .get(function () {
        if (!this.finishTime) return;
        const t = this.finishTime + process.env.GAME_RELOAD_TIME * 1 - moment().unix();
        return t / (process.env.GAME_RELOAD_TIME * 1) * 100;
    });

modelSchema.virtual('link')
    .get(function () {
        return `/games/${this.module}/${this.id}`;
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
        const obj = {};
        if (!this.stakesArray) return obj;
        for (const s of this.stakesArray) {
            obj[s.userId] = s.value;
        }
        return obj;
    })


modelSchema.virtual('date')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
    });


export default mongoose.model(name, modelSchema);



