import CopyButton from "../../components/copy-button/CopyButton";
import React from "react";

export default function ReferralProgram(props){
    if(!props.store.authenticatedUser) return <></>;
    const ref = document.location.origin + '/api/referral/' + props.store.authenticatedUser.referral + (props.redirect ? '?redirect=' + props.redirect : '');
    return  <div className="alert alert-success">
        <h4>Referral program</h4>
        All your referrals will bring 10% of their profit
        <hr/>
        <code>
            {ref} <CopyButton text={ref}/>
        </code>
    </div>
}