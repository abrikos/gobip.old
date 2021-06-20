import * as images from "../RoPaSci"
import UserAvatar from "../../pages/cabinet/UserAvatar";
import "./ropasci.sass";
import React from "react";
import WinnerSign from "../WinnerSign";

export default function RoPaSci(props) {
    const {game} = props;


    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id

    function drawPlayer(p) {
        const result = game.data.turns.find(ch => ch.userId === p.id);
        const winner = !!game.winners.length && game.winners.find(w => w === p.id);
        return <div className="w-50 p-2">
            <div key={p.id} className={`${p.id === myId ? 'border-success' : ''} p-3 border w-100 d-flex justify-content-between`}>
                <div className=""><UserAvatar horizontal {...p}/></div>
                <div className="d-flex align-items-center">
                    {result && <img alt={result.turn} src={images[result.turn]} className={`choice`}/>}
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    <span>Bet: {game.stakes[p.id]}</span>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    {winner && <WinnerSign/>}
                </div>
            </div>
        </div>
    }

    return (
        <div>
            {!game.data.turns.map(t=>t.userId).includes(myId) && game.players.length > 1 ? game.players.map(p => p.id).includes(myId) && <div className="text-center">
                Make your choice:<br/>
                {game.data.variants.map(v => <span key={v} className="pointer" onClick={() => props.doTurn(v)}><img alt={v} src={images[v]} key={v} className={`choice`}/></span>)}
            </div>:<div className="text-center">Wait for opponent</div>}
            <div className="d-flex justify-content-around">
                {game.players.map(drawPlayer)}
            </div>
        </div>
    )
}