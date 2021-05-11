import React, {useEffect, useState} from "react";
import MinterValue from "../../components/minter/MinterValue";
import MixerAddressForm from "./MixerAddressForm";
import MixerCalcForm from "./MixerCalcForm";

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

        <div className="alert-success alert">
            After completing a simple registration, you will be able to receive your income from the funds placed in the
            mixer. The system commission from each mix <small>(<MinterValue
            value={props.store.params.mixerFee} {...props}/>)</small> is divided among all investors in proportion to
            the amount on their wallets.
        </div>


    </div>
}
