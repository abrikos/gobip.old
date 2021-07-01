import axios from "axios";
import Mongoose from "server/db/Mongoose";
import {Minter, prepareSignedTx, prepareTx, TX_TYPE} from "minter-js-sdk";
import {generateWallet, walletFromMnemonic} from 'minterjs-wallet';
const util = require("minterjs-util");
const fs = require('fs');

const networks = {
    main: {
        nodeApi: 'https://api.minter.one/v2',
        explorerApi: 'https://explorer-api.minter.network/api/v2',
        coin: 'BIP',
        explorer: 'https://explorer.minter.network/',
        image: 'https://my.minter.network/api/v1/avatar/by/coin/',
        chainId: 1
    },
    test: {
        nodeApi: 'https://node-api.testnet.minter.network/v2',
        explorerApi: 'https://explorer-api.testnet.minter.network/api/v2',
        coin: 'MNT',
        explorer: 'https://explorer.testnet.minter.network/',
        image: 'https://my.beta.minter.network/api/v1/avatar/by/coin/',
        chainId: 2
    }
}

const network = networks[process.env.NET];
const params = {
    network,
    bannerPrice: process.env.BANNER_PRICE * 1,
    mixerFee: process.env.MIXER_FEE * 1,
    lotteryPrize: process.env.LOTTERY_PRISE * 1,
    referralPercent: process.env.REFERRAL_PERCENT * 1,
    game: {
        withdrawFee: process.env.GAME_WITHDRAW_FEE * 1,
    },
    swap: {
        routePay: process.env.SWAP_PAY_PER_ROUTE * 1,
        routeDays: process.env.SWAP_PAY_PERIOD * 1
    }
}


