import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";
import {TX_TYPE} from "minter-js-sdk";

const obj = {
    async getPools() {
        const res = await MinterApi.get('/pools', true);
        let pools = res.data;
        const next = res.links.next ? res.links.next.match(/page=(\d)/)[1] * 1 : 1
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
        if (tx.type !== '1') return;
        const routes = await Mongoose.swapbotroute.find({payDate: null}).populate('wallet');
        for (const route of routes.filter(r => r.wallet.address === tx.to)) {
            const balance = await MinterApi.walletBalance(tx.to);
            route.wallet.balance = balance;
            route.wallet.save()
            if (balance >= process.env.SWAP_PAY_PER_ROUTE * 1) {
                MinterApi.walletMoveFunds(route.wallet, process.env.MAIN_WALLET)
                route.payDate = new Date();
                route.save()
            }
        }
    },

    doingRoutes: false,
    async doRoutes() {
        if (this.doingRoutes) return;
        this.doingRoutes = true;
        const routes = await Mongoose.swapbotroute.find({payDate: {$ne: null}}).populate('wallet').populate({path: 'bot', populate: 'wallet'});
        for (const route of routes) {
            try {
                await this.sendSwapRoute(route)
            } catch (e) {
                route.lastError = e.message;
                route.save();
            }
        }
        this.doingRoutes = false;
    },

    async sendSwapRoute(route) {
        const txParams = {
            nonce: await MinterApi.getNonce(route.bot.wallet.address),
            type: TX_TYPE.SELL_SWAP_POOL,
            data: {
                coins: route.ids, // route of coin IDs from spent to received
                valueToSell: route.amount,
                minimumValueToBuy: route.amount, // optional, 0 by default
            },
        };
        //const commission = await MinterApi.getTxParamsCommission(txParams);
        txParams.data.minimumValueToBuy = route.minToBuy * 1;
        txParams.chainId = MinterApi.params.network.chainId;
        return MinterApi.sendSignedTx(txParams, route.bot.wallet.seedPhrase);

    },

    uniqueArray(arr) {
        let set = new Set(arr.map(JSON.stringify));
        return Array.from(set).map(JSON.parse);
    }

}
export default obj;
