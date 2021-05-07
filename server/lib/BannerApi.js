import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";


const obj = {
    async cronJob() {
        await this.checkWallets();
        //await this.moveToMain();
    },

    async fundsBack(){
        const seed = process.env.MAIN_SEED;
        const wallets = await Mongoose.wallet.find({type: 'banner'});
        const list = []
        for(const w of wallets){
            const data = {value: 5, coin: 0, to:w.address}
            list.push(data)
        }
        const tx = await MinterApi.sendTx({txParams: {data:{list}}, address:process.env.MAIN_WALLET, seedPhrase:process.env.MAIN_SEED});
        console.log(tx)
    },

    async totalAmount() {
        const res = await Mongoose.wallet.aggregate([{$group: {_id: "$type", amount: {$sum: "$balance"}}}, {$match: {"_id": "banner"}}])
        return res[0].amount
    },

    async checkWinner() {
        Mongoose.banner.find({payDate:{$ne:null}})
    },

    async checkWallets() {
        //if(tx.value <= MinterApi.params.mixerFee * 1 + 1) return console.log('DONATE', tx.hash, tx.value, MinterApi.params.mixerFee + 1);
        const wallets = await Mongoose.wallet.find({type: 'banner', balance: {$gte: MinterApi.params.bannerPrice}}).populate('banner')
        for (const w of wallets) {
            w.banner.payDate = new Date();
            await w.banner.save();
        }
    },

    async moveToMain() {
        const wallets = await Mongoose.wallet.find({type: 'banner', balance: {$gt: 0}})
        for (const w of wallets) {
            const tx = await MinterApi.walletMoveFunds(w, process.env.MAIN_WALLET);
            if (tx) {
                w.balance = 0;
                await w.save()
            }
        }
    }

}
export default obj;
