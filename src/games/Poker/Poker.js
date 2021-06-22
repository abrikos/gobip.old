import UserAvatar from "pages/cabinet/UserAvatar";
import "./poker.sass"
import PokerCard from "./PokerCard";
import React from "react";
import GameBetForm from "../GameBetForm";
import WinnerSign from "../WinnerSign";
import Loader from "../../components/Loader";
import TimeLeft from "../TimeLeft";

export default function Poker(props) {
    const {game, userInfo} = props;
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id
    const player = game.players.find(p => p.id === myId);
    const players = game.players.filter(p => p.id !== myId);

    function drawPlayer(p) {
        if (!p) return <div></div>
        if (game.data.hands && !game.data.hands[p.id]) game.data.hands[p.id] = [0, 0]
        return <div key={p.id} className="player">
            <div className="player-wrapper">
                <div><UserAvatar {...p}/></div>
                <div className="text-center">
                    {game.data.hands && game.data.hands[p.id].map((h, i) => <PokerCard {...h} key={i}/>)}
                </div>
                <div className="text-center">
                    Stake: {game.stakes[p.id]}
                    {game.data.bets[game.data.round][p.id] && <div>Bet: {game.data.bets[game.data.round][p.id]}</div>}
                </div>

                <div>
                    {!!game.activePlayer && game.activePlayer.id === p.id && <GameBetForm callBet={game.maxBet - game.data.bets[game.data.round][p.id]} userInfo={userInfo} game={game} {...props}/>}
                    {game.players.length > 1 && !!game.activePlayer && game.activePlayer.id === p.id && <span> Player turn </span>}

                </div>
                {!!game.winners.length && <div>
                    {game.winners.includes(p.id) && <WinnerSign/>}
                    {game.data.results && <strong className="d-block">{game.data.results[p.id].name}</strong>}
                </div>}
            </div>
            {!!game.activePlayer && game.activePlayer.id === player.id && <TimeLeft game={game}/>}
        </div>
    }

    if (!game.data.desk.length) game.data.desk = [0, 0, 0]
    return (
        <div className='poker'>
            <div>
                <div className="iam-player">
                    {drawPlayer(player)}
                </div>
                {game.data.desk.map((p, i) => <PokerCard {...p} key={i}/>)}
                <div className="other-players">
                    {players.map(drawPlayer)}
                </div>

            </div>
            {/*<GameBetForm userInfo={userInfo} game={game} {...props}/>*/}
        </div>
    )
}