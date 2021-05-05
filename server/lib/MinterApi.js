import axios from "axios";
import Mongoose from "server/db/Mongoose";
import {Minter} from "minter-js-sdk";
import {generateWallet, walletFromMnemonic} from 'minterjs-wallet';

const networks = ['', {url: 'https://api.minter.one', coin: 'BIP', explorer: 'https://explorer.minter.network/'}, {url: 'https://node-api.testnet.minter.network', coin: 'MNT', explorer: 'https://explorer.testnet.minter.network/'}]
const network = networks[process.env.CHAIN_ID];
const minter = new Minter({apiType: 'node', baseURL: `${network.url}/v2/`});


const obj = {
    divider: 1e18,
    network,
    async walletFromMnemonic(seedPhrase) {
        return walletFromMnemonic(seedPhrase)
    },

    checkAddress(address) {
        return address.match(/^Mx[a-fA-F0-9]{40}$/)
    },

    async get(action, query) {
        const url = `${network.url}/v2/${action}?${query}`;
        const res = await axios.get(url)
        return res.data;
    },

    async walletBalance(address) {
        const v = await this.get(`/address/${address}`)
        return v.bip_value / this.divider;
    },

    async getCommission() {
        const v = await this.get(`/price_commissions`)
        return v.send / this.divider;
    },

    async updateBalances() {
        const wallets = await Mongoose.wallet.find();
        for (const wallet of wallets) {
            wallet.balance = await this.walletBalance(wallet.address);
            await wallet.save()
        }
    },

    async getUnboundTxs(tx) {
        if (tx.type === 8)
            await Mongoose.transaction.createNew(tx);
    },

    async totalAmount() {
        const res = await Mongoose.wallet.aggregate([{$group: {_id: "", amount: {$sum: "$balance"}}}])
        return res[0].amount
    },

    async getBlockTxs() {

        let current = await Mongoose.status.findOne().sort({createdAt: -1})
        const last = await this.get(`/status`)
        if (!last) {
            current = await Mongoose.status.create(last)
        }
        for (let block = current.latest_block_height * 1; block <= last.latest_block_height * 1; block++) {
            const res = await this.get(`block/${block}`)
            for (const tx of res.transactions) {
                const found = await Mongoose.transaction.findOne({hash: tx.hash})
                if (found) continue;
                tx.date = res.time;
                await this.checkTransactionForMixer(tx);
                await this.getUnboundTxs(tx);

            }
        }
        //const res = await this.get(`transactions`, `query=tags.tx.type='01'&page=1`)
        const v = await this.get(`/status`)
        await Mongoose.status.create(v)
    },

    async newWallet(to, user) {
        const w = generateWallet();
        const exists = await Mongoose.wallet.findOne({address: w.getAddressString()});
        if (exists) {
            return this.newWallet(to)
        }
        const newWallet = {address: w.getAddressString(), seedPhrase: w.getMnemonic(), to, user}
        const balance = await this.walletBalance(w.getAddressString())
        if (balance) {
            newWallet.balance = balance;
            Mongoose.treasure.create(newWallet)
                .catch(e => console.log('TREASURE found', e.message))
            return this.newWallet(to)
        }
        return Mongoose.wallet.create(newWallet)
    },

    async checkTransactionForMixer(tx) {
        const wallet = await Mongoose.wallet.findOne({to: {$ne: null}, address: tx.data.to});
        if (!wallet) return;
        const transaction = await Mongoose.transaction.createNew(tx);
        wallet.balance = await this.walletBalance(wallet.address);
        console.log('TX for wallet', tx.hash, wallet.address, wallet.balance);
        wallet.save();
        const params = await this.prepareTxParamsForPayments(wallet, transaction);
        const refunds = await this.shareProfit();
        for (const p of params) {
            const np = await Mongoose.payment.create(p)
            if (p.from.user) {
                //return of spent funds from user's wallets
                refunds.push({to: p.from.address, value: p.list[0].value})
                console.log('DEBT REPAYMENT', {to: p.from.address, value: p.list[0].value})
            }
            //console.log('PAYMENT Created', np.list)
        }
        await Mongoose.payment.create({from: wallet, list: refunds});
    },

    async shareProfit() {
        const refunds = []
        const profits = await Mongoose.wallet.find({user: {$ne: null}});
        const walletsTotal = profits.map(p => p.balance).reduce((a, b) => a + b, 0);
        for (const p of profits) {
            const data = {to: p.address, value: (process.env.PROFIT - 1) * p.balance / walletsTotal}
            p.profits.push({value:data.value, date: new Date()});
            p.save();
            refunds.push(data)
        }
        console.log('share PROFIT', refunds)
        return refunds;
    },

    async getWalletsForPayments(address, value) {
        const wallets = await Mongoose.wallet.find({balance: {$gt: 2}, address: {$ne: address}})
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

    async prepareTxParamsForPayments(wallet, transaction) {
        //const walletsTop = await Mongoose.wallet.find({balance: {$gt: 2}, address: {$ne: wallet.address}}).sort({balance: -1}).limit(process.env.TOP * 1);
        const wallets = await this.getWalletsForPayments(wallet.address, transaction.value);
        let sum = 0;
        const params = [];
        for (const from of wallets.res) {
            let value = (transaction.value - process.env.PROFIT) * from.balance / wallets.sum;
            if (value > from.balance) value = from.balance;
            //if wallet.to - wallet created for mixing
            if (sum < transaction.value && wallet.to) {
                const payment = new Mongoose.payment({from, list: [{to: wallet.to, value}]});
                const res = await minter.estimateTxCommission(payment.txParams)
                payment.list[0].value -= res.commission;
                console.log(payment.list[0].value, from.balance, from.address)
                params.push(payment)
                sum += value;
            }
        }
        return params;
    },

    async sendPayments() {
        const txParams = await Mongoose.payment.find({status: 0}).populate('from');
        for (const txParam of txParams) {
            await this.sendTx(txParam)
        }
    },

    async closePayments() {
        const res = await this.get(`transactions`, `query=tags.tx.type='01'&page=1`)
        for (const tx of res.transactions) {
            const found = await Mongoose.payment.findOne({to: tx.data.to, status: 1, value: tx.data.value});
            if (!found) continue;
            found.status = 2;
            found.save()
        }
    },

    async sendTx(payment) {
        const {seedPhrase, address} = payment.from
        const txParams = payment.txParams;
        txParams.nonce = await minter.getNonce(address);
        minter.postTx(txParams, {seedPhrase})
            .then((txHash) => {
                // WARNING
                // If you use minter-node api, successful response would mean that tx just got in mempool but is not on the blockchain yet
                // You have to wait for it to be included in the upcoming block
                // You can use gate api instead, which returns successful response only after tx has appeared on the blockchain
                // WARNING #2
                // If tx has been included in the block, it may still have failed status
                // Verify that tx.code is `0` to ensure its success
                console.log(`=================Tx created: ======================`);
                console.log(txHash)
                payment.status = 1;
                payment.save()
            })
            .catch((error) => {
                console.log( txParams)
                //console.log( payment)
                payment.status = 3;
                payment.save()
                console.log('POST TX ERROR', error.message);
            });
    },


}
export default obj;
