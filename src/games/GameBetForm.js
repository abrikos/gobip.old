import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";

export default function GameBetForm(props) {
    const {userInfo, game, callBet} = props;

    const [value, setValue] = useState(callBet || game.minBet)
    const balance = userInfo[`${game.type}Balance`]

    function doBet(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        props.doTurn( form)
    }

    function doFold(e) {
        props.doTurn({bet:-1})
    }

    function doCall() {
        props.doTurn({bet: callBet})
    }

    function doCheck() {
        props.doTurn({bet: 0})
    }

    if(game.players.length < 2 || game.winners.length || !(props.store.authenticatedUser && game.activePlayer && props.store.authenticatedUser.id === game.activePlayer.id)) return <div/>
    const maxBet = game.maxBet;
    return (
        <Form onSubmit={doBet} className="bet-form">
            {/*{game.data.betActions && game.data.betActions.includes('check') && <Button onClick={doCheck}>Check</Button>}*/}
            {!maxBet && <Button onClick={doCheck} variant="success">Check</Button>}
            {!!callBet && <Button onClick={doCall} variant="success">Call&nbsp;{callBet}</Button>}
            <InputGroup>
                <InputGroup.Prepend>
                    <Button onClick={()=>setValue(value+50)} variant="secondary">+50</Button>
                </InputGroup.Prepend>
                <FormControl name="bet" value={value} onChange={e=>setValue(e.target.value * 1)} type="number" min={callBet} max={balance}/>
                <InputGroup.Append>
                    <Button type="submit" >Bet</Button>
                </InputGroup.Append>
            </InputGroup>


            {maxBet && <Button variant="danger" onClick={doFold}>Fold</Button>}
        </Form>
    )
}