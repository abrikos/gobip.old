import React, {useEffect, useState} from "react";
import MinterValue from "../../components/minter/MinterValue";
import MixerAddressForm from "./MixerAddressForm";
import MixerCalcForm from "./MixerCalcForm";
import MixerInfo from "./MixerInfo";
import {A} from "hookrouter";
import LoginFormGoogle from "../../components/login/LoginFormGoogle";

export default function Mixer(props) {
    const [totalAmount, setTotalAmount] = useState(0);


    useEffect(() => {
        props.store.api('/mixer/total-amount')
            .then(r => setTotalAmount(r.amount))
    })




    return <div>
        <h1>{props.store.network.coin} Mixer <small className="badge"><a href="https://t.me/BipMixerBot" target="_blank">t.me/BipMixerBot</a></small> </h1>
        Available amount for mixing <MinterValue value={totalAmount} {...props}/>
        <MixerAddressForm  totalAmount={totalAmount} {...props}/>
        <MixerCalcForm totalAmount={totalAmount} {...props}/>

        {!props.store.authenticatedUser && <span>After completing a simple <u><LoginFormGoogle label={'registration'} redirect={'/cabinet/mixer'} {...props}/></u>:</span>}
        <MixerInfo {...props}/>


    </div>
}
