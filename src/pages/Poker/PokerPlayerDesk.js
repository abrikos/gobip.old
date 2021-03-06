import PokerBetForm from "./PokerBetForm";
import React from "react";

export default function PokerPlayerDesk(props) {
    const {data, loadData, balance, who} = props;
    const showBetForm = data.poker.playerTurn === props.store.authenticatedUser._id;
    return <div>
        <div className="d-flex">
            {showBetForm && <PokerBetForm who={who} {...data} {...props} balance={balance} onBet={loadData}/>}
        </div>
    </div>
}