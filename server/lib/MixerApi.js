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
        await this.prepareMixers(fromMultiSend, tx);


    },

    async totalAmount() {
        const res = await Mongoose.wallet.aggregate([{$group: {_id: "", amount: {$sum: "$balance"}}}])
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

    async prepareMixers(fromMultiSend, transaction) {
        if(transaction.value < MinterApi.params.mixerFee) return [];
        //const walletsTop = await Mongoose.wallet.find({balance: {$gt: 2}, address: {$ne: wallet.address}}).sort({balance: -1}).limit(process.env.TOP * 1);
        const wallets = await this.getWalletsForPayments(fromMultiSend.address, transaction.value);
        let sum = 0;
        const mixers = [];
        for (const from of wallets.res) {
            let value = (transaction.value - MinterApi.params.mixerFee) * from.balance / wallets.sum;
            if (value > from.balance) value = from.balance;
            //if wallet.to - wallet created for mixing
            if (sum < transaction.value && fromMultiSend.to) {
                //const payment = new Mongoose.payment({from, list: [{to: wallet.to, value}]});
                const mixer = {fromSeed: from.seedPhrase, fromAddress: from.address, to: fromMultiSend.to, value, from};
                if (this.usePayload) mixer.payload = 'Mix part';
                const txParams = {
                    data: {to: fromMultiSend.to, value}
                }
                const res = await MinterApi.getTxParamsCommission(txParams)
                //if (mixer.value > res.commission)
                mixer.value -= res.commission;
                console.log(mixer.value, value, from.balance)
                if (mixer.value > 0) mixers.push(mixer)
                sum += value;
            }
        }
        const payment = {
            tx: transaction.hash,
            fromMultiSend,
            mixers,
            refunds: [],
            profits: await this.getProfits()
        }
        for (const m of mixers) {
            if (m.from.user) {
                //return of spent funds from user's wallets
                const dd = {to: m.from.address, value: m.value};
                payment.refunds.push(dd)
                console.log('REFUND', dd)
            }
        }
        const found = await Mongoose.payment.findOne({tx:transaction.hash});
        if(!found) {
            Mongoose.payment.create(payment).catch(e => {
                console.log('ERROR: checkTransactions 1', e.message)
            });
        }
        return mixers;
    },

    async sendPayments() {
        const payments = await Mongoose.payment.find({status: 0}).populate('fromMultiSend');
        for (const payment of payments) {
            for (const m of payment.mixers) {
                console.log('send MIXER', m.value)
                payment.status = 1;
                await payment.save()
            }
            //await MinterApi.sendTx(txParam)
        }
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
