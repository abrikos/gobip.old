import axios from "axios";
import Mongoose from "server/db/Mongoose";
import {Minter, TX_TYPE} from "minter-js-sdk";
import {generateWallet} from 'minterjs-wallet';

const urlMain = 'https://api.minter.one';
const urlTest = 'https://node-api.testnet.minter.network';
const URL = urlMain;
const minter = new Minter({apiType: 'node', baseURL: `${URL}/v2/`});

export default {
    async get(action,query){
        const url = `${URL}/v2/${action}?${query}`;
        const res = await axios.get(url)
        return res.data;
    },

    async getUnboundTxs(txPage) {

        const res = await this.get(`transactions`, `query=tags.tx.type='08'&page=${txPage}&per_page=30`)
        for (const tx of res.transactions) {
            const exists = await Mongoose.transaction.findOne({hash:tx.hash});
            if(exists) continue;
            const bData = await this.get(`block/${tx.height}`);
            tx.value = tx.data.value;
            tx.coin = tx.data.coin.symbol;
            tx.date = bData.time
            try {
                await Mongoose.transaction.create(tx)
                console.log(tx.hash)
            }catch {
                console.log('Double', tx.hash)
            }

        }
    },

    async newMixerWallet(target){
        const wallet = generateWallet();
        const mixer = {
            address: wallet.getAddressString(),
            mnemonic: wallet.getMnemonic(),
            target,
        }
        const check = await this.get(`/address/${mixer.address}`)
        if(check.balance.length){
            mixer.empty = false;
            await Mongoose.mixer.create(mixer)
            return this.newMixerWallet(target)
        }
        await Mongoose.mixer.create(mixer)
        console.log(check)
    },

    async getMixerTxs(){
        const res = await this.get(`transactions`, `query=tags.tx.type='01'&page=1`)
        for (const tx of res.transactions) {
            const wallet = await Mongoose.mixer.findOne({address:tx.data.to});
            if(!wallet) continue;
            const top2wallets = await this.getMixerTopWallets();
            const bData = await this.get(`block/${tx.height}`);


        }
    },

    async getMixerTopWallets(){
        return Mongoose.mixer.find({empty:true}).sort({value:-1}).limit(2)
    }

}
