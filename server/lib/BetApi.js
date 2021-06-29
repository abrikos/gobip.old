import Mongoose from "../db/Mongoose";
import MinterApi from "./MinterApi";
import moment from "moment";
import axios from "axios";

Mongoose.crypto.updateMany({pair:'BTC-USD'},{$set:{pair:'BTC/USD'}}).then(console.log)
Mongoose.crypto.deleteMany({pair:'BIP-USD'}).then(console.log)


const obj = {
    async checkTransaction(tx) {
        const wallet = await Mongoose.wallet.findOne({type: 'bet', address: tx.to})
            .populate('betF')
            .populate('betA')
        if (!wallet) return;
        wallet.balanceReal = await MinterApi.walletBalance(wallet.address);
        await wallet.save();
        const {hash, value, from} = tx;
        const obj = {hash, value, from};

        if (wallet.betF && !wallet.betF.votesF.map(o => o.hash).includes(obj.hash)) {
            wallet.betF.votesF.push(obj);
            wallet.betF.save()
        }

        //wallet.betF && console.log(wallet.betF.votesA.map(o=>JSON.stringify(o)).indexOf(str), obj, str, wallet.betF.votesF)
        //wallet.betA && console.log(wallet.betA.votesA.map(o=>JSON.stringify(o)).indexOf(str), obj, str, wallet.betA.votesA)
        if (wallet.betA && !wallet.betA.votesA.map(o => o.hash).includes(obj.hash)) {
            wallet.betA.votesA.push(obj);
            wallet.betA.save()
        }
        Mongoose.transaction.create(tx).catch(console.log)
    },

    async checkDates() {
        const bets = await Mongoose.bet.find({closed: null, checkDate: {$lt: moment().format('YYYY-MM-DD')}}) //, checkDate: {$gt: new Date()}
            .populate({path: 'walletF', select: ['address', 'balanceReal', 'seedPhrase']})
            .populate({path: 'walletA', select: ['address', 'balanceReal', 'seedPhrase']})
            .populate({path:'user', populate:'parent'})
        for (const bet of bets) {
            console.log('BET owner refund', bet.userRefund)
            const crypto = await Mongoose.crypto.findOne({pair: bet.pair}).sort({createdAt: -1})
            let winners;
            if(crypto) {
                const isRight = eval(`${crypto.value} ${bet.condition} ${bet.value}`);
                winners = isRight ? bet.votesF : bet.votesA;
            }else{
                winners = bet.votesF.concat( bet.votesA);
            }
            const sum = winners.map(v => v.value).reduce((a, b) => a + b, 0)
            const mainWallet = await Mongoose.wallet.findOne({address: process.env.MAIN_WALLET});
            const payment = new Mongoose.payment({tx: bet.id, fromMultiSend: mainWallet});
            payment.tx = moment().unix();
            for (const win of winners) {
                const value = win.value / sum * bet.prizeForWinners;
                const multiSend = {to: win.from, value};
                if (value >= 0)
                    payment.multiSends.push(multiSend);
            }
            payment.multiSends.push({to: bet.user.address, value: bet.userRefund * 0.9});
            if(bet.user.parent)
                payment.multiSends.push({to: bet.user.parent.address, value: bet.userRefund * 0.1});
            const wallets = [bet.walletF, bet.walletA];

            for (const wallet of wallets) {
                payment.singleSends.push({to: mainWallet.address, value: wallet.balance, fromAddress: wallet.address, fromSeed: wallet.seedPhrase})
            }
            //console.log(payment.multiSends)
            bet.closed = true;
            bet.payment = payment;
            await bet.save();
            await payment.save()
        }
    },


    async cryptoCompare(pair) {
        const ft = pair.match(/(\w+)\/(\w+)/)
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${ft[1]}&tsyms=${ft[2]}&api_key=` + process.env.CRYPTOCOMPARE_API
        const res = await axios.get(url)
        Mongoose.crypto.create({pair, value: res.data[ft[2]]});
    },

    async pairs(){
        const pairs = ['HUB/BIP', 'USDT/BIP', 'ETH/BIP', 'BTC/BIP'];
        for(const pair of pairs){
            const value = await this.getPoolPrice(pair);
            await Mongoose.crypto.create({pair, value});
        }
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
    },

    async getPoolPrice(pair){
        try {
            const pools = await MinterApi.get('/pools/coins/' + pair, true);
            return (pools.data.amount1 / pools.data.amount0).toFixed(2)
        }catch (e) {
            return 0;
        }
    }

}

//Mongoose.bet.updateMany({},{$set:{checkDate:'2021-01-01'}}).then(console.log)
//Mongoose.user.findOne().then(u=>{u.admin=true;u.save()})
//Mongoose.bet.deleteMany({}).then(console.log)
//obj.getPairs().then(console.log)
export default obj;