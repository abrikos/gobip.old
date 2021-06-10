import SwapBotEdit from "./SwapBotEdit";
import SwapBotList from "./SwapBotList";
import React from "react";
import CopyButton from "../../components/copy-button/CopyButton";

export default function SwapBotCabinet(props){
    const ref = document.location.origin +'/api/referral/'+ props.store.authenticatedUser.referral;
    return <div>
        <div className="alert alert-success">
            <h4>Referral program</h4>
            Each route paid by your referrals will bring you 10% of the cost
            <hr/>
            <code>
            {ref} <CopyButton text={ref}/>
            </code>
        </div>
        {props.id ? <SwapBotEdit {...props}/> : <SwapBotList {...props}/>}
    </div>
}