import React from "react";
import GamePlayer from "../GamePlayer";
import "./seabattle.sass"

export default function SeaBattle(props) {
    const {game, myId} = props;
    const myFleet = game.data.fields && game.data.fields.my;
    const otherFleet = game.data.fields && game.data.fields.other;
    const myTurn = game.activePlayer.id === myId;

    function click(cell) {
        if (!myTurn || cell.pointer || cell.hit || cell.miss || cell.near) return;
        props.doTurn(cell.id)
    }

    function className(cell) {
        const pointer = cell.click && myTurn ? 'pointer ' : '';
        if (cell.shipSize && !cell.hit && !cell.sunk) return pointer + 'ship' + cell.shipSize;
        if (cell.near) return 'near';
        if (cell.miss) return 'miss';
        if (cell.sunk) return 'sunk';
        if (cell.hit) return 'hit';
        return pointer
    }

    function DrawCell(cell) {
        return <div className={className(cell)} onClick={() => click(cell)}>
            {cell.id}
        </div>
    }

    return <div className="SeaBattle">
        {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="d-flex">
            <div className="battle-table">
                {myFleet && myFleet.map((cell, i) => <DrawCell key={i} {...cell}/>)}
            </div>
            <div className="battle-table">
                {otherFleet && otherFleet.map((cell, i) => <DrawCell key={i} click {...cell}/>)}
            </div>
        </div>}
        <div className="d-flex justify-content-around">
            <GamePlayer game={game} myId={myId} player={game.players.find(p => p.id === myId)}/>
            <GamePlayer game={game} player={game.players.find(p => p.id !== myId)}/>
        </div>
    </div>
}