import MinterValue from "components/minter/MinterValue";
import React, {useEffect, useState} from "react";
import {MinterAddressLink} from "components/minter/MinterLink";
import ButtonLoading from "components/ButtonLoading";

export default function GameUserInfo(props) {
    const [userInfo, setUserInfo] = useState();

    useEffect(()=>{
        init();
        const timer = setInterval(init, 1000)
        return () => clearInterval(timer);
    },[])

    function init(){
        props.store.api('/cabinet/user', {}, true)
            .then(setUserInfo)
    }

    if(!props.store.authenticatedUser) return <div>No user</div>;
    if(!userInfo) return <div>No info</div>
    return (
        <div className="row">
            <div className="col-sm d-flex flex-column justify-content-center ">
                {['real', 'any'].includes(props.type) && (
                    <div className="col">
                        Balance real: <MinterValue value={userInfo.realBalance} {...props}/>{' '}
                        {!!userInfo.realBalance && <ButtonLoading size={'sm'} url={'/game/cabinet/wallet/withdraw'}  {...props} confirmMessage={'Withdraw?'}>Withdraw</ButtonLoading>}
                        <small className="d-block">to top up <MinterAddressLink address={userInfo.gameWallet.address} short={0} {...props}/></small>
                    </div>)}
            </div>
            {['virtual', 'any'].includes(props.type) && <div  className="col text-center">Balance virtual: <span className="text-success">{userInfo.virtualBalance.toLocaleString('ru')}</span></div>}
        </div>
    )
}