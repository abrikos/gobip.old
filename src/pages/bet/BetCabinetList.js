import React, {useEffect, useState} from 'react';
import {Button} from "react-bootstrap";
import {MinterAddressLink} from "components/minter/MinterLink";
import {A, navigate} from "hookrouter"
import Loader from "components/Loader";
import BetBlock from "./BetBlock";


export default function BetCabinetList(props) {
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBets();
        const timer = setInterval(loadBets, 1000)
        return () => clearInterval(timer);
    }, []);

    function loadBets() {
        props.store.api('/cabinet/bet/list')
            .then(d => {
                setBets(d);
            })
    }

    function createBet() {
        return navigate('/cabinet/bet/create')
        setLoading(true)
        props.store.api('/cabinet/bet/create')
            .then(d => {
                loadBets();
                navigate('/cabinet/bet/'+d.id)
                setLoading(false)
            })
    }

    //if(!bets) return <div/>;
    return <div>
        <Button onClick={createBet}>Create bet</Button>
        <h1>My active bets</h1>
        <div className="d-flex flex-wrap">
            {bets.filter(b=>!b.closed).map(b=><BetBlock bet={b} key={b.id} cabinet {...props}/>)}
        </div>
        <h1>My closed bets</h1>
        <div className="d-flex flex-wrap">
            {bets.filter(b=>b.closed).map(b=><BetBlock bet={b} key={b.id} cabinet {...props}/>)}
        </div>
    </div>

}

