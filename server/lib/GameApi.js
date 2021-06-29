import Mongoose from "../db/Mongoose";
import MinterApi from "./MinterApi";

const obj = {
    async checkTransaction(tx) {
        const {hash, value, from} = tx;
        const wallet = await Mongoose.wallet.findOne({type: 'game', address: tx.to}).populate('user');
        if (!wallet) return;
        wallet.user.realBalance += value;
        await wallet.user.save();
        Mongoose.transaction.create(tx)
            .catch(()=>{})
    },
}

export default obj;