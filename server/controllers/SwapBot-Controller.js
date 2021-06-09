import MixerApi from "../lib/MixerApi";
import passport from "server/lib/passport";
import Mongoose from "../db/Mongoose";
import MinterApi from "../lib/MinterApi";
import randomWords from "random-words";
import SwapBotApi from "../lib/SwapBotApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    const c3 = new CronJob('0 * * * * *', async function () {
            SwapBotApi.coins();
        }, null, true, 'America/Los_Angeles'
    )
    //Mongoose.swapbot.cleanIndexes(function (err, results) {       console.log(results)    });
    //SwapBotApi.coins();
    //Mongoose.coin.find().then(console.log)

    app.post('/api/swapbot/coins', (req, res) => {
        Mongoose.coin.find().then(r => res.send(r))
    });

    app.post('/api/swapbot/:id/update', passport.isLogged, (req, res) => {
        Mongoose.swapbot.findById(req.params.id)
            //.populate('wallet', ['address', 'balance'])
            .then(r => {
                for (const key in req.body) {
                    r[key] = req.body[key]
                }
                r.save()
                    .then(r2 => res.send(r2))

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

    app.post('/api/swapbot/route/:id/switch', passport.isLogged, (req, res) => {
        Mongoose.swapbotroute.findById(req.params.id)
            .populate('bot')
            .then(route => {
                if(!route.bot.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message:'Forbidden'}));
                route.enabled = !route.enabled
                route.save()
                res.sendStatus(200)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/route/:id/delete', passport.isLogged, (req, res) => {
        Mongoose.swapbotroute.findById(req.params.id)
            .populate('bot')
            .then(route => {
                if(!route.bot.user.equals(req.session.userId)) return res.status(403).send(app.locals.adaptError({message:'Forbidden'}));
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
            .populate('routes')
            .then(r => res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/:id/route/add', passport.isLogged, async (req, res) => {
        Mongoose.swapbot.findById(req.params.id)
            .then(bot => {
                if (!req.body.newRoute) return res.status(500).send(app.locals.adaptError({message: 'Empty route'}))
                const coins = req.body.newRoute.split(' ');
                console.log(coins)
                Mongoose.coin.find({symbol: {$in: coins}})
                    .then(found => {
                        const ids = [];
                        const symbols = [];
                        for (const c of coins) {
                            const f = found.find(f => f.symbol === c)
                            if (f) {
                                ids.push(f.id)
                                symbols.push(f.symbol)
                            } else {
                                return res.status(500).send(app.locals.adaptError({message: `Wrong coin "${c}"`}))
                            }
                        }
                        Mongoose.swapbotroute.create({ids, symbols, bot})
                        res.sendStatus(200)
                    })


            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/swapbot/create', passport.isLogged, (req, res) => {
        MinterApi.newWallet('swapbot', '', req.session.userId)
            .then(wallet => {
                console.log(wallet)
                const name = randomWords({
                    exactly: 1,
                    wordsPerString: 3,
                    formatter: (word, i) => i ? word : word.slice(0, 1).toUpperCase().concat(word.slice(1))
                })[0];
                Mongoose.swapbot.create({user: req.session.userId, wallet, name})
                res.sendStatus(200)
            })
    });

}