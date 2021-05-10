import React, {useEffect} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import {A} from "hookrouter";
import "./cabinet.sass"
import MixerCabinet from "pages/mixer/MixerCabinet";
import BannerCabinet from "pages/banner/BannerCabinet";
import BetCabinet from "../bet/BetCabinet";
import CabinetUser from "./CabinetUser";

export default function Cabinet(props) {
    const pages = {
        user: {label: 'User'},
        mixer: {label: 'Mixer wallets'},
        banners: {label: 'Banners'},
        bet: {label: 'Bets'},
    }

    useEffect(() => {
    }, [props.control])

    return <div className="cabinet">
        <MyBreadCrumb items={[
            {label: 'Cabinet', href: '/cabinet/user'},
            {label: pages[props.control] && pages[props.control].label}
        ]}/>
        <div>
            <div >{Object.keys(pages).map(p => <span key={p}  className={`m-2 ${p===props.control ? 'selected':''}`}><A href={`/cabinet/${p}`}>{pages[p].label}</A></span>)}</div>
            <hr/>
            <div>
                {props.control === 'mixer' && <MixerCabinet {...props}/>}
                {props.control === 'banners' && <BannerCabinet {...props}/>}
                {props.control === 'bet' && <BetCabinet {...props}/>}
                {props.control === 'user' && <CabinetUser {...props}/>}
            </div>
        </div>


    </div>

}

