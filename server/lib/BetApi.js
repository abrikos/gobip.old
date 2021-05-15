import Mongoose from "../db/Mongoose";
import MinterApi from "./MinterApi";
import moment from "moment";

const obj = {
    async checkTransaction(tx) {
        const wallet = await Mongoose.wallet.findOne({type: 'bet', address: tx.to})
            .populate('betF')
            .populate('betA')
        if (!wallet) return;
        wallet.balanceReal = await MinterApi.walletBalance(wallet.address);
        await wallet.save();
        const {hash, value, from} = tx;
        const obj = {hash, value, from};

        if (wallet.betF && !wallet.betF.votesF.map(o => o.hash).includes(obj.hash)) {
            wallet.betF.votesF.push(obj);
            wallet.betF.save()
        }

        //wallet.betF && console.log(wallet.betF.votesA.map(o=>JSON.stringify(o)).indexOf(str), obj, str, wallet.betF.votesF)
        //wallet.betA && console.log(wallet.betA.votesA.map(o=>JSON.stringify(o)).indexOf(str), obj, str, wallet.betA.votesA)
        if (wallet.betA && !wallet.betA.votesA.map(o => o.hash).includes(obj.hash)) {
            wallet.betA.votesA.push(obj);
            wallet.betA.save()
        }


    },

    async checkDates() {
        const bets = await Mongoose.bet.find({closed: null, checkDate: {$lt: moment().format('YYYY-MM-DD')}}) //, checkDate: {$gt: new Date()}
            .populate({path: 'walletF', select: ['address', 'balanceReal', 'seedPhrase']})
            .populate({path: 'walletA', select: ['address', 'balanceReal', 'seedPhrase']})
            .populate('user')
        for (const bet of bets) {
            console.log('BET owner refund', bet.userRefund)
            const crypto = await Mongoose.crypto.findOne({pair: bet.pair}).sort({createdAt: -1})
            const isRight = eval(`${crypto.value}
            ${bet.condition}
            ${bet.value}`);
            const winners = isRight ? bet.votesF : bet.votesA;
            const sum = winners.map(v => v.value).reduce((a, b) => a + b)
            const mainWallet = await Mongoose.wallet.findOne({address: process.env.MAIN_WALLET});
            const payment = new Mongoose.payment({tx: bet.id, fromMultiSend: mainWallet })
            payment.tx = moment().unix();
            for (const win of winners) {
                const value = win.value / sum * bet.prizeForWinners
                const multiSend = {to: win.from, value}
                payment.multiSends.push(multiSend)
            }
            payment.multiSends.push({to:bet.user.address, value:bet.userRefund})
            const wallets = [bet.walletF, bet.walletA];

            for (const wallet of wallets) {
                payment.singleSends.push({to: mainWallet.address, value: wallet.balance, fromAddress: wallet.address, fromSeed: wallet.seedPhrase})
            }
            //console.log(payment.multiSends)
            bet.closed = true;
            bet.payment = payment;
            await bet.save();
            await payment.save()
        }
    }

}

//Mongoose.bet.updateMany({},{$set:{checkDate:'2021-01-01'}}).then(console.log)
//Mongoose.user.findOne().then(u=>{u.admin=true;u.save()})
//Mongoose.bet.deleteMany({}).then(console.log)
//obj.getPairs().then(console.log)
export default obj;