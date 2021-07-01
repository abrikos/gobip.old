import MinterApi from "server/lib/MinterApi";
import Mongoose from "server/db/Mongoose";
import UnboundApi from "server/lib/UnboundApi";
import BannerApi from "server/lib/BannerApi";
import MixerApi from "server/lib/MixerApi";
import BetApi from "../lib/BetApi";
import SwapBotApi from "../lib/SwapRouteApi";
import GameApi from "../lib/GameApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {

    const c2 = new CronJob('*/4 * * * * *', async function () {
            BetApi.checkDates();
            BannerApi.cronJob();
            const txs = await MinterApi.getTransactions();

            for (const tx of txs) {
                const found = await Mongoose.transaction.findOne({hash: tx.hash});
                if (found) continue;
                GameApi.checkTransaction(tx)
                BetApi.checkTransaction(tx);
                BannerApi.checkTransaction(tx);
                UnboundApi.checkTransaction(tx);
                MixerApi.checkTransaction(tx);
                SwapBotApi.checkTransaction(tx);
                MinterApi.checkWithdrawals(tx);

            }
            MinterApi.sendPayments();
        }, null, true, 'America/Los_Angeles'
    )

    const c21 = new CronJob('* * * * * *', async function () {
        MinterApi.testWallet()
        }, null, true, 'America/Los_Angeles'
    )

    const c3 = new CronJob('*/10 * * * * *', async function () {
            BetApi.cryptoCompare('BTC/USD')
            BetApi.pairs();
        }, null, true, 'America/Los_Angeles'
    )

    const c4 = new CronJob('0 0 * * * *', async function () {
            MinterApi.updateBalances()
        }, null, true, 'America/Los_Angeles'
    )


    MinterApi.createMainWallet();
    BannerApi.lotteryInit()

    app.post('/api/tx/list/all', async (req, res) => {
        Mongoose.unbound.find()
            .sort({createdAt: -1})
            .then(txs => {
                res.send(txs)
            })
    });

    app.post('/api/unbound/daily/:coin/:limit', async (req, res) => {
        UnboundApi.daily(req.params.limit * 1 || 30, {coin: req.params.coin})
            .then(txs => {
                res.send(txs)
            })
    });


    //Mongoose.payment.deleteMany({}).then(console.log)


//Mongoose.transaction.aggregate(aggregateCoin).then(console.log)
    app.post('/api/network', async (req, res) => {
        res.send(MinterApi.network)
    });

    app.post('/api/coins', async (req, res) => {
        const aggregateCoin = [
            {$group: {_id: {coin: '$coin'}, coin: {$first: "$coin"}}},
            {$match: {coin: {$ne: null}}},
            {$sort: {coin: 1}},
            //{$addFields: {coin: "$coin"}},
            //{$project: {coin: 1}}
        ];
        Mongoose.unbound.aggregate(aggregateCoin)
            .then(txs => {
                res.send(txs)
            })
    });


}


//Mongoose.transaction.deleteMany({})    .then(console.log)
//Mongoose.transaction.find()    .then(console.log)
