import * as Cards from "../../pages/Poker/cards";
import React from "react";

export default function PokerCard(props) {
    const name= props.suit ? props.suit + props.value : 'cover';
    return <img className="poker-card" src={Cards[name]} alt={name} title={name}/>
}
