import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import MinterApi from "server/lib/MinterApi";
import BetApi from "../lib/BetApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {

    app.post('/api/bet/crypto/pair/:from/:to', (req, res) => {
        BetApi.aggregatePairData(`${req.params.from}/${req.params.to}`).then(r => res.send(r))
    });

    app.post('/api/bet/price/:from/:to', (req, res) => {
        Mongoose.crypto.findOne({pair: `${req.params.from}/${req.params.to}`})
            .sort({createdAt:-1})
            .then(r => res.send(r))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/bet/view/:id', (req, res) => {
        if (req.params.id === 'create') return res.sendStatus(200)
        Mongoose.bet.findById(req.params.id)
            .populate({path: 'walletF', select: ['address', 'balance']})
            .populate({path: 'walletA', select: ['address', 'balance']})
            .then(r => {
                if (!r) return res.status(404).send('Bet not found')
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });


    app.post('/api/bet/list', (req, res) => {
        Mongoose.bet.find({walletF: {$ne: null}, walletA: {$ne: null}}) //, checkDate: {$gt: new Date()}
            .populate({path: 'walletF', select: ['address', 'balance']})
            .populate({path: 'walletA', select: ['address', 'balance']})
            .sort({checkDate: -1})
            .then(r => {
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    //Mongoose.wallet.find({address:'Mx7d34060e7679bf8f2cf5a2f8e7663c1c25c588dd'}).then(console.log)

    app.post('/api/cabinet/bet/list', passport.isLogged, (req, res) => {
        Mongoose.bet.find({user: req.session.userId, walletF: {$ne: null}, walletA: {$ne: null}})
            .populate({path: 'walletF', select: ['address', 'balance']})
            .populate({path: 'walletA', select: ['address', 'balance']})
            .sort({checkDate: -1})
            .then(r => {
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/cabinet/bet/view/:id', passport.isLogged, (req, res) => {
        Mongoose.bet.findOne({user: req.session.userId, _id: req.params.id})
            .populate({path: 'walletF', select: ['address', 'balance']})
            .populate({path: 'walletA', select: ['address', 'balance']})
            .populate('user')
            .then(r => {
                if (!r) return res.status(404).send('Bet not found')
                res.send(r)
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    //Mongoose.bet.deleteMany({}).then(console.log)
    //Mongoose.bet.find({'votesF.1': {$exists: false}}).then(console.log).catch(console.log)

    app.post('/api/cabinet/bet/delete/:id', passport.isLogged, (req, res) => {
        Mongoose.bet.findOne({user: req.session.userId, _id: req.params.id})
            .populate({path: 'walletF', select: ['address', 'balance']})
            .populate({path: 'walletA', select: ['address', 'balance']})
            .then(r => {
                if (r.sum) return res.status(500).send('The bet has been paid. Removal prohibited')
                res.status(200).send('Ok')
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })

    });

    app.post('/api/cabinet/bet/update/:id', passport.isLogged, (req, res) => {
        Mongoose.bet.findOne({user: req.session.userId, _id: req.params.id})
            .populate({path: 'walletF', select: ['address', 'balance']})
            .populate({path: 'walletA', select: ['address', 'balance']})
            .then(r => {
                if (!r) return res.status(404).send('Bet not found')
                if (r.sum) return res.status(500).send('The bet has been paid. Update prohibited')

                r.pair = req.body.pair;
                r.condition = req.body.condition;
                r.value = req.body.value;
                r.checkDate = req.body.checkDate;
                r.save()
                    .then(r => res.send(r))
                    .catch(e => {
                        res.status(500).send(app.locals.adaptError(e))
                    })
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    app.post('/api/cabinet/bet/create/new', passport.isLogged, (req, res) => {
        req.body.user = req.session.userId;
        Mongoose.bet.create(req.body)
            .then(async r => {
                r.walletF = await MinterApi.newWallet('bet', null, req.session.userId)
                r.walletA = await MinterApi.newWallet('bet', null, req.session.userId)
                r.save()
                    .then(r => res.send(r))
            })
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

    //BetApi.aggregatePairData('BTC-USD').then(console.log)
    app.post('/api/crypto/pairs', (req, res) => {
        BetApi.getPairs()
            .then(p => res.send(p))
            .catch(e => {
                res.status(500).send(app.locals.adaptError(e))
            })
    });

}