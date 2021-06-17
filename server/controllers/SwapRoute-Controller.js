import passport from "server/lib/passport";
import Mongoose from "../db/Mongoose";
import MinterApi from "../lib/MinterApi";
import randomWords from "random-words";
import SwapBotApi from "../lib/SwapRouteApi";
import md5 from "md5";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    const c3 = new CronJob('* * * * * *', async function () {
            SwapBotApi.coins();
        }, null, true, 'America/Los_Angeles'
    )
    const c10 = new CronJob('*/10 * * * * *', async function () {
            SwapBotApi.doRoutes();
        }, null, true, 'America/Los_Angeles'
    )
    //Mongoose.user.find().populate('referrals').then(console.log)
    //Mongoose.coin.cleanIndexes(function (err, results) {       console.log(results)    });
    //Mongoose.swapbotroute.findById('60c84298023e11b767346727').then(console.log);
    //Mongoose.coin.deleteMany().then(()=> {        SwapBotApi.coins()    });


    //MinterApi.getTxParamsCommission({type: '0x01', nonce: 1, data: {to: 'Mxaaa40f7d2e91705c75a0430557c469a5850aeaaa', value: 100, coin: 0}, chainId: 2}).then(console.log)
    //Mongoose.coin.find({symbol:'MNT'}).then(console.log)
    //Mongoose.wallet.findById('60c0ad8bbd0c0b2bcc35ed8d').then(console.log)

    app.post('/api/swap-route/transactions', (req, res) => {
        Mongoose.transaction.find({type:'23'})
            .sort({createdAt:-1})
            .limit(30)
            .then(r=>res.send(r))
    });

    app.post('/api/swap-route/coins', (req, res) => {
        Mongoose.coin.find().then(r => res.send(r))
    });

    app.post('/api/swap-route/address/:address', (req, res) => {
        MinterApi.get('/address/' + req.params.address)
            .then(a => {
                const balance = []
                for (const b of a.balance) {
                    balance.push({symbol: b.coin.symbol, value: MinterApi.fromPip(b.value)})
                }
                res.send(balance)
            })
    });

    app.post('/api/swap-route/doswap/:id', passport.isLogged, (req, res) => {
        Mongoose.swaproute.findOne({_id: req.params.id, payDate: {$ne: null}, user:req.session.userId})
            .populate('wallet')
            .populate({path: 'user', populate: 'swapWallet'})
            .then(route => {
                SwapBotApi.sendSwapRoute(route, route.user.swapWallet)
                    .then(()=>res.sendStatus(200))
                    .catch(e => {
                        res.status(500).send(app.locals.adaptError(e))
                    })
            })
    });

    app.post('/api/swap-route/:id/update', passport.isLogged, (req, res) => {
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

    app.post('/api/swap-route/route/:id/change', passport.isLogged, (req, res) => {
        Mongoose.swaproute.findById(req.params.id)
            .then(r => {
                if (!r) return res.status(404).send(app.locals.adaptError({message: 'Not found'}));
                if (!r.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message: 'Forbidden'}));
                SwapBotApi.checkRoute(req.body.name)
                    .then(route => {
                        r.ids = route.ids;
                        r.symbols = route.symbols;
                        r.save();
                        res.sendStatus(200)
                    })
                    .catch(e => {
                        res.status(500).send(app.locals.adaptError(e))
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })

    })

    app.post('/api/swap-route/route/:id/update', passport.isLogged, (req, res) => {
        Mongoose.swaproute.findById(req.params.id)
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

    app.post('/api/swap-route/wallet/create', passport.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .then(user => {
                MinterApi.newWallet('swap-route', '', req.session.userId)
                    .then(wallet => {
                        user.swapWallet = wallet;
                        user.save();
                        res.sendStatus(200)
                    })
            })
    })
    app.post('/api/swap-route/list', passport.isLogged, (req, res) => {
        Mongoose.swaproute.find({user: req.session.userId})
            .populate('wallet', ['address', 'balance'])
            .then(r => res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swap-route/wallet', passport.isLogged, (req, res) => {
        Mongoose.user.findById(req.session.userId)
            .populate('swapWallet', ['address', 'balance'])
            .then(user => {
                const wallet = user.swapWallet;
                if (!wallet) return res.send({})
                const {address} = wallet;
                MinterApi.get('/address/' + wallet.address)
                    .then(a => {
                        const balance = []
                        for (const b of a.balance) {
                            balance.push({symbol: b.coin.symbol, value: MinterApi.fromPip(b.value)})
                        }
                        res.send({balance, address})
                    })
                    .catch(e => {
                        res.status(500).send(app.locals.adaptError(e))
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swap-route/:id/delete', passport.isLogged, (req, res) => {
        Mongoose.swapbot.findById(req.params.id)
            .then(bot => {
                if (!bot) return res.status(404).send(app.locals.adaptError({message: 'Not found'}));
                if (!bot.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message: 'Forbidden'}));
                Mongoose.swapbotroute.deleteMany({bot}).then(() => {
                });
                bot.delete();
                res.sendStatus(200)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swap-route/route/:id/delete', passport.isLogged, (req, res) => {
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

    app.post('/api/swap-route/:id/view', passport.isLogged, (req, res) => {
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


    app.post('/api/swap-route/route/check', async (req, res) => {
        SwapBotApi.checkRoute(req.body.newRoute)
            .then(r => res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swap-route/route/add', passport.isLogged, async (req, res) => {
        SwapBotApi.checkRoute(req.body.newRoute)
            .then(route => {
                MinterApi.newWallet('swap-route-pay', '', req.session.userId)
                    .then(wallet => {
                        Mongoose.swaproute.create({user:req.session.userId, wallet, ...route})
                        res.sendStatus(200)
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })

    });

    app.post('/api/swap-route/create', passport.isLogged, (req, res) => {
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