import React, {useEffect, useState} from 'react';
import "./banner.sass";
import {A} from "hookrouter"
import {BannerContainer} from "./Banners";
import {MinterTxLink} from "../../components/MinterLink";


export default function BannerLottery(props) {
    const [winners, setWinners] = useState([])
    useEffect(()=>{

        props.store.api('/banner/lottery/winners')
            .then(setWinners)
    },[])
    return <div className="BannerLottery">

        <h1>Lottery winners</h1>
        <div className="d-flex flex-wrap">
        {winners.map(w=><div key={w.id}  className="w-25 p-2">
            <BannerContainer {...w.banner}/>
            <div className="text-center">{<MinterTxLink tx={w.txWin} {...props}/>}</div>
        </div>)}
        </div>
    </div>
}




