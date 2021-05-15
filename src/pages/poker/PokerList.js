import React, {useEffect, useState} from "react";
import {A, navigate} from "hookrouter"
import "./poker.sass"
import {Button} from "react-bootstrap";
import {MinterAddressLink} from "../../components/minter/MinterLink";
import ButtonLoading from "../../components/ButtonLoading";
import PokerInfo from "./PokerInfo";

export default function PokerList(props) {
    const [pokers, setPokers] = useState([])
    const [address, setAddress] = useState()

    useEffect(() => {
        loadData();

        const timer = setInterval(loadData, 5000)
        return () => clearInterval(timer);
    }, [])

    function loadData() {
        const url = !!props.cabinet ? '/poker/cabinet/list' : '/poker/list'
        props.store.api(url, {}, true).then(setPokers)
    }

    function checkIsPlayer(p) {
        const u = props.store.authenticatedUser;
        if (!u) return false;
        return [p.user, p.owner].includes(u.id)
    }

    function filter(type, p) {
        if (p.result && type === 'closed') return true;
        if (!p.result && type === p.type) return true;
        return false;
    }

    function create(type) {
        props.store.api('/poker/game/start', {type})
            .then(r => {
                navigate(`/poker/play/${r.id}`)

                //loadData()
            })
    }


    function drawList(type) {
        return <div className={`alert alert-${type === 'real' ? 'warning' : type === 'closed' ? '' : 'success'}`}>
            <h3>{type}</h3>
            {props.cabinet && type !== 'closed' && <Button onClick={() => create(type)}>Start {type} pokher</Button>}
            <div>
                {pokers.filter(p => filter(type, p))
                    .map(p => <div key={p.id}><A href={`/poker/${checkIsPlayer(p) ? 'play' : 'view'}/${p.id}`}>{p.date} {p.name}</A></div>)}
            </div>
        </div>
    }

    return <div>
        <PokerInfo {...props}/>
        <h1>{props.cabinet ? 'My' : 'Available'} pokher games</h1>

        <div className="container">
            <div className="row">
                <div className="col-sm">{drawList('virtual')}</div>
                <div className="col-sm">                    {drawList('real')}                </div>
            </div>
        </div>
        <div>
            {drawList('closed')}
        </div>
    </div>
}