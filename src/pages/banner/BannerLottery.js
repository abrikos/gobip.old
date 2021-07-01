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
            <li>Registered users can add their banners to the right column of the site. Minimal cost: <MinterValue value={props.store.params.bannerPrice} {...props}/></li>
            <li>Each banner participates in a lottery with a prize of  <MinterValue value={amounts.prize} {...props}/></li>
            <li>The chance of winning the lottery depends on the number of coins on the banner's address. More coins - more chances</li>
            <li>The lottery is drawn when the amount of paid banners reaches <MinterValue value={amounts.lotteryStartSum} {...props}/></li>
            <li>There are <MinterValue value={amounts.lotteryStartSum - amounts.total} {...props}/> left until the next lottery draw</li>
            <li>Banner balances are reset after each lottery draw</li>
            <li>Only banners with non-zero balance participate in the lottery</li>
            <li>View your banners in  <u><A href="/cabinet/banners" >your account</A></u></li>
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




