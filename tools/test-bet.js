import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";


async function startup(){
    const body ={
        pair:'BTC-USD',
        condition:'<=',
        value: 50,
        checkDate: '2022-01-01'
    }
    body.user = '6094a34cc55b0782371752d4';
    Mongoose.bet.create(body)
        .then(async r => {
            r.walletF = await MinterApi.newWallet('bet', null, body.user)
            r.walletA = await MinterApi.newWallet('bet', null, body.user)
            r.save()

        })
}

startup();
