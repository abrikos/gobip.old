import axios from "axios";
//import {Minter, TX_TYPE} from "minter-js-sdk";
import Mongoose from "server/db/Mongoose";

const CronJob = require('cron').CronJob;
let blockHeight = 0;


module.exports.controller = function (app) {

    //1e-18
    const jobs = new CronJob('* * * * * *', async function () {
        axios.get('https://api.minter.one/v2/status')
            .then(res => {
                    txFromBlock(res.data.latest_block_height)
                }
            )
            .catch(r => console.log(r.response.status, r.response.statusText))
    }, null, true, 'America/Los_Angeles');

    function txFromBlock(bh) {
        if (blockHeight !== bh) {
            blockHeight = bh;
            axios.get(`https://api.minter.one/v2/block/${bh}`)
                .then(res => {
                    //console.log(bh, res.data.result.transactions)
                    for (const tx of res.data.transactions) {

                        if (tx.type * 1 === 8) {
                            console.log(tx.data)
                            tx.value = tx.data.value;
                            tx.coin = tx.data.coin.symbol;

                            Mongoose.transaction.create(tx)
                                .then()
                                .catch()
                            //fs.writeFile("tx.log", JSON.stringify(tx),()=>{})
                        }
                    }
                })
                .catch(console.log)

        }
    }

    //for(let i = 3273115; i< 3273127; i++){        txFromBlock(i)    }

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
                        month: {$month: "$createdAt"},
                        day: {$dayOfMonth: "$createdAt"},
                        year: {$year: "$createdAt"},
                        coin: "$coin"
                    },
                    first: {$min: "$createdAt"},
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
        aggregateDaily.push({$match: {coin:req.params.coin}})
        Mongoose.transaction.aggregate(aggregateDaily)
            .then(txs => {
                res.send(txs)
            })
    });



    //Mongoose.transaction.aggregate(aggregateCoin).then(console.log)
    app.post('/api/coins', async (req, res) => {
        const aggregateCoin = [
            {$group: {_id: {coin: '$coin'}, coin: {$first: "$coin"}}},
            {$match:{coin:{$ne:null}}}
            //{$addFields: {coin: "$coin"}},
            //{$project: {coin: 1}}
        ];
        Mongoose.transaction.aggregate(aggregateCoin)
            .then(txs => {
                res.send(txs)
            })
    });


    const aggr = [
        {
            $group: {
                _id: {
                    month: {$month: "$createdAt"},
                    day: {$dayOfMonth: "$createdAt"},
                    year: {$year: "$createdAt"},
                    coin: "$coin"
                },
                first: {$min: "$createdAt"},
                values: {$sum: "$value"},
                coin: {$first: "$coin"}

            },

        },
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
    aggr.push({$limit: 1})
    aggr.push({$match: {coin:'BIP'}})
    Mongoose.transaction.aggregate(aggr).then(console.log)
}


//Mongoose.transaction.deleteMany({})    .then(console.log)
//Mongoose.transaction.find()    .then(console.log)
