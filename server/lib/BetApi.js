import Mongoose from "../db/Mongoose";
import MinterApi from "./MinterApi";

const obj = {
    async getPairs() {
        const pairs = await Mongoose.crypto.aggregate([{$group: {_id: {from: "$from", to: "$to"}}}]).sort({_id: 1})
        return pairs.map(p => p._id)
    },

    async checkTransaction(tx) {
        const wallet = await Mongoose.wallet.findOne({type: 'bet', address: tx.to})
            .populate('betF')
            .populate('betA')
        if (!wallet) return;
        wallet.balance = await MinterApi.walletBalance(wallet.address);
        await wallet.save();
        const {hash, value} = tx;
        const obj = {hash, value};
        const str = JSON.stringify(obj);

        if (wallet.betF && !wallet.betF.votesF.map(o=>JSON.stringify(o)).includes(str)) {
                wallet.betF.votesF.push(obj);
                wallet.betF.save()
        }

        //wallet.betF && console.log(wallet.betF.votesA.map(o=>JSON.stringify(o)).indexOf(str), obj, str, wallet.betF.votesF)
        //wallet.betA && console.log(wallet.betA.votesA.map(o=>JSON.stringify(o)).indexOf(str), obj, str, wallet.betA.votesA)
        if (wallet.betA && !wallet.betA.votesA.map(o=>JSON.stringify(o)).includes(str)) {

                wallet.betA.votesA.push(obj);
                wallet.betA.save()
        }


    }
}
//obj.getPairs().then(console.log)
export default obj;