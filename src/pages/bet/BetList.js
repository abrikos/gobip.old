import React, {useEffect, useState} from 'react';
import {A} from "hookrouter"
import "./bet.sass"
import Loader from "components/Loader";
import BetBlock from "./BetBlock";


export default function BetList(props) {
    const [bets, setBets] = useState([]);

    useEffect(() => {
        loadBets();
        const timer = setInterval(loadBets, 10000)
        return () => clearInterval(timer);
    }, []);

    function loadBets() {
        props.store.api('/bet/list')
            .then(d => {
                setBets(d);
            })
    }


    //if(!bets) return <div/>;
    return <div>
        <h1>Active bets</h1>
        <div className="d-flex flex-wrap">
            {bets.filter(b=>!b.closed).map(b=><BetBlock bet={b} key={b.id} {...props}/>)}
        </div>
        <h1>Closed bets</h1>
        <div className="d-flex flex-wrap">
            {bets.filter(b=>b.closed).map(b=><BetBlock bet={b} key={b.id} {...props}/>)}
        </div>


        {/*<div className="col-sm-4"><Mixer {...props}/></div>*/}

    </div>

}

