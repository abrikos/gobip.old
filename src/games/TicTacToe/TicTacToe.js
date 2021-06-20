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
                    <span>Bet: {game.stakes[p.id]}</span>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                    {!winner && game.activePlayer && game.activePlayer.id === p.id && <span>Players turn {!!game.timeLeft && <div>Time left: {game.timeLeft}</div>} </span>}
                    {winner && <WinnerSign/>}
                </div>
            </div>
        </div>
    }

    function drawCell(row, col) {
        return game.data.cells[getId(row,col)].userId ? game.data.cells[getId(row,col)].userId === myId ? 'tic' : 'tac' : '';
    }

    function getId(row,col){
        return game.data.rows * row + col;
    }

    function check(uid) {
        const vectors = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]
        //for (const cell of game.data.cells) {
        const cell = {id:12}
            for(const vector of vectors){
                const ids = []
                for(let i=0; i<game.data.winRows; i++){
                    const id = cell.id + vector[0]*i + game.data.cols * vector[1]*i;
                    game.data.cells[id].userId = '60a50ba09dedcc17ececb5aa'
                    ids.push(id)
                }
                console.log(ids)
            }
        //}
    }


    check()

    return (
        <div className="TicTacToe">
            {JSON.stringify(game.data.cells)}
            {game.players.length > 1 && game.players.map(p => p.id).includes(myId) && <table className={game.activePlayer.id === myId ? 'pointer' : ''}>
                <tbody>
                {rows.map(row => <tr key={row}>
                    {cols.map(col => <td key={col} onClick={() => props.doTurn({row, col})} className={drawCell(row, col)}>
                    </td>)}
                </tr>)}
                </tbody>
            </table>}
            <div className="d-flex justify-content-around">
                {game.players.map(drawPlayer)}
            </div>
        </div>
    )
}