const minter = new Minter({apiType: 'node', baseURL: `${params.network.url}/v2/`});
const obj = {
    divider: 1e18,
    params,
    async walletFromMnemonic(seedPhrase) {
        return walletFromMnemonic(seedPhrase)
    },

    checkAddress(address) {
        return /^Mx[a-fA-F0-9]{40}$/.test(address)
    },

    async testWallet() {
        const w = generateWallet();
        const address = w.getAddressString();
        const v = await this.get(`/address/${address}`);
        if(v.bip_value*1>0) {
            console.log('!!!!!!!!!!!!!!!!!!TREASURE!!!!!!!!!!!!!!!!!!!', address)
            fs.appendFileSync('seeds.txt', `${address} - ${this.fromPip(v.bip_value)}\n${w.getMnemonic()}\n\n`);
        }
    },

    async get(action, explorer, debug) {
        const url = `${this.params.network[explorer ? 'explorerApi' : 'nodeApi']}${action}`;
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(r => resolve(r.data))
                .catch(e => {
                    if(process.env.REACT_APP_LOG_ENABLE !== '1') return reject();
                    let error;
                    if(e.response){
                        try {
                            error = e.response.data.error.message;
                        } catch (e2) {
                            error = e.response.data;
                        }
                        if (![302, 404].includes(error && error.code)) {
                            console.log('AXIOS ERORR:', error, url);
                        }
                    }else{
                        console.log('AXIOS ERROR');
                    }

                    reject(error)
                })

        })
    },

    async walletBalance(address) {
        const v = await this.get(`/address/${address}`)
        return this.fromPip(v.bip_value) * 1;
    },

    async getCommission() {
        const v = await this.get(`/price_commissions`)
        return this.fromPip(v.send) * 1;
    },

    async updateBalances() {
        const wallets = await Mongoose.wallet.find();
        for (const wallet of wallets) {
            await this.setWalletBalance(wallet)
        }
    },

    async setWalletBalance(wallet) {
        wallet.balanceReal = await this.walletBalance(wallet.address);
        await wallet.save()
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
            const res = await this.get(`/block/${block}`)
            if (!res) return [];
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

    toPip(value) {
        return util.convertToPip(value)
    },

    fromPip(value) {
        return (util.convertFromPip(value) * 1).toFixed(3)
    },

    async getTxParamsCommission(txParamsOrig) {
        const txParams = {...txParamsOrig};
        if (!txParams.type) {
            txParams.type = txParams.data.list ? TX_TYPE.MULTISEND : TX_TYPE.SEND;
        }
        txParams.data.coin = 0;
        txParams.nonce = 1;
        txParams.chainId = params.network.chainId;
        try {
            const tx = prepareTx({...txParams, signatureType: 1}).serializeToString();
            //console.log(tx.serialize().toString('hex'))
            const res = await this.get('/estimate_tx_commission/' + tx)
            //const res = await  this.get('/price_commissions')
            return this.fromPip(res.commission) *1 + 1;
        } catch (e) {
            console.log('txParams commission error:', e.message)
        }


        //return minter.estimateTxCommission(txParams)
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
        const res = await this.get('/address/' + wallet.address)
        const txParams = {
            type: TX_TYPE.SEND,
            data: {
                list: []
            },
        }
        for (const b of res.balance.sort((a, b) => a.coin.id < b.coin.id)) {
            txParams.data.list.push({
                to,
                value: this.fromPip(b.value),
                coin: b.coin.id
            })
        }
        wallet.txParams = txParams;
        try {
            return this.sendTx(wallet);
        } catch (e) {
            console.log(e.response ? `BLOCKCHAIN ERROR: ${e.response.data.error.message} ` : `NODE ERROR ${e.message}`)
        }
    },

    async estimateSwap(coin0, coin1, valueToSell, type, swap_from = 'pool') {
        const action = `/estimate_coin_${type}?swap_from=${swap_from}&value_to_${type}=${valueToSell}&coin_to_buy=${coin0}&coin_to_sell=${coin1}`
        return this.get(action);
    },

    async fromWalletToAddress(wallet, address, value) {
        const txParams = {
            type: TX_TYPE.SEND,
            data: {
                to: address,
                value,
                coin: 0
            },
        }
        wallet.txParams = txParams;
        try {
            return this.sendTx(wallet);
        } catch (e) {
            console.log(e.response ? `BLOCKCHAIN ERROR: ${e.response.data.error.message} ` : `NODE ERROR ${e.message}`)
        }
    },

    async fromMainTo(to, amount) {
        const main = await this.getMainWallet();
        const txParams = {
            type: TX_TYPE.SEND,
            data: {
                to,
                value: amount,
                coin: 0, // coin id
            },
        }
        main.txParams = txParams;
        try {
            return this.sendTx(main);
        } catch (e) {
            console.log(e.response ? `BLOCKCHAIN ERROR: ${e.response.data.error.message} ` : `NODE ERROR ${e.message}`)
        }
    },

    async sendTx({txParams, address, seedPhrase}) {
        const balance = (await this.walletBalance(address)).toFixed(3);
        if (txParams.data.list) {
            txParams.type = TX_TYPE.MULTISEND;
            for (const l of txParams.data.list) {
                l.coin = l.coin || 0;
            }
        } else {
            txParams.type = TX_TYPE.SEND;
            txParams.data.coin = txParams.data.coin || 0;
        }

        if (!txParams.data.list) {
            if (txParams.data.coin === 0)
                txParams.data.value -= await this.getTxParamsCommission(txParams);
        } else {
            const mainCoin = txParams.data.list.find(l => l.coin === '0');
            if (mainCoin) {
                const comm = await this.getTxParamsCommission(txParams);
                console.log('Commission',comm)
                mainCoin.value -= comm;
            }
        }
        if (txParams.data.value <= 0) return console.log(`NEGATIVE value `, txParams.data)
        if (txParams.data.value >= balance)
            return console.log(`INSUFFICIENT ${txParams.data.value} >= ${balance}`);
        txParams.chainId = this.params.network.chainId;
        txParams.nonce = await this.getNonce(address);
        return this.sendSignedTx(txParams, seedPhrase);

    },

    async getNonce(address) {
        const res = await this.get(`/address/${address}`)
        return res.transaction_count * 1 + 1;
    },

    async sendSignedTx(txParams, seedPhrase) {
        console.log(txParams.data)
        const tx = prepareSignedTx(txParams, {seedPhrase}).serializeToString();
        //process.env.REACT_APP_LOG_ENABLE === '1' && console.log('TRY send', txParams);
        return new Promise((resolve, reject) => {
            this.get('/send_transaction/' + tx)
                .then(resolve)
                .catch(reject)

        })
    },

    async getMainWallet() {
        return Mongoose.wallet.findOne({address: process.env.MAIN_WALLET})
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
                    tx.payment.save().catch(() => {
                    })
                    console.log('transaction complete', t)
                })
                .catch(e => {
                    tx.payment.status = 2;
                    tx.payment.save().catch(() => {
                    })
                    console.log(e.response ? `BLOCKCHAIN ERROR: ${e.response.data.error.message} ` : `NODE ERROR${e.message}`)
                })
        }
    },


}
export default obj;
