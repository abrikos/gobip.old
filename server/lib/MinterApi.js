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
        let current = await Mongoose.status.findOne().sort({latest_block_height: -1})
        const last = await this.get(`/status`)
        if (!last) {
            current = await Mongoose.status.create(last)
        }
        for (let block = current.latest_block_height; block <= last.latest_block_height * 1; block++) {
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
        const wallet = await Mongoose.wallet.findOne({to: {$ne: null},address: tx.data.to});
        if (!wallet) return;
        const transaction = await Mongoose.transaction.createNew(tx);
        wallet.balance = await this.walletBalance(wallet.address);
        console.log('TX for wallet', tx.hash, wallet.address, wallet.balance);
        wallet.save();
        const params = await this.prepareTxParamsForPayments(wallet, transaction);
        for (const p of params) {
            const np = await Mongoose.payment.create(p)
            console.log('PAYMENT Created', np.value)
        }
    },

    async prepareTxParamsForPayments(wallet, transaction) {

        const wallets = await Mongoose.wallet.find({ balance: {$gt: 5}, address: {$ne: wallet.address}}).sort({balance: 1});
        let sum = 0;
        const params = []
        for (const from of wallets) {
            const reminder = transaction.value - sum;
            const value = from.balance < reminder ? from.balance : reminder;
            console.log('tx:',transaction.value, 'from:', from.balance, 'sum:', sum, 'reminder:', reminder, 'value:', value)
            if (sum < transaction.value) {
                const payment = new Mongoose.payment({from, to: wallet.to, value});
                const res = await minter.estimateTxCommission(payment.txParams)
                payment.value -= res.commission;
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
                //console.log( txParams)
                //console.log( payment)
                payment.status = 3;
                payment.save()
                console.log('POST TX ERROR', error.message);
            });
    },


}
export default obj;
