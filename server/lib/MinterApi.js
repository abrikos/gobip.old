import axios from "axios";
import Mongoose from "server/db/Mongoose";
import {Minter, TX_TYPE} from "minter-js-sdk";
import {generateWallet, walletFromMnemonic} from 'minterjs-wallet';
import params from "src/params";

const minter = new Minter({apiType: 'node', baseURL: `${params.network.url}/v2/`});
const obj = {
    divider: 1e18,
    params,
    async walletFromMnemonic(seedPhrase) {
        return walletFromMnemonic(seedPhrase)
    },

    checkAddress(address) {
        return address.match(/^Mx[a-fA-F0-9]{40}$/)
    },

    async get(action, query) {
        const url = `${this.params.network.url}/v2/${action}?${query}`;
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

    async checkWithdrawals(tx) {
        const wallet = await Mongoose.wallet.findOne({address: tx.from});
        if (!wallet) return;
        wallet.balance = await this.walletBalance(wallet.address);
        wallet.save()
    },


    async getTransactions() {
        let current = await Mongoose.status.findOne().sort({createdAt: -1})
        const last = await this.get(`/status`);
        if (!last) return;
        await Mongoose.status.create(last);
        if (!current) {
            current = last;
        }
        const txs = [];
        for (let block = current.latest_block_height * 1; block <= last.latest_block_height * 1; block++) {
            const res = await this.get(`block/${block}`)
            for (const tx of res.transactions) {
                tx.date = res.time;
                if (!tx.data.list) {
                    tx.to = tx.data.to;
                    tx.value = tx.data.value * 1e-18;
                    tx.coin = tx.data.coin ? tx.data.coin.symbol : '';
                    txs.push(tx)
                } else {
                    const list = [];
                    for (const l of tx.data.list) {
                        const found = list.find(x => x.to === l.to);
                        if (found) {
                            found.value += l.value;
                        } else {
                            list.push(l)
                        }
                    }
                    for (const v of list) {
                        tx.to = v.to;
                        tx.value = v.value * 1e-18;
                        tx.coin = v.coin.symbol;
                        txs.push(tx)
                    }
                }
            }
        }
        return txs;
    },


    async getTxParamsCommission(txParams) {
        txParams.type = txParams.data.list ? TX_TYPE.MULTISEND : TX_TYPE.SEND;
        txParams.data.coin = 0;
        txParams.chainId = params.network.chainId;
        return minter.estimateTxCommission(txParams)
    },

    async newWallet(type, to, user) {
        const w = generateWallet();
        const exists = await Mongoose.wallet.findOne({address: w.getAddressString()});
        if (exists) {
            return this.newWallet(type, to, user)
        }
        const newWallet = {address: w.getAddressString(), seedPhrase: w.getMnemonic(), to, user, type}
        const balance = await this.walletBalance(w.getAddressString())
        if (balance) {
            newWallet.balance = balance;
            Mongoose.treasure.create(newWallet)
                .catch(e => console.log('TREASURE found', e.message))
            return this.newWallet(type, to, user)
        }
        return Mongoose.wallet.create(newWallet)
    },

    async walletMoveFunds(wallet, to) {
        const txParams = {
            type: TX_TYPE.SEND,
            data: {
                to,
                value: wallet.balance,
                coin: 0, // coin id
            },
        }
        wallet.txParams = txParams;
        return this.sendTx(wallet);
    },

    async sendTx({txParams, address, seedPhrase}) {
        const balance = await this.walletBalance(address);
        if (txParams.data.list) {
            txParams.type = TX_TYPE.MULTISEND;
            for (const l of txParams.data.list) {
                l.coin = 0;
            }
        } else {
            txParams.type = TX_TYPE.SEND;
            txParams.data.coin = 0;
        }
        const res = await this.getTxParamsCommission(txParams)
        if (!txParams.data.list) {
            if (balance <= txParams.data.value)
                txParams.data.value -= res.commission;
        }

        txParams.chainId = this.params.network.chainId;
        txParams.nonce = await minter.getNonce(address);
        return new Promise((resolve, reject) => {
            if (txParams.data.value && txParams.data.value >= balance)
                return reject({response: {data: `INSUFFICIENT ${txParams.data.value} >= ${balance}`}})
            console.log('TRY send', txParams.data)
            minter.postTx(txParams, {seedPhrase})
                .then(resolve)
                .catch(reject)
        });


    },

    async createMainWallet() {
        const d = {address: process.env.MAIN_WALLET}
        const w = await Mongoose.wallet.findOne(d);
        if (!w) {
            d.seedPhrase = process.env.MAIN_SEED;
            d.type = 'mixer';
            Mongoose.wallet.create(d)
        }
    },

    async sendPayments() {
        const payments = await Mongoose.payment.find({status: 0}).populate('fromMultiSend');
        if (!payments.length) return;
        const txs = []
        for (const payment of payments) {
            // create txParams from wallet to address who request mix
            for (const m of payment.singleSends) {
                const txParams = {
                    data: {to: m.to, value: m.value, saveResult: m.saveResult},
                }
                txs.push({txParams, address: m.fromAddress, seedPhrase: m.fromSeed, payment})
            }
            if (payment.fromMultiSend) {
                const txParams = {data: {list: []}}
                //txParams.payload =  'Mixer refunds';
                //Prepare multisend profits (proportional bonus for investors)
                for (const m of payment.multiSends) {
                    txParams.data.list.push(m)
                }
                txs.push({txParams, address: payment.fromMultiSend.address, seedPhrase: payment.fromMultiSend.seedPhrase, payment})
            }
        }

        for (const tx of txs) {
            this.sendTx(tx)
                .then(t => {
                    if (tx.txParams.data.saveResult || tx.txParams.data.list) {
                        tx.payment.results.push({data: tx.txParams.data, hash: t.hash})
                    }
                    tx.payment.status = 1;
                    tx.payment.save().catch(()=>{})
                    console.log('transaction complete', t)
                })
                .catch(e => {
                    tx.payment.status = 2;
                    tx.payment.save().catch(()=>{})
                    console.log(e.response ? `BLOCKCHAIN ERROR: ${e.response.data.error.message} `: `NODE ERROR${e.message}`)
                })
        }
    },


}
export default obj;
