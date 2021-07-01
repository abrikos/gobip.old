import "./tictactoe.sass";
import React from "react";
import TimeLeft from "../TimeLeft";
import GamePlayer from "../GamePlayer";

export default function TicTacToe(props) {
    const {game, myId} = props;
    const iam = game.players.find(p => p.id === myId);
    const opponent = game.players.find(p => p.id !== myId);
    const cells = Array.from({length: game.data.rows * game.data.cols}, (v, id) => {
        return {id, col: id % game.data.rows, row: Math.ceil((id + 1) / game.data.rows) - 1}
    })

    function cellClass({row, col}) {
        if (!game.data.cells) return '';
        const cell = game.data.cells.find(c => c.row === row && c.col === col)
        const pointer = game.activePlayer.id === myId && !cell.userId ? 'pointer' : '';
        const userSign = cell.userId ? cell.userId === myId ? 'tic' : 'tac' : '';
        const win = cell.win ? cell.userId === myId ? 'win' : 'loose' : ''
        return `${userSign} ${win} ${pointer}`
    }

    return (
        <div className="TicTacToe">
            {/*{JSON.stringify(game.data.cells)}*/}
            {game.activePlayer && !game.reloadTimer &&
            <div className="text-center">{game.activePlayer.id !== myId ? <div className="text-warning">Wait for opponent's turn</div>
                :
                <div className="text-danger"><TimeLeft game={game}/> Your turn</div>}</div>}
            {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="tictac-table">
                {game.data.cells.map((cell, i) => <div key={i} onClick={() => game.activePlayer.id === myId && !cell.userId && props.doTurn(cell)}
                                             className={cellClass(cell)}>
                    <span></span>
                </div>)}
            </div>}

            <div className="d-flex justify-content-around">
                <div className="w-100">
                    <GamePlayer game={game} myId={myId} player={iam}/>
                </div>
                <div className="w-100">
                    <GamePlayer game={game} player={opponent}/>
                </div>
            </div>
        </div>
    )
}