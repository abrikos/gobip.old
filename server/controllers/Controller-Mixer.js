import MinterApi from "server/lib/MinterApi";
import Mongoose from "server/db/Mongoose";
import {walletFromMnemonic} from "minterjs-wallet";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    //1e-18
    const jobs = new CronJob('*/10 * * * * *', function () {
            MinterApi.updateBalances();
            MinterApi.getBlockTxs();
            MinterApi.sendPayments();
            MinterApi.closePayments();
        }, null, true, 'America/Los_Angeles'
    )


    //MinterApi.newMixerWallet('Mx470a6aa7110e799cf3978930fef25569d162babc');
    //MinterApi.getMixerTxs().then(console.log)

    //Mongoose.wallet.deleteMany({}).then(console.log)
    //Mongoose.payment.deleteMany({}).then(console.log)
    //Mongoose.payment.find({status:3}).then(console.log)
    Mongoose.wallet.find({owned: true}).then(console.log)
    if (process.env.SEED) {
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
    }


    app.post('/api/mixer/address', async (req, res) => {
        const {to} = req.body;
        if (!to) return res.send({error: {message: 'No address specified'}})
        const valid = MinterApi.checkAddress(to);
        if (!valid) return res.send({error: {message: 'Invalid address'}})
        const wallet = await MinterApi.newWallet(to);
        const {address} = wallet;
        const amount = await MinterApi.totalAmount()
        res.send({address, amount, network: MinterApi.network})
    });

    app.post('/api/mixer/calc', async (req, res) => {
        const txParams = await MinterApi.prepareTxParamsForPayments({address: 'Mxe43ac6c88f573a7703fe7f2c3d8d342818e8fb97', to: 'Mx111ac6c88f573a7703fe7f2c3d8d342818e8fb97', balance: req.body.value * MinterApi.divider})
        res.send({network: MinterApi.network, balance: txParams.map(t => t.data.value).reduce((a, b) => a + b, 0), count: txParams.length})
    });

}


//Mongoose.transaction.deleteMany({})    .then(console.log)
//Mongoose.transaction.find()    .then(console.log)
