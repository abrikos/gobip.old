import React, {useEffect, useState} from 'react';
import "./banner.sass";
import {BannerContainer} from "./Banners";
import {MinterTxLink} from "../../components/minter/MinterLink";
import MinterValue from "../../components/minter/MinterValue";


export default function BannerLottery(props) {
    const [winners, setWinners] = useState([]);
    const [amounts, setAmounts] = useState({});
    useEffect(() => {
        props.store.api('/banner/lottery/amounts')
            .then(setAmounts)
        props.store.api('/banner/lottery/winners')
            .then(setWinners)
    }, [])
    return <div className="BannerLottery">


        <div className="alert alert-info">
            Registered users can add their banners to the right column of the site. Cost: <MinterValue
            value={props.store.params.bannerPrice} {...props}/>. Upon reaching the amount of <MinterValue
            value={amounts.prize - amounts.total} {...props}/> on the wallets of the banners, a lottery is drawn. After that, the balance of
            the banner wallet is reset to
            zero. Only banners with non-zero balance participate in the lottery.
        </div>
        <h1>Banner lottery winners</h1>
        <div className="d-flex flex-wrap">
            {winners.map(w => <div key={w.id} className="w-25 p-2">
                <BannerContainer {...w.banner}/>
                <div className="text-center"><small>{w.winDate}</small> {<MinterTxLink tx={w.txWin} {...props}/>}</div>
            </div>)}
        </div>
    </div>
}




