import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";

export default function GameBetForm(props) {
    const {userInfo, game} = props;
    const [value, setValue] = useState(game.data.minBet)
    const balance = userInfo[`${game.type}Balance`]



    function doBet(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        console.log(form)
        props.store.api(`/game/bet/${game.id}`, form)
            .then(props.onBet)
    }

    function doFold(e) {
        e.preventDefault()
        props.store.api(`/game/bet/${game.id}`, {bet:-1})
            .then(props.onBet)
    }

    function doCall() {
        props.store.api(`/game/bet/${game.id}`, {bet: game.minBet})
            .then(props.onBet)
    }

    function doCheck() {
        props.store.api(`/game/bet/${game.id}`, {bet: 0})
            .then(props.onBet)
    }

    return (
        <Form onSubmit={doBet} className="d-flex">
            {/*{game.data.betActions && game.data.betActions.includes('check') && <Button onClick={doCheck}>Check</Button>}*/}
            <Button onClick={doCall} variant="success">Call</Button>
            <InputGroup>
                <InputGroup.Prepend>
                    <Button onClick={()=>setValue(value+50)}>+50</Button>
                </InputGroup.Prepend>
                <FormControl name="bet" value={value} onChange={e=>setValue(e.target.value * 1)} type="number" min={game.data.minBet} max={balance}/>
                <InputGroup.Append>
                    <Button type="submit" >Bet</Button>
                </InputGroup.Append>
            </InputGroup>


            {/*{game.availableActions.includes('fold') && <Button variant="danger" onClick={doFold}>Fold</Button>}*/}
        </Form>
    )
}