import Mongoose from "server/db/Mongoose";

const UnboundApi = {
    async checkTransaction(tx) {
        if (tx.type * 1 !== 8) return
        const data = tx;
        data.value = tx.data.value * 1e-18;
        data.coin = tx.data.coin.symbol;
        Mongoose.unbound.create(tx)
            .catch(e => console.log('Unbound exists'))
    },

    async daily(limit, match) {
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
            //{$sort: {date: 1, _id: 1}},
            {
                $project: {
                    date: {$dateToString: {format: "%Y-%m-%d", date: "$date", timezone: "UTC"}},
                    values: {$round: ["$values", 1]},
                    coin: 1
                }
            },

        ]
        aggregateDaily.push({$match: match})
        const arr = await Mongoose.unbound.aggregate(aggregateDaily).sort({date: -1}).limit(limit)
        //return arr;
        return arr.sort((a, b) => a.date > b.date)
    }
}

//Mongoose.transaction.findOne().then(console.log)
//UnboundApi.daily(30, {coin: 'BIP'})    .then(console.log)
export default UnboundApi;
