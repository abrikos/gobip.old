import PokerCard from "./PokerCard";
import {useEffect, useState} from "react";
import {Button, Form, FormControl} from "react-bootstrap";
import {navigate} from "hookrouter";
import Loader from "../../components/Loader";
import ErrorPage from "../../components/service/ErrorPage";
import MinterValue from "../../components/minter/MinterValue";

export default function PokerPlay(props) {
    const [data, setData] = useState();
    const [balance, setBalance] = useState({virtual: 0, real: 0});
    const [loader, setLoader] = useState();
    const [error, setError] = useState();
    useEffect(() => {
        loadData()
        const timer = setInterval(loadData, 5000)
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

    function doBet(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        props.store.api(`/poker/bet/${data.poker.id}`, form)
            .then(loadData)
    }

    function betButton(who) {
        console.log(who, data.poker.playerTurn, props.store.authenticatedUser._id)
        if (data.poker.playerTurn !== props.store.authenticatedUser._id || data.poker.playerTurn !== who) return;
        return <Form onSubmit={doBet}>
            <FormControl name="bet"/>
            <Button type="submit">Bet</Button>
        </Form>
    }

    if (!data) return <div>Loading</div>

    return <div>
        {error && <ErrorPage {...error}/>}
        <div>
            My balance: {data.poker.type === 'real' ?
            <MinterValue value={balance.real} {...props}/> : `${balance.virtual} virtual`}
        </div>

        {data.poker.playerTurn + ' - ' + props.store.authenticatedUser._id}

        <h1>{data.poker.type} Pokher "{data.poker.name}"</h1>


        Turn: {data.poker.playerTurn === props.store.authenticatedUser._id ? 'You turn' : 'Waiting for opponent'}

        <div className="d-flex">
            {data.poker.cardsOpponent && data.poker.cardsOpponent.map((p, i) => <PokerCard {...p} key={i}/>)}
            <div>
                {JSON.stringify(data.poker.betsOpponent)}
                {betButton(data.poker.opponent.id)}
            </div>

        </div>
        <div className="d-flex">
            <div>
                {data.poker.bank}
            </div>
            <div>{data.poker.desk.map((p, i) => <PokerCard {...p} key={i}/>)}</div>
        </div>
        <div className="d-flex">
            <div>{data.poker.cardsUser && data.poker.cardsUser.map((p, i) => <PokerCard {...p} key={i}/>)}</div>
            {JSON.stringify(data.poker.betsUser)}
            {betButton(data.poker.user.id)}
        </div>
        <hr/>
        {data.params.canJoin && <Button onClick={join}>Join game</Button>}

        {loader && <Loader/>}
        {data.poker.type} {data.params.role}
    </div>
}