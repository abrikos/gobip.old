import axios from "axios";
import Mongoose from "server/db/Mongoose";
import {Minter, TX_TYPE} from "minter-js-sdk";
import {generateWallet, walletFromMnemonic} from 'minterjs-wallet';

const urlMain = 'https://api.minter.one';
const urlTest = 'https://node-api.testnet.minter.network';
//const URL = urlMain;
const URL = urlTest;
const minter = new Minter({apiType: 'node', baseURL: `${URL}/v2/`});

const obj = {
    divider: 1e-18,
    async walletFromMnemonic(seedPhrase) {
        return walletFromMnemonic(seedPhrase)
    },
    async get(action, query) {
        const url = `${URL}/v2/${action}?${query}`;
        const res = await axios.get(url)
        return res.data;
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

    async newMixerWallet(target) {
        const wallet = generateWallet();
        const exists = await Mongoose.mixer.findOne({address: wallet.getAddress()});
        if (exists) {
            return this.newMixerWallet(target)
        }
        const mixer = {
            address: wallet.getAddressString(),
            seedPhrase: wallet.getMnemonic(),
            target,
        }
        const check = await this.get(`/address/${mixer.address}`)
        if (check.balance.length) {
            mixer.owned = true;
            await Mongoose.mixer.create(mixer)
            return this.newMixerWallet(target)
        }
        return Mongoose.mixer.create(mixer)
    },

    async getMixerTxs() {
        const res = await this.get(`transactions`, `query=tags.tx.type='01'&page=1`)
        for (const tx of res.transactions) {
            const wallet = await Mongoose.mixer.findOne({address: tx.data.to});
            if (!wallet) continue;
            wallet.txIn = tx.hash;
            wallet.value = tx.data.value;
            wallet.save();
            this.sendFromRefilledToMixed(wallet)

        }
    },

    async sendFromRefilledToMixed({address, to, value}) {
        //Все не личные кошели с ненулевым балансом, не находящиеся в стадии отправки кроме пополненного (address)
        const wallets = await Mongoose.mixer.find({owned: false, value: {$gt: 0}, sending: false, address: {$ne: address}}).sort({value: -1});
        let sum = 0;
        for (const w of wallets) {
            if (sum < value) {
                const reminder = value - sum;
                const amount = w.value < reminder ? w.value : reminder;
                this.sendTx(w.seedPhrase, to, amount);
                w.sending = true;
                w.save()
                sum += amount;
            }
        }
    },

    async sendTx(seedPhrase, to, value) {
        const txParams = {
            nonce: 1,
            chainId: 1,
            type: TX_TYPE.SEND,
            data: {
                to,
                value,
                coin: 0, // coin id
            },
            gasCoin: 0, // coin id
            gasPrice: 1
        };

        minter.postTx(txParams, {seedPhrase})
            .then((txHash) => {
                // WARNING
                // If you use minter-node api, successful response would mean that tx just got in mempool but is not on the blockchain yet
                // You have to wait for it to be included in the upcoming block
                // You can use gate api instead, which returns successful response only after tx has appeared on the blockchain
                // WARNING #2
                // If tx has been included in the block, it may still have failed status
                // Verify that tx.code is `0` to ensure its success
                alert(`Tx created: ${txHash}`);
            }).catch((error) => {
            const errorMessage = error.response.data.error.message
            alert(errorMessage);
        });
    },


}
export default obj;
