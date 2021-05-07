import React, {useEffect} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import {A} from "hookrouter";
import "./cabinet.sass"
import CabinetMixer from "pages/cabinet/CabinetMixer";
import CabinetBanner from "pages/cabinet/CabinetBanner";

export default function Cabinet(props) {
    const pages = {
        mixer: {label: 'Mixer'},
        banners: {label: 'Banners'},
    }

    useEffect(() => {
    }, [props.control])

    return <div className="cabinet">
        <MyBreadCrumb items={[
            {label: 'Cabinet', href: '/cabinet'},
            {label: pages[props.control] && pages[props.control].label}
        ]}/>
        <div>
            <div >{Object.keys(pages).map(p => <span key={p}  className={`m-2 ${p===props.control ? 'selected':''}`}><A href={`/cabinet/${p}`}>{pages[p].label}</A></span>)}</div>
            <hr/>
            <div>
                {props.control === 'mixer' && <CabinetMixer {...props}/>}
                {props.control === 'banners' && <CabinetBanner {...props}/>}
            </div>
        </div>


    </div>

}

