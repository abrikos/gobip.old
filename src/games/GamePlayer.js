import UserAvatar from "../pages/cabinet/UserAvatar";
import WinnerSign from "./WinnerSign";
import TimeLeft from "./TimeLeft";
import React from "react";

export default function GamePlayer(props){
    const {game, myId, player} = props;
    if(!player) return <div/>
    const winner = !!game.winners.length && game.winners.find(w => w === player.id);
    return <div key={player.id} className="w-50 p-2">
        <div key={player.id} className="border p-3 w-100 d-flex justify-content-between">
            <div className={`border p-2 ${player.id === myId ? 'border-success' : ''}`}><UserAvatar horizontal {...player}/></div>
            <div className="d-flex align-items-center">

            </div>
            <div className="d-flex justify-content-center align-items-center">
                {!game.finishTime && <span>Bet: {game.stakes[player.id]}</span>}
            </div>
            <div className="d-flex justify-content-center align-items-center">
                {!game.finishTime && game.activePlayer && game.activePlayer.id === player.id && <span>Players turn</span>}
                {winner && <WinnerSign/>}
            </div>
        </div>
        {game.activePlayer && game.activePlayer.id !== player.id && <TimeLeft game={game} player={player}/>}
    </div>
}