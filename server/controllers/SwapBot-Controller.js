import passport from "server/lib/passport";
import Mongoose from "../db/Mongoose";
import MinterApi from "../lib/MinterApi";
import randomWords from "random-words";
import SwapBotApi from "../lib/SwapBotApi";
import md5 from "md5";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    const c3 = new CronJob('0 * * * * *', async function () {
            SwapBotApi.coins();
        }, null, true, 'America/Los_Angeles'
    )
    //Mongoose.user.find().populate('referrals').then(console.log)
    //Mongoose.swapbot.cleanIndexes(function (err, results) {       console.log(results)    });
    //Mongoose.swapbotroute.deleteMany().then(console.log);
    //Mongoose.coin.deleteMany().then(()=> {        SwapBotApi.coins()    });


    //MinterApi.getTxParamsCommission({type: '0x01', nonce: 1, data: {to: 'Mxaaa40f7d2e91705c75a0430557c469a5850aeaaa', value: 100, coin: 0}, chainId: 2}).then(console.log)
    //Mongoose.coin.find({symbol:'MNT'}).then(console.log)
    //Mongoose.wallet.findById('60c0ad8bbd0c0b2bcc35ed8d').then(console.log)

    app.post('/api/swapbot/coins', (req, res) => {
        Mongoose.coin.find().then(r => res.send(r))
    });

    app.post('/api/swapbot/address/:address', (req, res) => {
        MinterApi.get('/address/' + req.params.address)
            .then(a => {
                const balance = []
                for (const b of a.balance) {
                    balance.push({symbol: b.coin.symbol, value: MinterApi.fromPip(b.value)})
                }
                res.send(balance)
            })
    });

    app.post('/api/swapbot/doswap/:id', passport.isLogged, (req, res) => {
        Mongoose.swapbotroute.findOne({_id:req.params.id, payDate:{$ne:null}})
            .populate('wallet')
            .populate({path: 'bot', populate: 'wallet'})
            .then(route=>{
                if(!route.bot.user.equals(req.session.userId))  return res.status(403).send(app.locals.adaptError({message: 'Forbidden'}));
                SwapBotApi.sendSwapRoute(route)
                    .then(r=> {
                        route.lastTx = r.hash;
                        route.execDate = new Date();
                        route.save()
                        res.sendStatus(200)
                    })
                    .catch(e=>{
                        route.lastError = e.message.replace(/(\d+)/,'$1$1');
                        route.execDate = new Date();
                        route.save()
                        res.status(302).send(app.locals.adaptError(e));
                    })
            })
    });

    app.post('/api/swapbot/:id/update', passport.isLogged, (req, res) => {
        Mongoose.swapbot.findById(req.params.id)
            //.populate('wallet', ['address', 'balance'])
            .then(r => {
                if (!r) return res.status(404).send(app.locals.adaptError({message: 'Not found'}));
                if (!r.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message: 'Forbidden'}));
                for (const key in req.body) {
                    r[key] = req.body[key]
                }
                r.save()
                res.sendStatus(200)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/route/:id/update', passport.isLogged, (req, res) => {
        Mongoose.swapbotroute.findById(req.params.id)
            .populate('bot')
            .then(r => {
                if (!r) return res.status(404).send(app.locals.adaptError({message: 'Not found'}));
                if (!r.bot.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message: 'Forbidden'}));
                for (const key in req.body) {
                    r[key] = req.body[key]
                }
                r.save()
                res.sendStatus(200)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/list', passport.isLogged, (req, res) => {
        Mongoose.swapbot.find({user: req.session.userId})
            .populate('wallet', ['address', 'balance'])
            .then(r => res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/route/:id/delete', passport.isLogged, (req, res) => {
        Mongoose.swapbotroute.findById(req.params.id)
            .populate('bot')
            .then(route => {
                if (!route) return res.status(404).send(app.locals.adaptError({message: 'Not found'}));
                if (!route.bot.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message: 'Forbidden'}));
                route.delete()
                res.sendStatus(200)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/:id/view', passport.isLogged, (req, res) => {
        Mongoose.swapbot.findById(req.params.id)
            .populate('wallet', ['address', 'balance'])
            .populate({path: 'routes', populate: {path: 'wallet', select: ['address', 'balanceReal']}})
            .then(r => {
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });


    app.post('/api/swapbot/route/check', async (req, res) => {
        SwapBotApi.checkRoute(req.body.newRoute)
            .then(r=>res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/:id/route/add', passport.isLogged, async (req, res) => {
        Mongoose.swapbot.findById(req.params.id)
            .then(bot => {
                if (!bot) return res.status(404).send(app.locals.adaptError({message: 'Not found'}));
                if (!req.body.newRoute) return res.status(500).send(app.locals.adaptError({message: 'Empty route'}))
                const coins = req.body.newRoute.trim().toUpperCase().split(/\s+/);
                Mongoose.coin.find({symbol: {$in: coins}})
                    .then(found => {
                        const ids = [];
                        const symbols = [];
                        for (const c of coins) {
                            const f = found.find(f => f.symbol === c)
                            if (f) {
                                ids.push(f.id)
                                symbols.push(f.symbol.toUpperCase())
                            } else {
                                return res.status(500).send(app.locals.adaptError({message: `Wrong coin "${c}"`}))
                            }
                        }
                        MinterApi.newWallet('swapbotroute', '', req.session.userId)
                            .then(wallet => {
                                Mongoose.swapbotroute.create({ids, symbols, bot, wallet})
                                res.sendStatus(200)
                            })

                    })


            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/create', passport.isLogged, (req, res) => {
        MinterApi.newWallet('swapbot', '', req.session.userId)
            .then(wallet => {
                const name = randomWords({
                    exactly: 1,
                    wordsPerString: 3,
                    formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))
                })[0];
                Mongoose.swapbot.create({user: req.session.userId, wallet, name})
                    .then(r => res.send(r))

            })
    });

}