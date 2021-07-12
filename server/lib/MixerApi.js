import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";


const obj = {
    usePayload: true,


    async createAddressForMixing(to) {
        return new Promise((resolve, reject) => {
            if (!MinterApi.checkAddress(to)) return reject({message: 'Invalid address'})
            MinterApi.newWallet('mixer', to)
                .then(async w => {
                    const {address} = w;
                    const data = {
                        address,
                        min: MinterApi.params.mixerFee * 2 + 1,
                        max: await this.totalAmount()
                    }
                    resolve(data)
                })
        });
    },

    async calculateMix(value) {
        const txParams = await this.mixedPayments({
            address: 'Mxe43ac6c88f573a7703fe7f2c3d8d342818e8fb97',
            to: 'Mx111ac6c88f573a7703fe7f2c3d8d342818e8fb97',
            balance: value
        }, {value})

        const tx = {
            from: 'Mxe43ac6c88f573a7703fe7f2c3d8d342818e8fb97',
            to: 'Mx111ac6c88f573a7703fe7f2c3d8d342818e8fb97',
        };

        const commission = await MinterApi.getTxParamsCommission(tx);
        //console.log('zzzzzzzzzzz', txParams.map(t => t.value).reduce((a, b) => a + b, 0), commission)
        const total = await this.totalAmount();
        const data = {
            balance: txParams.map(t => t.value).reduce((a, b) => a + b, 0) - commission * txParams.length,
            count: txParams.length,
            value: value * 1,
            commission,
            total
        }
        console.log(total , data.value , MinterApi.params.mixerFee , data.commission , data.count)
        return new Promise((resolve, reject) => {
            if (total < data.value - MinterApi.params.mixerFee - data.commission * data.count) reject({message: `Your sum greater than maximum amount ${total} BIP`})
            resolve(data)
        });


    },

    async checkTransaction(tx) {
        //if(tx.value <= MinterApi.params.mixerFee * 1 + 1) return console.log('DONATE', tx.hash, tx.value, MinterApi.params.mixerFee + 1);
        const found = await Mongoose.payment.findOne({tx: tx.hash});
        if (found) return;
        const fromMultiSend = await Mongoose.wallet.findOne({
            type: 'mixer',
            to: {$ne: null},
            address: tx.to
        });
        if (!fromMultiSend) return;
        console.log('TX form Mixer wallet', fromMultiSend.address, 'User', fromMultiSend.user)
        fromMultiSend.balance = await MinterApi.walletBalance(fromMultiSend.address);
        console.log('New balance', fromMultiSend.balance)
        fromMultiSend.save();
        if (fromMultiSend.user) return;
        const singleSends = await this.mixedPayments(fromMultiSend, tx);
        const payment = new Mongoose.payment({
            tx: tx.hash,
            fromMultiSend,
            singleSends,
            multiSends: await this.getProfits()
        })

        for (const m of singleSends) {
            if (m.from.user && m.from.user.address) {
                //return of spent funds from user's wallets
                const dd = {to: m.from.user.address, value: m.value};
                payment.multiSends.push(dd)
            }
        }
        Mongoose.payment.create(payment).catch(e => {
            console.log('ERROR: checkTransactions 1', e.message)
        });
        Mongoose.transaction.create(tx).catch(console.log)

    },

    async totalAmount() {
        const res = await Mongoose.wallet.find({balanceReal: {$gt: 0}, type: 'mixer'});
        //const main = await MinterApi.walletBalance(process.env.MAIN_WALLET);
        return res.reduce((n, {balance}) => n + balance, 0);
    },


    async getProfits() {
        const refunds = []
        const profitWallets = await Mongoose.wallet.find({type: 'mixer', user: {$ne: null}}).populate({path: 'user', populate: 'parent'});
        const walletsTotal = profitWallets.map(p => p.balance).reduce((a, b) => a + b, 0);
        for (const p of profitWallets) {
            const amount = (MinterApi.params.mixerFee - 1) * p.balance / walletsTotal;
            const toUser = amount * (1 - process.env.REFERRAL_PERCENT / 100);
            const toParent = amount - toUser
            const data = {to: p.user.address, value: toUser}
            if (p.user.parent) {
                const dataParent = {to: p.user.parent.address, value: toParent};
                refunds.push(dataParent)
                Mongoose.referral.create({type: 'mixer', amount: toParent, parent: p.user.parent, referral: p.user});
            }
            p.profits.push({value: data.value, date: new Date()});
            p.save();
            refunds.push(data)

        }
        return refunds;
    },

    async getWalletsForPayments(address, value) {
        const wallets = await Mongoose.wallet.find({type: 'mixer', balanceReal: {$gt: 2}, address: {$ne: address}})
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

    async mixedPayments(fromMultiSend, transaction) {
        if (transaction.value < MinterApi.params.mixerFee) return [];
        //const walletsTop = await Mongoose.wallet.find({balance: {$gt: 2}, address: {$ne: wallet.address}}).sort({balance: -1}).limit(process.env.TOP * 1);
        const wallets = await this.getWalletsForPayments(fromMultiSend.address, transaction.value);
        let sum = 0;
        const singleSends = [];
        for (const from of wallets.res) {
            let value = (transaction.value - MinterApi.params.mixerFee) * from.balance / wallets.sum;
            console.log(value)
            if (value > from.balance) value = from.balance;
            console.log(from.balance, from.address)
            //if wallet.to - wallet created for mixing
            if (sum < transaction.value && fromMultiSend.to) {
                //const payment = new Mongoose.payment({from, list: [{to: wallet.to, value}]});
                const mixer = {fromSeed: from.seedPhrase, fromAddress: from.address, to: fromMultiSend.to, value, from};
                const txParams = {
                    data: {to: fromMultiSend.to, value}
                }
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
