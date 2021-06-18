import React, {useEffect, useState} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import {A} from "hookrouter";
import "./cabinet.sass"
import MixerCabinet from "pages/mixer/MixerCabinet";
import BannerCabinet from "pages/banner/BannerCabinet";
import BetCabinet from "../bet/BetCabinet";
import CabinetUser from "./CabinetUser";
import GameList from "../../games/GameList";
import SwapRoutesCabinet from "../swap-route/SwapRoutesCabinet";
import ReferralProgram from "./ReferralProgram";

export default function Cabinet(props) {
    const [user,setUser] = useState();
    const pages = {
        user: {label: 'User'},
        mixer: {label: 'Mixer wallets'},
        banners: {label: 'Banners'},
        bet: {label: 'Bets'},
        //games: {label: 'Games'},
        swaproutes: {label: 'Swap routes'},
    }

    useEffect(() => {
        props.store.api('/cabinet/user')
            .then(setUser)

    }, [props.control])

    return <div className="cabinet">
        <MyBreadCrumb items={[
            {label: 'Cabinet', href: '/cabinet/user'},
            {label: pages[props.control] && pages[props.control].label}
        ]}/>
        <ReferralProgram {...props}/>
        <div>
            <div >{Object.keys(pages).map(p => <span key={p}  className={`m-2 ${p===props.control ? 'glowed':''}`}><A href={`/cabinet/${p}`}>{pages[p].label}</A></span>)}</div>
            <hr/>
            <div>
                {props.control === 'mixer' && <MixerCabinet user={user} {...props}/>}
                {props.control === 'banners' && <BannerCabinet user={user} {...props}/>}
                {props.control === 'bet' && <BetCabinet user={user} {...props}/>}
                {props.control === 'user' && <CabinetUser user={user} {...props}/>}
                {props.control === 'swaproutes' && <SwapRoutesCabinet user={user} {...props}/>}
                {props.control === 'games' && <GameList user={user} {...props}/>}
            </div>
        </div>


    </div>

}

