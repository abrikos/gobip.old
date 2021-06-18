import CopyButton from "../../components/copy-button/CopyButton";
import React from "react";

export default function ReferralProgram(props){
    if(!props.store.authenticatedUser) return <></>;
    const ref = document.location.origin + '/api/referral/' + props.store.authenticatedUser.referral + '?redirect=' + document.location.pathname;
    return  <div className="alert alert-success">
        <h4>Referral program</h4>
        <code>
            {ref} <CopyButton text={ref}/>
        </code>
    </div>
}