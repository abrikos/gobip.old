import axios from "axios";
import Mongoose from "../db/Mongoose";


const obj = {
    async cryptoCompare(from, to) {
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${from.toUpperCase()}&tsyms=${to.toUpperCase()}&api_key=` + process.env.CRYPTOCOMPARE_API
        const data = await this.get(url);
        Mongoose.crypto.create({from, to, value: data[to]});
    },

    async minterBipUsd() {
        const url = `https://explorer-api.minter.network/api/v2/status`
        const data = await this.get(url);
        Mongoose.crypto.create({from: 'BIP', to: 'USD', value: data.data.bip_price_usd});
    },

    async get(url) {
        const res = await axios.get(url)
        return res.data;
    },


}

export default obj