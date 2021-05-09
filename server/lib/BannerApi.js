import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";


const obj = {
    async cronJob() {
        await this.checkBannerPayment();
        await this.checkWinner();
        await this.lotteryCheckAmount();
    },

    async lotteryCheckAmount() {
        const res = await Mongoose.wallet.aggregate([{$group: {_id: "$type", amount: {$sum: "$balance"}}}, {$match: {"_id": "banner"}}])
        let lottery = await Mongoose.lottery.findOne({closed: false});
        if (!lottery) return;
        lottery.amount = res[0].amount -  MinterApi.params.bannerPrice * 2;
        await lottery.save();
    },

    async fundsBack() {
        const seed = process.env.MAIN_SEED;
        const wallets = await Mongoose.wallet.find({type: 'banner'});
        const list = []
        for (const w of wallets) {
            const data = {value: 5, coin: 0, to: w.address}
            list.push(data)
        }
        const tx = await MinterApi.sendTx({
            txParams: {data: {list}},
            address: process.env.MAIN_WALLET,
            seedPhrase: process.env.MAIN_SEED
        });
        console.log(tx)
    },

    async totalAmount() {
        const res = await Mongoose.lottery.findOne({closed: false});
        return res ? res.amount : 0
    },

    async checkWinner() {
        const amount = await this.totalAmount();
        if (amount < MinterApi.params.lotteryPrise) return //console.log('Small amount', amount);
        let lottery = await Mongoose.lottery.findOne({closed: false}).sort({createdAt: -1});
        if (!lottery) return //console.log('no lottery');
        if (lottery.liveTime < 60) return //console.log('LiveTime', lottery.liveTime);
        const wallets = await Mongoose.wallet.find({type: 'banner', balance: {$gt: 0}}).populate('banner');
        if (!wallets.length) return console.log('NO LOTTERY WALLETS')
        const mainWallet = await Mongoose.wallet.findOne({address: process.env.MAIN_WALLET});
        const payment = new Mongoose.payment({tx: lottery.id})
        const items = [];
        for (const wallet of wallets) {
            //console.log({to: mainWallet.address, value: wallet.balance, fromAddress: wallet.address, fromSeed: wallet.seedPhrase})
            payment.singleSends.push({to: mainWallet.address, value: wallet.balance, fromAddress: wallet.address, fromSeed: wallet.seedPhrase})
            for (let i = 0; i < wallet.balance; i++) {
                items.push(wallet)
            }
        }
        const win = items.filter(i => i.addressPaymentFrom)[Math.floor(Math.random() * items.filter(i => i.addressPaymentFrom).length)];

        lottery.banner = win.banner;
        payment.singleSends.push({saveResult: true, to: win.addressPaymentFrom, value: MinterApi.params.lotteryPrise, fromAddress: mainWallet.address, fromSeed: mainWallet.seedPhrase})
        //console.log({saveResult: true, to: win.addressPaymentFrom, value: MinterApi.params.lotteryPrise, fromAddress: mainWallet.address, fromSeed: mainWallet.seedPhrase})
        console.log('Lottery liveTime', lottery.liveTime)
        await payment.save()
        lottery.payment = payment;
        await lottery.save();
        await Mongoose.lottery.create({});
        console.log('LOTTERY created')
    },

    lotteryInit() {
        Mongoose.lottery.find({closed: false}).then(ls => {
            if (!ls.length) Mongoose.lottery.create({})
        })
    },

    async checkBannerPayment() {
        const banners = await Mongoose.banner.find({
            payDate: null,
        }).populate('wallet')
        for (const banner of banners) {
            if (banner.wallet.balance >= MinterApi.params.bannerPrice) {
                banner.payDate = new Date();
                await banner.save();
            }
        }
    },

    async attachLottery() {
        const banners = await Mongoose.banner.find().populate('wallet')
        for (const banner of banners) {
            const lottery = await Mongoose.lottery.create({wallet: banner.wallet})
            console.log(lottery)
        }
    },

    async checkTransaction(tx) {
        const wallet = await Mongoose.wallet.findOne({type: 'banner', address: tx.to}).populate('banner');
        if (!wallet) return;
        wallet.balance = await MinterApi.walletBalance(wallet.address);
        wallet.banner.payDate = new Date();
        wallet.addressPaymentFrom = tx.from;
        await wallet.banner.save();
        await wallet.save();
    },


}
export default obj;
