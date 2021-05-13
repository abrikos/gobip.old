import PokerCard from "./PokerCard";
import React, {useEffect, useState} from "react";
import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import {navigate} from "hookrouter";
import Loader from "../../components/Loader";
import ErrorPage from "../../components/service/ErrorPage";
import MinterValue from "../../components/minter/MinterValue";
import PokerBet from "./PokerBet";

export default function PokerPlay(props) {
    const [data, setData] = useState();
    const [balance, setBalance] = useState({virtual: 0, real: 0});
    const [loader, setLoader] = useState();
    const [error, setError] = useState();
    useEffect(() => {
        loadData()
        const timer = setInterval(loadData, 1000)
        return () => clearInterval(timer);
    }, [props.id])

    function loadData() {
        setError(false)
        props.store.api(`/cabinet/user/balance`, {}, true).then(setBalance).catch(setError)
        props.store.api(`/poker/view/${props.id}`, {}, true).then(setData).catch(setError)
        //props.store.api(`/poker/player/cards/${props.id}`,{},false).then(setCards).catch(setError)
    }

    function join() {
        props.store.api(`/poker/join/${data.poker.id}`)
            .then(loadData)
    }


    if (!data) return <div>Loading</div>
    const desk = data.poker.desk.length ? data.poker.desk : [1, 2, 3]
    return <div>
        {error && <ErrorPage {...error}/>}
        <div>
            My balance: {data.poker.type === 'real' ?
            <MinterValue value={balance.real} {...props}/> : `${balance.virtual} virtual`}
        </div>


        <h1>{data.poker.type} Pokher "{data.poker.name}"</h1>

        Turn: {data.poker.playerTurn === props.store.authenticatedUser._id ? 'You turn' : 'Waiting for opponent'}

        {data.poker.opponentResult.sum && <div>{data.poker.opponentResult.name}</div>}
        <div className="d-flex">
            {data.poker.opponentCards.map((p, i) => <PokerCard {...p} key={i}/>)}
            <div>
                <PokerBet who={'opponent'} {...data} {...props} balance={balance} onBet={loadData}/>
            </div>

        </div>
        <div className="d-flex">
            <div>
                {data.poker.bank}
            </div>
            <div>{desk.map((p, i) => <PokerCard {...p} key={i}/>)}</div>
        </div>
        <div className="d-flex">
            <div>{data.poker.userCards && data.poker.userCards.map((p, i) => <PokerCard {...p} key={i}/>)}</div>
            <PokerBet who={'user'} {...data} {...props} balance={balance} onBet={loadData}/>
        </div>
        {data.poker.userResult.sum && <div>{data.poker.userResult.name}</div>}
        <hr/>
        {data.params.canJoin && <Button onClick={join}>Join game</Button>}

        {loader && <Loader/>}
        {data.poker.type} {data.params.role}
    </div>
}