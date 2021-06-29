import UserAvatar from "../../pages/cabinet/UserAvatar";
import "./tictactoe.sass";
import React from "react";
import WinnerSign from "../WinnerSign";
import TimeLeft from "../TimeLeft";

export default function TicTacToe(props) {
    const {game} = props;

    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id

    function drawPlayer(p) {
        if(!p) return <div/>
        const winner = !!game.winners.length && game.winners.find(w => w === p.id);
        return <div key={p.id} className="w-50 p-2">
            <div key={p.id} className="border p-3 w-100 d-flex justify-content-between">
                <div className={`border p-2 ${p.id === myId ? 'border-success' : ''}`}><UserAvatar horizontal {...p}/></div>
                <div className="d-flex align-items-center">

                </div>
                <div className="d-flex justify-content-center align-items-center">
                    {!game.finishTime && <span>Bet: {game.stakes[p.id]}</span>}
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    {!game.finishTime && game.activePlayer && game.activePlayer.id === p.id && <span>Players turn</span>}
                    {winner && <WinnerSign/>}
                </div>
            </div>
            {game.activePlayer && game.activePlayer.id !== p.id && <TimeLeft game={game} player={p}/>}
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
            {game.activePlayer && !game.reloadTimer && <div className="text-center">{game.activePlayer.id !== myId ? <div className="text-warning">Wait for opponent's turn</div>
                :
                <div className="text-danger"><TimeLeft game={game}/> Your turn</div>}</div>}
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