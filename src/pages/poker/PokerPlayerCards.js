import PokerCard from "./PokerCard";
import React from "react";
import PokerBet from "./PokerBet";

export default function PokerPlayerCards(props){
    const {cards, bet} = props;
    return(
        <div className="d-flex align-items-center">
            {cards.map((p, i) => <PokerCard {...p} key={i}/>)}
        </div>
    )
}