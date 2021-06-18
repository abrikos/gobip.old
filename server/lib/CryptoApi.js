import axios from "axios";
import Mongoose from "../db/Mongoose";


const obj = {

    async cryptoCompare(pair) {
        const ft = pair.match(/(\w+)-(\w+)/)
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${ft[1]}&tsyms=${ft[2]}&api_key=` + process.env.CRYPTOCOMPARE_API
        const data = await this.get(url);
        Mongoose.crypto.create({pair, value: data[ft[2]]});
    },

    async minterBipUsd() {
        const url = `https://explorer-api.minter.network/api/v2/status`
        const data = await this.get(url);
        Mongoose.crypto.create({pair: 'BIP-USD', value: (data.data.bip_price_usd*1).toFixed(3)});
    },

    async get(url) {
        const res = await axios.get(url)
        return res.data;
    },

    async getPairs() {
        const pairs = await Mongoose.crypto.aggregate([{$group: {_id: {pair: "$pair"}}}]).sort({_id: 1})
        return pairs.filter(p=>p._id.pair).map(p => p._id.pair)
    },

    async aggregatePairData(pair) {
        const aggregateDaily = [
            {
                $group: {
                    _id: {
                        month: {$month: "$createdAt"},
                        day: {$dayOfMonth: "$createdAt"},
                        year: {$year: "$createdAt"},
                        //hour: {$hour: "$createdAt"},
                        //minute: {$minute: "$createdAt"},
                        //second: {$second: "$createdAt"},
                        pair: "$pair",
                    },
                    date: {$last: "$createdAt"},
                    value: {$last: "$value"},
                    pair: {$last: "$pair"},
                },

            },
            {$addFields: {pair: "$pair"}},
            {$sort: {date: 1, _id: 1}},
            {
                $project: {
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$date"}},
                    value: 1,
                    pair: 1,
                }
            },
            {$match: {pair}}
        ];
        const arr = await Mongoose.crypto.aggregate(aggregateDaily).sort({date:-1}).limit(30);
        return arr.sort((a,b)=>a.date>b.date)
    }

}
//obj.aggregatePairData('BTC-USD').then(console.log)
//Mongoose.crypto.updateMany({pair: null}, {$set: {pair2: {$concat: ["$from", "-", "$to"]}}}).then(console.log)
//Mongoose.crypto.find({from:{$ne:null}}).limit(2).then(console.log)
export default obj