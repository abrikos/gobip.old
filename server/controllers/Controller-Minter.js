import axios from "axios";
import {Minter, TX_TYPE, decodeTx} from "minter-js-sdk";
import MinterApi from "server/lib/MinterApi";
import Mongoose from "server/db/Mongoose";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    //1e-18
    const jobs = new CronJob('*/2 * * * * *', async function () {
        await MinterApi.getUnboundTxs(1);

        }, null, true, 'America/Los_Angeles'
    )


    app.post('/api/tx/list/all', async (req, res) => {
        Mongoose.transaction.find()
            .sort({createdAt: -1})
            .then(txs => {
                res.send(txs)
            })
    });

    app.post('/api/daily/:coin/:limit', async (req, res) => {
        const aggregateDaily = [
            {
                $group: {
                    _id: {
                        month: {$month: "$date"},
                        day: {$dayOfMonth: "$date"},
                        year: {$year: "$date"},
                        coin: "$coin"
                    },
                    first: {$min: "$date"},
                    values: {$sum: "$value"},
                    coin: {$first: "$coin"}

                },

            },
            {$addFields: {coin: "$coin"}},
            {$sort: {first: 1}},
            {
                $project: {
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$first", timezone: "UTC"}},
                    values: {$round: [{$divide: ["$values", 1e18]}, 1]},
                    createdAt: 1,
                    coin: 1
                }
            },

        ]
        aggregateDaily.push({$limit: req.params.limit * 1 || 30})
        aggregateDaily.push({$match: {coin: req.params.coin}})
        Mongoose.transaction.aggregate(aggregateDaily)
            .then(txs => {
                res.send(txs)
            })
    });


//Mongoose.transaction.aggregate(aggregateCoin).then(console.log)
    app.post('/api/coins', async (req, res) => {
        const aggregateCoin = [
            {$group: {_id: {coin: '$coin'}, coin: {$first: "$coin"}}},
            {$match: {coin: {$ne: null}}},
            {$sort: {coin: 1}},
            //{$addFields: {coin: "$coin"}},
            //{$project: {coin: 1}}
        ];
        Mongoose.transaction.aggregate(aggregateCoin)
            .then(txs => {
                res.send(txs)
            })
    });

}


//Mongoose.transaction.deleteMany({})    .then(console.log)
//Mongoose.transaction.find()    .then(console.log)
