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
        if (!res.length) return;
        let lottery = await Mongoose.lottery.findOne({closed: false});
        if (!lottery) return;
        lottery.amount = res[0].amount - MinterApi.params.bannerPrice * 2;
        await lottery.save();
    },

    async totalAmount() {
        const res = await Mongoose.wallet.find({type: 'banner'});
        return res.map(w => w.balance).reduce((a, b) => a + b, 0)
    },

    getLotteryStartSum(){
        return MinterApi.params.lotteryPrize + process.env.LOTTERY_FEE * 1;
    },

    async checkWinner() {
        const total = await this.totalAmount();
        if (total < this.getLotteryStartSum()) return //console.log('Small amount', amount);
        let lottery = await Mongoose.lottery.findOne({closed: false}).sort({createdAt: -1});
        if (!lottery) return //console.log('no lottery');
        if (lottery.liveTime < 60) return //console.log('LiveTime', lottery.liveTime);
        const wallets = await Mongoose.wallet.find({type: 'banner', balanceReal: {$gt: 0}}).populate({path: 'banner', populate: 'user'});
        if (!wallets.length) return console.log('NO LOTTERY WALLETS')
        const mainWallet = await Mongoose.wallet.findOne({address: process.env.MAIN_WALLET});
        const payment = new Mongoose.payment({tx: lottery.id})
        const items = [];
        for (const wallet of wallets) {
            //Collect from banners to Main
            payment.singleSends.push({to: mainWallet.address, value: wallet.balance, fromAddress: wallet.address, fromSeed: wallet.seedPhrase})
            for (let i = 0; i < wallet.balance; i++) {
                items.push(wallet)
            }
        }
        const win = items.filter(i => i.banner.user.address)[Math.floor(Math.random() * items.filter(i => i.addressPaymentFrom).length)];

        lottery.banner = win.banner;
        //Pay to winner
        payment.singleSends.push({saveResult: true, to: win.banner.user.address, value: MinterApi.params.lotteryPrize, fromAddress: mainWallet.address, fromSeed: mainWallet.seedPhrase})
        //console.log({saveResult: true, to: win.addressPaymentFrom, value: MinterApi.params.lotteryPrize, fromAddress: mainWallet.address, fromSeed: mainWallet.seedPhrase})
        console.log('Lottery liveTime', lottery.liveTime)
        await payment.save()
        lottery.amount = MinterApi.params.lotteryPrize;
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
        wallet.balanceReal = await MinterApi.walletBalance(wallet.address);
        wallet.banner.payDate = new Date();
        wallet.addressPaymentFrom = tx.from;
        await wallet.banner.save();
        await wallet.save();
    },


}
export default obj;
