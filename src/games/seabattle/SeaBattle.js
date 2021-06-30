import React from "react";
import GamePlayer from "../GamePlayer";
import "./seabattle.sass"
import {Button} from "react-bootstrap";

export default function SeaBattle(props) {
    const {game, myId} = props;
    const myFleet = game.data.fields && game.data.fields.my;
    const otherFleet = game.data.fields && game.data.fields.other;


    function DrawCell(cell) {
        return <div className={`${cell.border ? 'border' : ''} ${cell.shipSize ? 'ship' + cell.shipSize : ''} ${cell.free?'free':''}`}>
            {cell.row},{cell.col}
        </div>
    }

    return <div className="SeaBattle">
        {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="d-flex">
            <div className="battle-table">
                {myFleet && myFleet.map((cell, i) => <DrawCell key={i} {...cell}/>)}
            </div>
            <div className="battle-table">
                {otherFleet && otherFleet.map((cell, i) => <DrawCell key={i} {...cell}/>)}
            </div>
        </div>}
        <div className="d-flex justify-content-around">
            <GamePlayer game={game} myId={myId} player={game.players.find(p => p.id === myId)}/>
            <GamePlayer game={game} player={game.players.find(p => p.id !== myId)}/>
        </div>
    </div>
}