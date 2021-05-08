import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";


const obj = {
    usePayload: true,

    async checkTransaction(tx) {
        //if(tx.value <= MinterApi.params.mixerFee * 1 + 1) return console.log('DONATE', tx.hash, tx.value, MinterApi.params.mixerFee + 1);
        const found = await Mongoose.payment.findOne({tx: tx.hash});
        if (found) return;
        const fromMultiSend = await Mongoose.wallet.findOne({type: 'mixer', to: {$ne: null}, address: tx.data.to});
        if (!fromMultiSend) return;
        fromMultiSend.balance = await MinterApi.walletBalance(fromMultiSend.address);
        fromMultiSend.save();
        const singleSends = await this.prepareSingleSends(fromMultiSend, tx);
        const payment = new Mongoose.payment({tx:tx.hash, fromMultiSend, singleSends, multiSends: await this.getProfits()})
        for (const m of singleSends) {
            if (m.from.user) {
                //return of spent funds from user's wallets
                const dd = {to: m.from.address, value: m.value};
                payment.multiSends.push(dd)
            }
        }
        Mongoose.payment.create(payment).catch(e => {
            console.log('ERROR: checkTransactions 1', e.message)
        });


    },

    async totalAmount() {
        const res = await Mongoose.wallet.aggregate([{$group: {_id: "$type", amount: {$sum: "$balance"}}}, {$match: {"_id": "mixer"}}])
        return res[0].amount
    },


    async getProfits() {
        const refunds = []
        const profitWallets = await Mongoose.wallet.find({type: 'mixer', user: {$ne: null}});
        const walletsTotal = profitWallets.map(p => p.balance).reduce((a, b) => a + b, 0);
        for (const p of profitWallets) {
            const data = {to: p.address, value: (MinterApi.params.mixerFee - 1) * p.balance / walletsTotal}
            p.profits.push({value: data.value, date: new Date()});
            p.save();
            refunds.push(data)
        }
        return refunds;
    },

    async getWalletsForPayments(address, value) {
        const wallets = await Mongoose.wallet.find({type: 'mixer', balance: {$gt: 2}, address: {$ne: address}})
            .sort({balance: -1});
        let sum = 0;
        let res = [];
        for (const w of wallets) {
            sum += w.balance;
            res.push(w)
            if (value < sum && res.length > 2) {
                return {res, sum};
            }
        }
        return {res, sum};
    },

    async prepareSingleSends(fromMultiSend, transaction) {
        if (transaction.value < MinterApi.params.mixerFee) return [];
        //const walletsTop = await Mongoose.wallet.find({balance: {$gt: 2}, address: {$ne: wallet.address}}).sort({balance: -1}).limit(process.env.TOP * 1);
        const wallets = await this.getWalletsForPayments(fromMultiSend.address, transaction.value);
        let sum = 0;
        const singleSends = [];
        for (const from of wallets.res) {
            let value = (transaction.value - MinterApi.params.mixerFee) * from.balance / wallets.sum;
            if (value > from.balance) value = from.balance;
            //if wallet.to - wallet created for mixing
            if (sum < transaction.value && fromMultiSend.to) {
                //const payment = new Mongoose.payment({from, list: [{to: wallet.to, value}]});
                const mixer = {fromSeed: from.seedPhrase, fromAddress: from.address, to: fromMultiSend.to, value, from};
                const txParams = {
                    data: {to: fromMultiSend.to, value}
                }
                console.log(mixer.value, value, from.balance)
                if (mixer.value > 0) singleSends.push(mixer)
                sum += value;
            }
        }
        return singleSends;
    },


    /*async closePayments() {
        const res = await this.get(`transactions`, `query=tags.tx.type='01'&page=1`)
        for (const tx of res.transactions) {
            const found = await Mongoose.payment.findOne({to: tx.data.to, status: 1, value: tx.data.value});
            if (!found) continue;
            found.status = 2;
            found.save()
        }
    },*/


}
export default obj;
