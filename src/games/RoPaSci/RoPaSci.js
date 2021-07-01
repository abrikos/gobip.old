import * as images from "../RoPaSci"
import UserAvatar from "../../pages/cabinet/UserAvatar";
import "./ropasci.sass";
import React from "react";
import WinnerSign from "../WinnerSign";
import GamePlayer from "../GamePlayer";

export default function RoPaSci(props) {
    const {game, myId} = props;
    const iam = game.players.find(p => p.id === myId);
    const opponent = game.players.find(p => p.id !== myId);

    function drawPlayer(p) {
        if(!p) return <span/>
        const result = game.data.turns.find(ch => ch.userId === p.id);
        const winner = !!game.winners.length && game.winners.find(w => w === p.id);
        return <div className="" key={p.id}>
                <div className="d-flex align-items-center">
                    {result && <img alt={result.turn} src={images[result.turn]} className={`choice`}/>}
                </div>
        </div>
    }

    return (
        <div>
            {!game.data.turns.map(t => t.userId).includes(myId) && game.players.length > 1 ? game.players.map(p => p.id).includes(myId) && <div className="text-center">
                Make your choice:<br/>
                {game.data.variants.map(v => <span key={v} className="pointer" onClick={() => props.doTurn(v)}><img alt={v} src={images[v]} key={v} className={`choice`}/></span>)}
            </div>
                :
                !game.reloadTimer && <div className="text-center">Wait for opponent</div>}
            <div className="d-flex justify-content-around">
                <div className="w-100">

                    <GamePlayer game={game} myId={myId} player={iam}/>
                    {drawPlayer(iam)}
                </div>
                <div className="w-100">

                    <GamePlayer game={game} player={opponent}/>
                    {drawPlayer(opponent)}
                </div>
            </div>
        </div>
    )
}