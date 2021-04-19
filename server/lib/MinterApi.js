import axios from "axios";
import Mongoose from "server/db/Mongoose";

export default {
    async get(action,query){
        const url = `https://api.minter.one/v2/${action}?${query}`;
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
    }
}
