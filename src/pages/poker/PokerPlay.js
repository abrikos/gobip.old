import PokerCard from "./PokerCard";
import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {navigate} from "hookrouter";
import PokerPlayerDesk from "./PokerPlayerDesk";
import PokerPlayerCards from "./PokerPlayerCards";
import PokerBet from "./PokerBet";
import audioFile from "../../sounds/beep-07.mp3"
import PokerInfo from "./PokerInfo";
import CopyButton from "../../components/copy-button/CopyButton";

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
            .catch(e=>alert(e.message))
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

    const shareLink = `${document.location.origin}/api/poker/share/${data.poker.id}`;
    return <div>
        <PokerInfo type={data.poker.type} {...props}/>
        <h1>Pokher <span className="text-info">{data.poker.name}</span> <span className={data.poker.type==='real' ? 'text-danger':''}>{data.poker.type.toUpperCase()}</span></h1>
        {data.params.canJoin && <Button onClick={join}>Join game</Button>}

        {!data.poker.result && <div>Turn: {!data.poker.opponent ? 'No opponent' : data.poker.playerTurn === props.store.authenticatedUser._id ? 'You turn' : 'Opponent`s turn'}</div>}

        <div className="border border-success w-100">
            <div className={`p-2 ${data.poker.turn === other ? 'hand-turn' : ''} ${data.poker.winners.includes(other) ? 'winner':''}`}>
                <div>{data.poker.status !== 'fold' && data.poker.result && data.poker[`${other}Result`].name}</div>
                <PokerPlayerCards who={other} showTimer={otherTurn} {...data}/>
            </div>
            <div className="container">
                <div className="row bg-success">
                    <div className="col-3 d-flex flex-column justify-content-center align-items-center">
                        {data.poker.round}
                        <PokerBet bet={data.poker.bank}/>
                    </div>
                    <div className="col-9 p-2">
                        <PokerBet bet={data.poker[`${other}Sum`]}/>
                        <div className="d-flex justify-content-start flex-wrap">
                            {desk.map((p, i) => <PokerCard {...p} key={i}/>)}
                        </div>
                        <PokerBet bet={data.poker[`${iam}Sum`]}/>
                    </div>
                </div>
            </div>
            <div className={`p-2 ${myTurn ? 'hand-turn' : ''} ${data.poker.winners.includes(iam) ? 'winner':''}`}>

                <PokerPlayerCards who={iam} showTimer={myTurn} {...data}/>
                <div>{data.poker.status !== 'fold' && data.poker[`${iam}Result`].name}</div>
            </div>
        </div>
        {data.poker.result && (data.poker[`${iam}Again`] ? <Button variant="warning">Wait opponent</Button> : <Button onClick={oneMoreTime}>One more time?</Button>)}
        <PokerPlayerDesk data={data} who={iam} loadData={loadData} balance={balance} {...props}/>
        <code>{shareLink}</code> <CopyButton text={shareLink}/>
    </div>
}