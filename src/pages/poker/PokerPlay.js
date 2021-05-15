import PokerCard from "./PokerCard";
import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import MinterValue from "../../components/minter/MinterValue";
import {navigate} from "hookrouter";
import PokerPlayerDesk from "./PokerPlayerDesk";
import PokerPlayerCards from "./PokerPlayerCards";
import PokerBet from "./PokerBet";
import audioFile from "../../sounds/beep-07.mp3"
import PokerInfo from "./PokerInfo";

export default function PokerPlay(props) {
    const [data, setData] = useState();
    const [balance, setBalance] = useState({virtual: 0, real: 0});
    const beep = new Audio(audioFile)

    useEffect(() => {
        loadData();
        const timer = setInterval(loadData, 1000)
        return () => clearInterval(timer);
    }, [props.id])

    function loadData() {
        props.store.api(`/cabinet/user/balance`, {}, true).then(setBalance)
        props.store.api(`/poker/view/${props.id}`, {}, true).then(setData)
        //props.store.api(`/poker/player/cards/${props.id}`,{},false).then(setCards).catch(setError)
    }

    function join() {
        props.store.api(`/poker/join/${data.poker.id}`)
            .then(loadData)
    }

    function oneMoreTime() {
        props.store.api(`/poker/again/${data.poker.id}`)
            .then(loadData)
    }

    if (!data) return <div>Loading PokerPlay</div>
    if (data.poker.pokerAgainId) navigate(`/poker/play/${data.poker.pokerAgainId}`)
    const desk = data.poker.desk.length ? data.poker.desk : [1, 2, 3]
    const iam = props.store.authenticatedUser._id === data.poker.user.id ? 'user' : 'opponent';
    const other = iam === 'user' ? 'opponent' : 'user';
    const myTurn = data.poker.turn === iam;
    const otherTurn = data.poker.turn === other;
    if (data.poker.secondsLeft < data.params.alertSeconds && data.poker.secondsLeft > 0) {
        beep.play()
            .catch(console.log)
    }

    return <div>
        <PokerInfo {...props}/>
        <h1>{data.poker.type} Pokher "{data.poker.name}"</h1>
        {data.params.canJoin && <Button onClick={join}>Join game</Button>}

        {!data.poker.result && <div>Turn: {data.poker.playerTurn === props.store.authenticatedUser._id ? 'You turn' : 'Waiting for opponent'}</div>}

        <div className="border border-success w-100">
            <div className={`p-2 ${data.poker.turn === other ? 'hand-turn' : ''}`}>
                <div>{data.poker.status !== 'fold' && data.poker.result && data.poker.opponentResult.name}</div>
                <PokerPlayerCards who={'opponent'} showTimer={otherTurn} {...data}/>
            </div>
            <div className="container">
                <div className="row bg-success">
                    <div className="col-2">
                        <PokerBet bet={data.poker[`${other}Sum`]}/>
                        <PokerBet bet={data.poker.bank}/>
                        <PokerBet bet={data.poker[`${iam}Sum`]}/>
                    </div>
                    <div className="col-10 p-2 text-center">
                        {data.poker.round}
                        <div className="d-flex justify-content-start flex-wrap">
                            {desk.map((p, i) => <PokerCard {...p} key={i}/>)}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`p-2 ${myTurn ? 'hand-turn' : ''}`}>
                <PokerPlayerCards who={'user'} showTimer={myTurn} {...data}/>
                <div>{data.poker.status !== 'fold' && data.poker[`${iam}Result`].name}</div>
            </div>
        </div>
        {data.poker.result && (data.poker[`${iam}Again`] ? <Button variant="warning">Wait opponent</Button> : <Button onClick={oneMoreTime}>One more time?</Button>)}
        <PokerPlayerDesk data={data} who={iam} loadData={loadData} balance={balance} {...props}/>
    </div>
}