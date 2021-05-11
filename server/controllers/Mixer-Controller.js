import Mongoose from "server/db/Mongoose";
import passport from "server/lib/passport";
import MixerApi from "server/lib/MixerApi";
import MinterApi from "server/lib/MinterApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {

    //MinterApi.newMixerWallet('Mx470a6aa7110e799cf3978930fef25569d162babc');
    //MinterApi.getMixerTxs().then(console.log)

    //Mongoose.banner.deleteMany().then(console.log);
    //Mongoose.payment.deleteMany({}).then(console.log)
    //Mongoose.payment.find({status:3}).then(console.log)
    //Mongoose.wallet.find().then(console.log)
    /*if (process.env.SEED) {
        const w = walletFromMnemonic(process.env.SEED);
        MinterApi.walletBalance(w.getAddressString())
            .then(balance => {
                Mongoose.wallet.create({
                    address: w.getAddressString(),
                    seedPhrase: process.env.SEED,
                    balance
                }).then(console.log).catch(e => console.log('exists', e.message))
            })
    } else {
        console.log('!!!!!! NO process.env.SEED  !!!!')
    }*/

   // Mongoose.wallet.aggregate([{$group: {_id: "", amount: {$sum: "$balance"}}}]).then(console.log)

    app.post('/api/mixer/address', (req, res) => {
        MixerApi.createAddressForMixing(req.body.to)
            .then(r=>res.send(r))
            .catch(e => res.status(500).send(e.message))
    });

    app.post('/api/mixer/calc', async (req, res) => {
        const txParams = await MixerApi.mixedPayments({address: 'Mxe43ac6c88f573a7703fe7f2c3d8d342818e8fb97', to: 'Mx111ac6c88f573a7703fe7f2c3d8d342818e8fb97', balance: req.body.value}, {value: req.body.value})
        const commission = await MinterApi.getCommission();
        const data = {
            balance: txParams.map(t => t.value).reduce((a, b) => a + b, 0) - commission * txParams.length,
            count: txParams.length,
            value: req.body.value,
            commission
        }
        const amount = await MixerApi.totalAmount();
        if (amount < data.value - data.profit - data.commission * data.count) data.exceed = true;
        res.send(data)
    });

    app.post('/api/cabinet/mixer/wallets', passport.isLogged, (req, res) => {
        Mongoose.wallet.find({user: req.session.userId, type:'mixer'})
            .then(r => res.send(r))
    });

    app.post('/api/mixer/total-amount', async (req, res) => {
        res.send({amount: await MixerApi.totalAmount()})
    });

    app.post('/api/mixer/wallets/top', (req, res) => {
        Mongoose.wallet.find({user: req.session.userId})
            .sort({balance: -1})
            .limit(10)
            .then(r => res.send(r))
    });

    app.post('/api/cabinet/mixer/wallet/create', passport.isLogged, (req, res) => {
        MinterApi.newWallet('mixer', '', req.session.userId)
            .then(w => res.send(w))
    });

}
