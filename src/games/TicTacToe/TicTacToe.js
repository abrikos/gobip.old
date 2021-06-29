import "./tictactoe.sass";
import React from "react";
import TimeLeft from "../TimeLeft";
import GamePlayer from "../GamePlayer";

export default function TicTacToe(props) {
    const {game, myId} = props;

    function cellClass({row, col}) {
        const cell = game.data.cells.find(c=>c.row===row && c.col===col)
        const pointer = game.activePlayer.id === myId && !cell.userId  ? 'pointer' : '';
        const userSign = cell.userId ? cell.userId === myId ? 'tic' : 'tac' : '';
        const win = cell.win ? cell.userId===myId ? 'win' : 'loose' : ''
        return `${userSign} ${win} ${pointer}`
    }

    return (
        <div className="TicTacToe">
            {/*{JSON.stringify(game.data.cells)}*/}
            {game.activePlayer && !game.reloadTimer && <div className="text-center">{game.activePlayer.id !== myId ? <div className="text-warning">Wait for opponent's turn</div>
                :
                <div className="text-danger"><TimeLeft game={game}/> Your turn</div>}</div>}
            {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="tictac-table">
                {game.data.cells.map((cell,i) => <div key={i} onClick={() => game.activePlayer.id === myId && !cell.userId && props.doTurn(cell)} className={cellClass(cell)}>
                    <span></span>
                </div>)}
            </div>}
            <div className="d-flex justify-content-around">
                {game.players.map(p=><GamePlayer key={p.id} game={game} myId={myId} player={p}/>)}
            </div>
        </div>
    )
}