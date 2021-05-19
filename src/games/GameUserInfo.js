import MinterValue from "components/minter/MinterValue";
import React from "react";
import {MinterAddressLink} from "components/minter/MinterLink";
import ButtonLoading from "components/ButtonLoading";

export default function GameUserInfo(props) {
    const {userInfo} = props;
    //const [userInfo, setuserInfo] = useState({})


    if(!props.store.authenticatedUser) return <div>No user</div>;
    return (
        <div className="row">
            <div className="col-sm d-flex flex-column justify-content-center ">
                {['real', 'any'].includes(props.type) && (
                    <div>
                        Balance real: <MinterValue value={userInfo.realBalance} {...props}/>{' '}
                        {!!userInfo.realBalance && <ButtonLoading size={'sm'} url={'/poker/cabinet/wallet/withdraw'}  {...props} confirmMessage={'Withdraw?'}>Withdraw</ButtonLoading>}
                    </div>)}
                {['virtual', 'any'].includes(props.type) && <div>Balance virtual: {userInfo.virtualBalance}</div>}
            </div>
            {['real', 'any'].includes(props.type) &&<div className="col-sm text-center">
                <strong>Wallet for refill real balance</strong>{' '}
                {userInfo.address ? <span>
                 <MinterAddressLink address={userInfo.address} {...props}/>
                <ButtonLoading size={'sm'} url={'/game/cabinet/wallet/change'}  {...props}>Change</ButtonLoading>
            </span>
                    :
                    <ButtonLoading size={'sm'} url={'/game/cabinet/wallet/change'}  {...props}>Create</ButtonLoading>}
            </div>}


        </div>
    )
}