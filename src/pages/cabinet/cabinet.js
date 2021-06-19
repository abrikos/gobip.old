import React, {useEffect, useState} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import "./cabinet.sass"
import MixerCabinet from "pages/mixer/MixerCabinet";
import BannerCabinet from "pages/banner/BannerCabinet";
import BetCabinet from "../bet/BetCabinet";
import CabinetUser from "./CabinetUser";
import SwapRoutesCabinet from "../swap-route/SwapRoutesCabinet";
import GameCabinet from "../../games/GameCabinet";
import Nav from "react-bootstrap/Nav";
import {A} from "hookrouter";

export default function Cabinet(props) {
    const [user, setUser] = useState();
    const pages = {
        user: {label: 'User'},
        mixer: {label: 'Mixer wallets'},
        banners: {label: 'Banners'},
        bet: {label: 'Bets'},
        games: {label: 'Games'},
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

        <Nav variant="tabs">
            {Object.keys(pages).map(p => <Nav.Item key={p}>
                <A href={`/cabinet/${p}`} className={`nav-link ${p === props.control ? 'glowed active' : ''}`}>{pages[p].label}</A>
            </Nav.Item>)}
        </Nav>
        <div className="py-2">
            {props.control === 'mixer' && <MixerCabinet user={user} {...props}/>}
            {props.control === 'banners' && <BannerCabinet user={user} {...props}/>}
            {props.control === 'bet' && <BetCabinet user={user} {...props}/>}
            {props.control === 'user' && <CabinetUser user={user} {...props}/>}
            {props.control === 'swaproutes' && <SwapRoutesCabinet user={user} {...props}/>}
            {props.control === 'games' && <GameCabinet user={user} {...props}/>}
        </div>
    </div>

}

