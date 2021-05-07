import Mongoose from "server/db/Mongoose";

const obj = {
    async checkTransaction(tx) {
        if (tx.type * 1 !== 8) return
        const data = tx;
        data.value = tx.data.value * 1e-18;
        data.coin = tx.data.coin.symbol;
        await Mongoose.unbound.create(tx)
            .catch(e=>console.log('Unbound exists'))
    },
}
export default obj;
