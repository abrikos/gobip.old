import UserAvatar from "../../pages/cabinet/UserAvatar";
import "./tictactoe.sass";
import React from "react";
import WinnerSign from "../WinnerSign";

export default function TicTacToe(props) {
    const {game} = props;
    const cols = Array.from({length: game.data.cols}, (v, i) => i);
    const rows = Array.from({length: game.data.rows}, (v, i) => i);

    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id

    function drawPlayer(p) {
        const winner = !!game.winners.length && game.winners.find(w => w === p.id);
        return <div key={p.id} className="w-50 p-2">
            <div key={p.id} className={`${p.id === myId ? 'border-success' : ''} p-3 border w-100 d-flex justify-content-between`}>
                <div className=""><UserAvatar horizontal {...p}/></div>
                <div className="d-flex align-items-center">

                </div>
                <div className="d-flex justify-content-center align-items-center">
                    {!game.finishTime && <span>Bet: {game.stakes[p.id]}</span>}
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    {!game.finishTime && game.activePlayer && game.activePlayer.id === p.id && <span>Players turn {!!game.timeLeft && <div>Time left: {game.timeLeft}</div>} </span>}
                    {winner && <WinnerSign/>}
                </div>
            </div>
        </div>
    }

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
            {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <div className="tictac-table">
                {game.data.cells.map((cell,i) => <div key={i} onClick={() => game.activePlayer.id === myId && !cell.userId && props.doTurn(cell)} className={cellClass(cell)}>
                    <span></span>
                </div>)}
            </div>}
            <div className="d-flex justify-content-around">
                {game.players.map(drawPlayer)}
            </div>
        </div>
    )
}