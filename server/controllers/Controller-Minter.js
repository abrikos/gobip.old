import MinterApi from "server/lib/MinterApi";
import Mongoose from "server/db/Mongoose";
import UnboundApi from "server/lib/UnboundApi";
import BannerApi from "server/lib/BannerApi";
import MixerApi from "server/lib/MixerApi";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    const jobs = new CronJob('*/4 * * * * *', async function () {
            MinterApi.updateBalances();
            const txs = await MinterApi.getTransactions();
            for (const tx of txs) {
                UnboundApi.checkTransaction(tx);
                BannerApi.checkTransaction(tx);
                MixerApi.checkTransaction(tx);
            }
            MixerApi.sendPayments();
        }, null, true, 'America/Los_Angeles'
    )

    /*const tx = JSON.parse('{"hash":"Mtb4a299d02665ea1090a7e7910fa27959a6b0ea27f9beb5e715c5912c0e267299", "raw_tx":"f87f82011501018008adeca04c45b862300e0d6a05febb742caa0448aef0e80c53d341bb10236b039ac54c1a80890b183a61aa33720000808001b845f8431ca05a61faedef3c0ce2d050b23750a1f5174e0fe001ac51ee151d36caaffbfa4409a005c6c9b5d26497d625d1b2daebbed44f201643dd24aa3ad21b41e701843f49cc", "height":"3749245", "index":"1", "from":"Mxb69a3fc9df56ec0468b024c2a225d10eda4fd3af", "nonce":"277", "gas":"21", "gas_price":"1", "gas_coin":{"id":"0", "symbol":"BIP"}, "type_hex":"0x08", "type":"8", "data":{"@type":"type.googleapis.com/api_pb.UnbondData", "pub_key":"Mp4c45b862300e0d6a05febb742caa0448aef0e80c53d341bb10236b039ac54c1a", "coin":{"id":"0", "symbol":"BIP"}, "value":"204660000000000000000"}, "payload":"", "service_data":"", "tags":{"tx.coin_id":"0", "tx.commission_amount":"5000000000000000000", "tx.commission_coin":"0", "tx.commission_conversion":"bancor", "tx.commission_in_base_coin":"5000000000000000000", "tx.commission_price":"5000000000000000000", "tx.commission_price_coin":"0", "tx.from":"b69a3fc9df56ec0468b024c2a225d10eda4fd3af", "tx.public_key":"4c45b862300e0d6a05febb742caa0448aef0e80c53d341bb10236b039ac54c1a", "tx.type":"08"}, "code":"0", "log":""}');
    UnboundApi.checkTransaction(tx)*/
    //Mongoose.unbound.find().then(console.log)
    //daily(10,{coin: 'BIP'}).then(console.log)

    app.post('/api/tx/list/all', async (req, res) => {
        Mongoose.unbound.find()
            .sort({createdAt: -1})
            .then(txs => {
                res.send(txs)
            })
    });

    app.post('/api/daily/:coin/:limit', async (req, res) => {
        daily(req.params.limit * 1 || 30, {coin: req.params.coin})
            .then(txs => {
                res.send(txs)
            })
    });

    //Mongoose.payment.deleteMany({}).then(console.log)

    async function daily(limit, match) {
        const aggregateDaily = [
            {
                $group: {
                    _id: {
                        month: {$month: "$createdAt"},
                        day: {$dayOfMonth: "$createdAt"},
                        year: {$year: "$createdAt"},
                        coin: "$coin"
                    },
                    date: {$min: "$createdAt"},
                    values: {$sum: "$value"},
                    coin: {$first: "$coin"}

                },

            },

            {$addFields: {coin: "$coin"}},
            {$sort: {date: 1, _id: 1}},
            {
                $project: {
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$date", timezone: "UTC"}},
                    values: {$round: ["$values", 1]},
                    coin: 1
                }
            },

        ]
        aggregateDaily.push({$match: match})
        return Mongoose.unbound.aggregate(aggregateDaily).limit(limit)
    }



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
