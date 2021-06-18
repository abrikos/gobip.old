import React, {useEffect, useState} from 'react';
import "./banner.sass";
import {BannerContainer} from "./Banners";
import {MinterTxLink} from "../../components/minter/MinterLink";
import MinterValue from "../../components/minter/MinterValue";
import {A} from "hookrouter"

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


        <ul className="alert alert-info">
            <li>Registered users can add their banners to the right column of the site. Cost: <MinterValue value={props.store.params.bannerPrice} {...props}/></li>
            <li>The lottery is drawn when the sum of balances of all wallets of active banners reaches <MinterValue value={amounts.prize - amounts.total} {...props}/></li>
            <li>After that, the balance of the banner wallet is reset to zero</li>
            <li>Only banners with non-zero balance participate in the lottery</li>
            <li>View your banners in  <A href="/cabinet/banners" className="btn btn-sm btn-primary">your account</A></li>
        </ul>
        <h1>Banner lottery winners</h1>
        <div className="d-flex flex-wrap">
            {winners.map(w => <div key={w.id} className="w-25 p-2">
                <BannerContainer {...w.banner}/>
                <div className="text-center"><small>{w.winDate}</small> {<MinterTxLink tx={w.txWin} {...props}/>}</div>
            </div>)}
        </div>
    </div>
}




