import MinterApi from "server/lib/MinterApi";
import Mongoose from "server/db/Mongoose";
import {generateWallet, walletFromMnemonic} from "minterjs-wallet";

const CronJob = require('cron').CronJob;

module.exports.controller = function (app) {
    //1e-18
    const jobs = new CronJob('*/2 * * * * *', async function () {
        await MinterApi.getUnboundTxs(1);

        }, null, true, 'America/Los_Angeles'
    )


    //MinterApi.newMixerWallet('Mx470a6aa7110e799cf3978930fef25569d162babc');
    //MinterApi.getMixerTxs().then(console.log)


    if(process.env.SEED) {
        const wallet = walletFromMnemonic(process.env.SEED);
        //Mongoose.mixer.deleteMany({}).then(console.log)
        Mongoose.mixer.create({
            address: wallet.getAddressString(),
            seedPhrase: process.env.SEED
        }).then(console.log).catch(e => console.log('exists'))
    }else{
        console.log('!!!!!! NO process.env.SEED  !!!!')
    }

    app.post('/api/tx/list/all', async (req, res) => {
        Mongoose.transaction.find()
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

    //Mongoose.transaction.findOne().sort({date:-1}).then(console.log)


    async function daily(limit,match){
        const aggregateDaily = [
            {
                $group: {
                    _id: {
                        month: {$month: "$date"},
                        day: {$dayOfMonth: "$date"},
                        year: {$year: "$date"},
                        coin: "$coin"
                    },
                    date: {$min: "$date"},
                    values: {$sum: "$value"},
                    coin: {$first: "$coin"}

                },

            },

            {$addFields: {coin: "$coin"}},
            {$sort: {date: 1, _id:1}},
            {
                $project: {
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$date", timezone: "UTC"}},
                    values: {$round: [{$divide: ["$values", 1e18]}, 1]},
                    coin: 1
                }
            },

        ]
        aggregateDaily.push({$match:match})
        return Mongoose.transaction.aggregate(aggregateDaily).limit(limit)
    }



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
