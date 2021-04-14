import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";

async function startup(){

    Mongoose.transaction.count({}).then(console.log)
    await Mongoose.transaction.deleteMany({})
    MinterApi.get(`transactions`, `query=tags.tx.type='08'&page=0&per_page=1`)
        .then(console.log)
        .catch(r=>console.log(r.response.data))

    for(let i = 1; i<=2; i++){
        await MinterApi.getUnboundTxs(i)
    }
    console.log('DONE. Press Ctrl+C')
}

startup();
