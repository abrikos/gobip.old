import UserAvatar from "pages/cabinet/UserAvatar";
import "./poker.sass"
import PokerCard from "./PokerCard";
import React from "react";
import GameBetForm from "../GameBetForm";

export default function Poker(props) {
    const {game, userInfo} = props;
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id
    function drawPlayer(p) {
        return <div key={p.id} className={`${p.id === myId ? 'bg-success' : ''} row`}>

            <div className="col-4">
                {game.data.hands[p.id] && game.data.hands[p.id].map((h,i)=><PokerCard {...h} key={i}/>)}
            </div>
            <div className="col-6">
                Stake: {game.stakes[p.id]}                Bet: {game.data.bets[game.data.round][p.id]}
                {game.activePlayer.id === p.id && <span> TURN</span>}
                {game.activePlayer.id === p.id && <GameBetForm userInfo={userInfo} game={game} {...props}/>}
                {!!game.winners.length && <div>{game.data.results[p.id].name}</div>}
                {game.winners.includes(p.id) && 'WINNER'}
            </div>
            <div className="col-2"><UserAvatar {...p}/></div>
        </div>
    }

    return (
        <div className='dices'>
            <div>

                {game.data.desk.map((p, i) => <PokerCard {...p} key={i}/>)}
                {game.players.map(drawPlayer)}
            </div>
        </div>
    )
}