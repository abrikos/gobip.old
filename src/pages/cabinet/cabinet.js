import React, {useEffect} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import {A} from "hookrouter";
import "./cabinet.sass"
import CabinetMixer from "pages/cabinet/CabinetMixer";
import CabinetBanner from "pages/cabinet/CabinetBanner";

export default function Cabinet(props) {
    const pages = {
        mixer: {label: 'Mixer'},
        banner: {label: 'Banner'},
    }

    useEffect(() => {
    }, [props.control])

    return <div>
        <MyBreadCrumb items={[
            {label: 'Cabinet', href: '/cabinet'},
            {label: pages[props.control] && pages[props.control].label}
        ]}/>
        <div className="row">
            <div className="col-sm-2">{Object.keys(pages).map(p => <div key={p}  className={p===props.control ? 'border-bottom':''}><A href={`/cabinet/${p}`}>{pages[p].label}</A></div>)}</div>
            <div className="col-sm-10">
                {props.control === 'mixer' && <CabinetMixer {...props}/>}
                {props.control === 'banner' && <CabinetBanner {...props}/>}
            </div>
        </div>


    </div>

}

