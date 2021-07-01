import MinterValue from "../../components/minter/MinterValue";
import React from "react";

export default function MixerInfo(props){
    return <div className="alert-success alert">
        You will be able to receive your income from the funds placed in the
        mixer. The system commission from each mix <small>(<MinterValue
        value={props.store.params.mixerFee} {...props}/>)</small> is divided among all investors in proportion to
        the amount on their wallets.
    </div>
}