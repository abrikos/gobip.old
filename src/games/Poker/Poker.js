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
        if (game.data.hands && !game.data.hands[p.id]) game.data.hands[p.id] = [0, 0]

        const bet = game.playersBets ? game.playersBets[p.id] || 0 : 0;
        //const bet = 0;
        return <div key={p.id} className="player">
            <div className="player-wrapper">
                <div>
                    <div className="text-center">
                        <div>Bet: {bet}</div>
                        <div className="text-info">{game.blinds[p.id] && `${game.blinds[p.id]} blind`} &nbsp;</div>
                    </div>
                </div>
                <div className="d-flex">
                    {game.data.hands && game.data.hands[p.id].map((h, i) => <PokerCard {...h} key={i}/>)}
                </div>

                <div>
                    {!!game.activePlayer && game.activePlayer.id === p.id && <GameBetForm callBet={game.maxBet - bet*1} userInfo={userInfo} game={game} {...props}/>}
                    {game.players.length > 1 && !!game.activePlayer && game.activePlayer.id === p.id && <span> Player turn </span>}

                </div>
                {!!game.winners.length && <div>
                    {game.winners.includes(p.id) && <WinnerSign/>}
                    {game.data.results && <strong className="d-block">{game.data.results[p.id].name}</strong>}
                </div>}
                <div>
                    <UserAvatar {...p}/>
                    <div className="text-center">
                        Stake: {game.stakes[p.id]}
                    </div>
                </div>
            </div>
            {!!game.activePlayer && game.activePlayer.id === p.id && <TimeLeft game={game}/>}
        </div>
    }

    if (!game.data.desk.length) game.data.desk = [0, 0, 0]
    return (
        <div className='poker'>
            <div>
                <div className="iam-player">
                    {player && drawPlayer(player)}
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