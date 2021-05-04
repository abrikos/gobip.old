import Mongoose from "server/db/Mongoose";
import MinterApi from "server/lib/MinterApi";

async function startup(){

    const w = await MinterApi.newWallet('Mx2d5a71832566d909d5ae00e148f7e930b02cd1b6')
    console.log(w)
}

startup();
