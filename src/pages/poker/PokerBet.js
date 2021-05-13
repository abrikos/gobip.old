import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";

export default function PokerBet(props) {
    const {who, poker} = props;
    const [bet, setBet] = useState(poker.minBet)
    const balance = props.balance[poker.type]
    const showBetForm = !(poker.playerTurn !== props.store.authenticatedUser._id || poker.playerTurn !== poker[who].id)

    function doBet(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        props.store.api(`/poker/bet/${poker.id}`, form)
            .then(props.onBet)
    }

    function doCall() {
        props.store.api(`/poker/bet/${poker.id}`, {bet: poker.minBet})
            .then(props.onBet)
    }

    function doCheck() {
        props.store.api(`/poker/bet/${poker.id}`, {bet: 0})
            .then(props.onBet)
    }

    if (!poker[who]) return <div></div>

    function Action(props) {
        const {a} = props;
        if (a === 'bet') return <InputGroup>
            {!!poker.minBet && <InputGroup.Prepend>
                <Button onClick={doCall}>Call</Button>
            </InputGroup.Prepend>}
            <FormControl name="bet" type="numberX" defaultValue={5} onChange={e => setBet(e.target.value)} min={poker.minBet} max={balance}/>
            <InputGroup.Append>
                <Button type="submit">Bet</Button>
            </InputGroup.Append>
        </InputGroup>
        if (a === 'check') return <Button onClick={doCheck}>Check</Button>
        if (a === 'fold') return <Button>Fold</Button>
    }

    if(poker.result) return <span/>
    return <div>
        {JSON.stringify(poker[`${who}Bets`])}
        {poker.isCall && 'CALL'}
        {poker.bargain &&  ' - BARGAIN'}
        <div>{poker[`${who}Sum`]}</div>
        {showBetForm && <Form onSubmit={doBet} className="d-flex">
            {poker.availableActions.map(a => <Action a={a} key={a}/>)}
        </Form>}
    </div>
}