import MinterApi from "server/lib/MinterApi";

async function startup(){

    const w = await MinterApi.newWallet()
    console.log(w)
}

startup();
