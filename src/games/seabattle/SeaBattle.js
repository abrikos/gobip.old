import React from "react";
import GamePlayer from "../GamePlayer";
import "./seabattle.sass"

export default function SeaBattle(props){
    const {game, myId} = props;

    function cellClass({row, col}) {
        const cell = game.data.cells.find(c=>c.row===row && c.col===col)
        const pointer = game.activePlayer.id === myId && !cell.userId  ? 'pointer' : '';
        const userSign = cell.userId ? cell.userId === myId ? 'tic' : 'tac' : '';
        const win = cell.win ? cell.userId===myId ? 'win' : 'loose' : ''
        return `${userSign} ${win} ${pointer}`
    }

    return <div className="SeaBattle">
        {JSON.stringify(game.data.fleets)}
        {false && game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="battle-table">
            {game.data.cells.map((cell,i) => <div key={i} onClick={() => game.activePlayer.id === myId && !cell.userId && props.doTurn(cell)} className={cellClass(cell)}>
                <span></span>
            </div>)}
        </div>}
        <div className="d-flex justify-content-around">
            {game.players.map(p=><GamePlayer key={p.id} game={game} myId={myId} player={p}/>)}
        </div>
    </div>
}