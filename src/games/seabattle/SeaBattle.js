import React from "react";
import GamePlayer from "../GamePlayer";
import "./seabattle.sass"

export default function SeaBattle(props) {
    const {game, myId} = props;
    const cells = Array.from({length: game.data.rows * game.data.cols}, (v, id) => {
        return {id, col: id % game.data.rows, row: Math.ceil((id + 1) / game.data.rows) - 1}
    })


    function DrawCell(cell) {
        const ship = game.data.fleets[myId].find(c => c.id === cell.id && c.shipLength);
        const border = game.data.fleets[myId].find(c => c.id === cell.id && c.border);
        return <div className={`${border ? 'border' : ''} ${ship ? 'ship' + ship.shipLength : ''}`}>
            {ship && ship.shipLength}
        </div>
    }

    return <div className="SeaBattle">
        {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="battle-table">
            {/*{game.data.cells.map((cell, i) => <div key={i} onClick={() => game.activePlayer.id === myId && !cell.userId && props.doTurn(cell)}
                                                   className={cellClass(cell)}>
                <span></span>
            </div>)}*/}
            {cells.map((cell, i) => <DrawCell key={i} {...cell}/>)}
        </div>}
        <div className="d-flex justify-content-around">
            {game.players.map(p => <GamePlayer key={p.id} game={game} myId={myId} player={p}/>)}
        </div>
    </div>
}