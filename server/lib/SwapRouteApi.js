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
                .then(() => {
                    //console.log()
                })
        }
    },

    async checkTransaction(tx) {
        if (tx.type === '1') {
            const routes = await Mongoose.swaproute.find({payDate: null})
                .populate({path: 'user', populate: 'parent'})
                .populate('wallet');
            for (const route of routes.filter(r => r.wallet.address === tx.to)) {
                const balance = await MinterApi.walletBalance(tx.to);
                route.wallet.balance = balance;
                route.wallet.save()
                if (balance >= process.env.SWAP_PAY_PER_ROUTE * 1) {
                    route.user.parent && MinterApi.fromWalletToAddress(route.wallet, route.user.parent.address, balance * 0.1)
                    MinterApi.walletMoveFunds(route.wallet, process.env.MAIN_WALLET)
                    route.payDate = new Date();
                    route.save()
                }
            }
        } else if (tx.type === '23') {
            if (tx.data.coins[0].id === tx.data.coins[tx.data.coins.length - 1].id && tx.data.value_to_sell * 1 < tx.data.minimum_value_to_buy * 1) {
                tx.coin = '';
                tx.value = 0;
                console.log(tx)
                Mongoose.transaction.create(tx)
            }
        }
    },

    doingRoutes: false,
    async doRoutes() {
        if (this.doingRoutes) return;
        this.doingRoutes = true;
        const routes = await Mongoose.swaproute.find({payDate: {$ne: null}, cron: true})
            .populate('wallet')
            .populate({path: 'user', populate: 'swapWallet'});
        for (const route of routes) {
            await this.sendSwapRoute(route, route.user.swapWallet)
        }
        this.doingRoutes = false;
    },

    async sendSwapRoute(route, wallet) {
        const txParams = {
            nonce: await MinterApi.getNonce(wallet.address),
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
        return new Promise((resolve, reject) => {
            MinterApi.sendSignedTx(txParams, wallet.seedPhrase)
                .then(r => {
                    route.lastTx = r.hash;
                    route.execDate = new Date();
                    route.lastError = '';
                    route.save()
                    resolve()
                })
                .catch(e => {
                    const message = e.code === '302' ? `MinToBuy ${MinterApi.fromPip(e.data.maximum_value_to_sell)}. Can buy only ${MinterApi.fromPip(e.data.needed_spend_value)}` : e.message
                    route.lastError = message;
                    route.execDate = new Date();
                    route.save()
                    reject(e);
                })
        })

    },

    async checkRoute(route) {
        return new Promise((resolve, reject) => {
            Mongoose.coin.find().then(async coinsNet => {
                const coinsUser = route.trim().toUpperCase().split(/[\s+|,|>]/).filter(c => c !== '');
                console.log(coinsUser)
                const symbols = [];
                const ids = [];
                for (const coinUser of coinsUser) {
                    const coin = coinsNet.find(c => c.id === coinUser * 1 || c.symbol === coinUser)
                    if (!coin) return reject({message: `Wrong coin "${coinUser}"`})
                    symbols.push(coin.symbol)
                    ids.push(coin.id)
                }

                if (symbols.length < 2) return reject({message: 'Too few coins to create a route'})
                resolve({ids, symbols})
            })

        })

    },

    uniqueArray(arr) {
        let set = new Set(arr.map(JSON.stringify));
        return Array.from(set).map(JSON.parse);
    }

}
export default obj;
