import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";

const obj = {
    async getPools() {
        const res = await MinterApi.get('/pools', true);
        let pools = res.data;
        const next = res.links.next.match(/page=(\d)/)[1] * 1
        const last = res.links.last.match(/page=(\d)/)[1] * 1
        for (let i = next; i <= last; i++) {
            const r = await MinterApi.get('/pools?page=' + i, true);
            pools = pools.concat(r.data)
        }
        return pools
    },

    async poolsCoins() {

    },

    async coins() {
        const pools = await this.getPools();
        const coins = [];
        for (const p of pools) {
            coins.push([p.coin0.symbol, p.coin0.id]);
            coins.push([p.coin1.symbol, p.coin1.id]);
        }
        for (const c of coins) {
            Mongoose.coin.findOneAndUpdate({id: c[1]}, {symbol: c[0]}, {new: true, upsert: true})
            //.then(console.log)
        }
    },

    async checkTransaction(tx) {


    },

    uniqueArray(arr) {
        let set = new Set(arr.map(JSON.stringify));
        return Array.from(set).map(JSON.parse);
    }

}
export default obj;
