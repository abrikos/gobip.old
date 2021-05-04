import axios from "axios";
import Mongoose from "server/db/Mongoose";
import {Minter, TX_TYPE} from "minter-js-sdk";
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
        return v.bip_value * 1;
    },

    async updateBalances() {
        const wallets = await Mongoose.wallet.find();
        for (const wallet of wallets) {
            wallet.balance = await this.walletBalance(wallet.address);
            await wallet.save()
        }
    },


    async getUnboundTxs(txPage) {
        const res = await this.get(`transactions`, `query=tags.tx.type='08'&page=${txPage}&per_page=30`)
        for (const tx of res.transactions) {
            const exists = await Mongoose.transaction.findOne({hash: tx.hash});
            if (exists) continue;
            const bData = await this.get(`block/${tx.height}`);
            tx.value = tx.data.value;
            tx.coin = tx.data.coin.symbol;
            tx.date = bData.time
            try {
                await Mongoose.transaction.create(tx)
                console.log(tx.hash)
            } catch {
                console.log('Double', tx.hash)
            }
        }
    },

    async newWallet(to) {
        const w = generateWallet();
        const exists = await Mongoose.wallet.findOne({address: w.getAddressString()});
        if (exists) {
            return this.newWallet(to)
        }
        const newWallet = {address: w.getAddressString(), seedPhrase: w.getMnemonic(), to}
        const balance = await this.walletBalance(w.getAddressString())
        if (balance) {
            newWallet.owned = true;
            newWallet.balance = balance;
            Mongoose.wallet.create(newWallet)
                .catch(e => console.log('Wallet create', e.message))
            return this.newWallet(to)
        }
        return Mongoose.wallet.create(newWallet)
    },

    async newPayments(wallet) {
        console.log('NEW PAYMENTS')
        const params = await this.prepareTxParamsForPayments(wallet);
        for (const p of params) {
            Mongoose.payment.create({from: p.from, to: wallet.to, value: p.data.value * this.divider})
                .catch(e => console.log('PAYMENT create', e.message))
        }
    },

    async totalAmount() {
        const res = await Mongoose.wallet.aggregate([{$group: {_id: "", amount: {$sum: {$multiply: [1 / this.divider, "$balance"]}}}}])
        return res[0].amount
    },


    async prepareTxParamsForPayments(wallet) {
        const wallets = await Mongoose.wallet.find({owned: false, balance: {$gt: 0}, address: {$ne: wallet.address}}).sort({balance: 1});
        let sum = 0;
        const params = []
        for (const from of wallets) {
            const reminder = wallet.balance - sum;
            const amount = from.balance < reminder ? from.balance : reminder;
            if (sum < wallet.balance) {
                const txParams = await this.getTxParams(from.address, wallet.to, amount)
                console.log(from.balanceHuman, txParams)
                txParams.from = from;
                params.push(txParams)
                sum += amount;
            }
        }
        return params;
    },

    async getTxParams(address, to, value) {
        const txParams = {
            chainId: 2,
            type: TX_TYPE.SEND,
            data: {
                to,
                value: value / this.divider,
                coin: 0, // coin id
            },
            gasCoin: 0, // coin id
            gasPrice: 1
        };
        const res = await minter.estimateTxCommission(txParams)
        txParams.data.value -= res.commission;
        return txParams
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
                await this.checkTransactionForMixer(tx)
            }
        }
        //const res = await this.get(`transactions`, `query=tags.tx.type='01'&page=1`)
        const v = await this.get(`/status`)
        await Mongoose.status.create(v)
    },

    async checkTransactionForMixer(tx) {
        const wallet = await Mongoose.wallet.findOne({address: tx.data.to});
        if (!wallet) return;
        wallet.txs.push(tx.hash);
        wallet.balance = tx.data.value;
        wallet.save();
        await this.newPayments(wallet)
    },

    async sendPayments() {
        const payments = await Mongoose.payment.find({status: 0}).populate('from');
        for (const payment of payments) {
            this.sendTx(payment)
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
        const {to, value} = payment;
        const {seedPhrase, address} = payment.from
        const txParams = await this.getTxParams(payment.from.address, to, value);
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
                console.log(txParams, txHash)
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
