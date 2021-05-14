import PokerCard from "./PokerCard";
import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import Loader from "../../components/Loader";
import MinterValue from "../../components/minter/MinterValue";
import {navigate} from "hookrouter";
import PokerPlayerDesk from "./PokerPlayerDesk";
import PokerPlayerCards from "./PokerPlayerCards";
import PokerBet from "./PokerBet";

export default function PokerPlay(props) {
    const [data, setData] = useState();
    const [balance, setBalance] = useState({virtual: 0, real: 0});
    const [loader, setLoader] = useState();

    useEffect(() => {
        loadData()
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

    function oneMoreTime(){
        props.store.api(`/poker/again/${data.poker.id}`)
            .then(loadData)
    }

    if (!data) return <div>Loading PokerPlay</div>
    if(data.poker.pokerAgainId) navigate(`/poker/play/${data.poker.pokerAgainId}`)
    const desk = data.poker.desk.length ? data.poker.desk : [1, 2, 3]
    const iam = props.store.authenticatedUser._id === data.poker.user.id ? 'user' : 'opponent';
    const other = iam === 'user' ? 'opponent' : 'user';

    return <div>
        <div>
            My balance: {data.poker.type === 'real' ?
            <MinterValue value={balance.real} {...props}/> : `${balance.virtual} virtual`}
        </div>


        <h1>{data.poker.type} Pokher "{data.poker.name}"</h1>
        {data.params.canJoin && <Button onClick={join}>Join game</Button>}

        {!data.poker.result && <div>Turn: {data.poker.playerTurn === props.store.authenticatedUser._id ? 'You turn' : 'Waiting for opponent'}</div>}

        <table  className="border border-success">
            <tbody>
            <tr>
                <td></td>
                <td className="p-2"><div>{data.poker.result && data.poker.opponentResult.name}</div>
                    <PokerPlayerCards bet={data.poker[`${other}Sum`]} cards={data.poker[`${other}Cards`]}/></td>
            </tr>
            <tr className="bg-success">
                <td>
                    <PokerBet bet={data.poker[`${other}Sum`]}/>
                    <PokerBet bet={data.poker.bank}/>
                    <PokerBet bet={data.poker[`${iam}Sum`]}/>
                </td>
                <td className="p-2 text-center">
                    {data.poker.round}
                    <div className="d-flex justify-content-center flex-wrap">
                        {desk.map((p, i) => <PokerCard {...p} key={i}/>)}
                    </div>
                </td>
            </tr>
            <tr>
                <td></td>
                <td className="p-2"><PokerPlayerCards bet={data.poker[`${iam}Sum`]} cards={data.poker[`${iam}Cards`]}/></td>
            </tr>
            </tbody>
        </table>
        {data.poker.result && (data.poker[`${iam}Again`] ?  <Button variant="warning">Wait opponent</Button> : <Button onClick={oneMoreTime}>One more time?</Button> )}
        <PokerPlayerDesk data={data} who={iam} loadData={loadData} balance={balance} {...props}/>

        {loader && <Loader/>}
        {data.poker.type} {data.params.role}
    </div>
}