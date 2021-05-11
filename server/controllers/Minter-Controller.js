import MinterApi from "server/lib/MinterApi";
import Mongoose from "server/db/Mongoose";
import UnboundApi from "server/lib/UnboundApi";
import BannerApi from "server/lib/BannerApi";
import MixerApi from "server/lib/MixerApi";
import CryptoApi from "../lib/CryptoApi";
import BetApi from "../lib/BetApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {

    const c2 = new CronJob('*/4 * * * * *', async function () {
            BetApi.checkDates();
            BannerApi.cronJob();
            const txs = await MinterApi.getTransactions();
            for (const tx of txs) {
                BetApi.checkTransaction(tx);
                BannerApi.checkTransaction(tx);
                UnboundApi.checkTransaction(tx);
                MixerApi.checkTransaction(tx);
                MinterApi.checkWithdrawals(tx);
            }
            MinterApi.sendPayments();
        }, null, true, 'America/Los_Angeles'
    )

    const c3 = new CronJob('0 0 * * * *', async function () {
            CryptoApi.cryptoCompare('BTC-USD')
            CryptoApi.minterBipUsd()
        }, null, true, 'America/Los_Angeles'
    )

    MinterApi.createMainWallet();
    BannerApi.lotteryInit()
//BannerApi.fundsBack()
//BannerApi.attachLottery()

    /*const tx = JSON.parse('{"hash":"Mtb4a299d02665ea1090a7e7910fa27959a6b0ea27f9beb5e715c5912c0e267299", "raw_tx":"f87f82011501018008adeca04c45b862300e0d6a05febb742caa0448aef0e80c53d341bb10236b039ac54c1a80890b183a61aa33720000808001b845f8431ca05a61faedef3c0ce2d050b23750a1f5174e0fe001ac51ee151d36caaffbfa4409a005c6c9b5d26497d625d1b2daebbed44f201643dd24aa3ad21b41e701843f49cc", "height":"3749245", "index":"1", "from":"Mxb69a3fc9df56ec0468b024c2a225d10eda4fd3af", "nonce":"277", "gas":"21", "gas_price":"1", "gas_coin":{"id":"0", "symbol":"BIP"}, "type_hex":"0x08", "type":"8", "data":{"@type":"type.googleapis.com/api_pb.UnbondData", "pub_key":"Mp4c45b862300e0d6a05febb742caa0448aef0e80c53d341bb10236b039ac54c1a", "coin":{"id":"0", "symbol":"BIP"}, "value":"204660000000000000000"}, "payload":"", "service_data":"", "tags":{"tx.coin_id":"0", "tx.commission_amount":"5000000000000000000", "tx.commission_coin":"0", "tx.commission_conversion":"bancor", "tx.commission_in_base_coin":"5000000000000000000", "tx.commission_price":"5000000000000000000", "tx.commission_price_coin":"0", "tx.from":"b69a3fc9df56ec0468b024c2a225d10eda4fd3af", "tx.public_key":"4c45b862300e0d6a05febb742caa0448aef0e80c53d341bb10236b039ac54c1a", "tx.type":"08"}, "code":"0", "log":""}');
    UnboundApi.checkTransaction(tx)*/
    //Mongoose.lottery.deleteMany({}).then(console.log)
    //Mongoose.unbound.find().then(console.log)
    //daily(10,{coin: 'BIP'}).then(console.log)

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
