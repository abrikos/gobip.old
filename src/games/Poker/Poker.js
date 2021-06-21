import UserAvatar from "pages/cabinet/UserAvatar";
import "./poker.sass"
import PokerCard from "./PokerCard";
import React from "react";
import GameBetForm from "../GameBetForm";
import WinnerSign from "../WinnerSign";

export default function Poker(props) {
    const {game, userInfo} = props;
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id
    function drawPlayer(p) {
        //return <div>{p.id}</div>
        if(!game.data.hands[p.id]) game.data.hands[p.id] = [0,0]
        return <div key={p.id} className="row">

            <div className={`${p.id === myId ? 'bg-success' : ''} col-4`}>
                {game.data.hands[p.id].map((h,i)=><PokerCard {...h} key={i}/>)}
            </div>
            <div className="col-6">
                Bet: {game.data.bets[game.data.round][p.id]}
                {!!game.activePlayer && game.activePlayer.id === p.id && <GameBetForm callBet={game.maxBet - game.data.bets[game.data.round][p.id]} userInfo={userInfo} game={game} {...props}/>}
                {!!game.activePlayer && game.activePlayer.id === p.id && <div> Player turn {game.timeLeft && <div>Time left: {game.timeLeft}</div>}</div>}
                {!!game.winners.length && game.data.results && <strong className="d-block">{game.data.results[p.id].name}</strong>}
                {game.winners.includes(p.id) && <WinnerSign/>}
            </div>
            <div className="col-2"><UserAvatar {...p}/> Stake: {game.stakes[p.id]}</div>
        </div>
    }
    if(!game.data.desk.length) game.data.desk = [0,0,0]
    return (
        <div className='dices'>
            <div>
                {game.data.desk.map((p, i) => <PokerCard {...p} key={i}/>)}
                {game.players.map(drawPlayer)}
            </div>
            {/*<GameBetForm userInfo={userInfo} game={game} {...props}/>*/}
        </div>
    )
}