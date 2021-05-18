import MinterValue from "../../components/minter/MinterValue";
import React, {useEffect, useState} from "react";
import {MinterAddressLink} from "../../components/minter/MinterLink";
import ButtonLoading from "../../components/ButtonLoading";

export default function PokerInfo(props) {
    const [data, setData] = useState({})
    useEffect(() => {
        init();
        const timer = setInterval(init, 5000)
        return () => clearInterval(timer);
    }, [])

    function init() {
        props.store.api('/poker/cabinet/info', {}, true)
            .then(setData)
    }

    if(!props.store.authenticatedUser) return <div/>;
    return (
        <div className="row">
            <div className="col-sm d-flex flex-column justify-content-center ">
                {['real', 'any'].includes(props.type) && (
                    <div>
                        Balance real: <MinterValue value={data.realBalance} {...props}/>{' '}
                        {!!data.realBalance && <ButtonLoading size={'sm'} url={'/poker/cabinet/wallet/withdraw'} onFinish={init} {...props} confirmMessage={'Withdraw?'}>Withdraw</ButtonLoading>}
                    </div>)}
                {['virtual', 'any'].includes(props.type) && <div>Balance virtual: {data.virtualBalance}</div>}
            </div>
            {['real', 'any'].includes(props.type) &&<div className="col-sm text-center">
                <strong>Wallet for refill real balance</strong>{' '}
                {data.address ? <span>
                 <MinterAddressLink address={data.address} {...props}/>
                <ButtonLoading size={'sm'} url={'/poker/cabinet/wallet/change'} onFinish={init} {...props}>Change</ButtonLoading>
            </span>
                    :
                    <ButtonLoading size={'sm'} url={'/poker/cabinet/wallet/change'} onFinish={init} {...props}>Create</ButtonLoading>}
            </div>}


        </div>
    )
}