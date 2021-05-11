import Mongoose from "server/db/Mongoose";
//import MinterApi from "server/lib/MinterApi";

async function startup(){
    const txs = await Mongoose.transaction.find()
    for (const tx of txs){
        console.log(tx)
    }


}

startup();
