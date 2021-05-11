import React from "react";


export default function MinterValue(props) {
    return <span className="minter-value"><span className="value">{(props.value * 1).toFixed(1)}</span><span className="coin">&nbsp;{props.store.network.coin}</span></span>
}

