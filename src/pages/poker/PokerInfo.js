import MinterValue from "../../components/minter/MinterValue";
import React, {useEffect, useState} from "react";
import {MinterAddressLink} from "../../components/minter/MinterLink";
import ButtonLoading from "../../components/ButtonLoading";

export default function PokerInfo(props) {
    const [data, setData] = useState({})
    useEffect(()=>{
        init();
        const timer = setInterval(init, 5000)
        return () => clearInterval(timer);
    }, [])

    function init() {
        props.store.api('/poker/cabinet/info')
            .then(setData)
    }

    function changeAddress() {
        props.store.api('/poker/cabinet/wallet/change')
            .then(init)
    }

    return (
        <div className="row">
            <div className="col">
                <div>Balance real: <MinterValue value={data.realBalance} {...props}/></div>
                <div>Balance virtual: {data.virtualBalance}</div>
            </div>
            <div className="col">
                <strong>Wallet for refill real balance</strong>{' '}
                {data.address ? <span>
                 <MinterAddressLink address={data.address} {...props}/>
                <ButtonLoading url={'/poker/cabinet/wallet/change'} onFinish={init} {...props}>Change</ButtonLoading>
            </span>
                    :
                    <ButtonLoading url={'/poker/cabinet/wallet/change'} onFinish={init} {...props}>Create</ButtonLoading>}
            </div>


        </div>
    )
}