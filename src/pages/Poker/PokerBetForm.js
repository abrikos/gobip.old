import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";

export default function PokerBetForm(props) {
    const {who, poker} = props;
    const [value, setValue] = useState(poker.minBet || poker.blind)
    const balance = props.balance[poker.type]



    function doBet(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        props.store.api(`/poker/bet/${poker.id}`, form)
            .then(props.onBet)
    }

    function doFold(e) {
        e.preventDefault()
        props.store.api(`/poker/bet/${poker.id}`, {bet:-1})
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

    if (!poker[who]) return <div>no who</div>


    if (poker.result) return <span>bet done</span>

    return (
        <Form onSubmit={doBet} className="d-flex">

            {poker.availableActions.includes('check') && <Button onClick={doCheck}>Check</Button>}
            {!!poker.minBet &&<Button onClick={doCall} variant="success">Call</Button>}
            <InputGroup>
                 <InputGroup.Prepend>
                     <Button onClick={()=>setValue(value+50)}>+50</Button>
                </InputGroup.Prepend>
                <FormControl name="bet" value={value} onChange={e=>setValue(e.target.value * 1)} type="number" min={value} max={balance}/>
                <InputGroup.Append>
                    <Button type="submit" >Bet</Button>
                </InputGroup.Append>
            </InputGroup>


            {poker.availableActions.includes('fold') && <Button variant="danger" onClick={doFold}>Fold</Button>}
        </Form>
    )
}