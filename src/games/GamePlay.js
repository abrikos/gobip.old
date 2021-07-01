import React, {useEffect, useState} from "react";
import RoPaSci from "./RoPaSci/RoPaSci";
import Reversi from "./Reversi/Reversi";
import GameUserInfo from "./GameUserInfo";
import Poker from "./Poker/Poker";
import UserAvatar from "../pages/cabinet/UserAvatar";
import {Button} from "react-bootstrap";
import {A, navigate} from "hookrouter";
import TicTacToe from "./TicTacToe/TicTacToe";
import ReferralProgram from "../pages/cabinet/ReferralProgram";
import "./games.sass"
import SeaBattle from "./seabattle/SeaBattle";
import * as Icon from "./icons";

export default function GamePlay(props) {
    const [error, setError] = useState({})
    const [game, setGame] = useState()

    useEffect(() => {
        loadGame();
        const timer = setInterval(loadGame, 1000)
        return () => clearInterval(timer);
    }, [])

    function loadGame() {
        props.store.api(`/game/play/${props.id}`, {}, true)
            .then(g => {
                if (!g) return navigate(`/games/${props.module}`)
                setGame(g);
            })
    }

    function doTurn(turn) {
        props.store.api(`/game/turn/${game.id}`, {turn})
            .then(loadGame)
            .catch(setError)
    }


    function doLeave() {
        props.store.api(`/game/leave/${game.id}`)
            .then(loadGame)
        /*props.store.api(`/game/can-leave/${game.id}`)
            .then(r=>{
                if(r.canLeave) {
                    props.store.api(`/game/leave/${game.id}`)
                }else{
                    setError({message:'You cant leave the game now'})
                }
            })*/
    }

    function doJoin() {
        props.store.api(`/game/join/${game.id}`)
            .then(loadGame)
    }

    if (!game) return <div/>
    if (!game.id) return navigate(`/games/${props.module}`)
    //game.player = game.players.find(p=>props.store.authenticatedUser && p.id===props.store.authenticatedUser.id)
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id;
    return (
        <div className="games">
            <ReferralProgram redirect={game.link} {...props}/>
            <small className="float-right">{game.type} "{game.moduleHuman}"</small>
            <h1><img src={Icon[game.module]} className="game-icon" alt={game.module}/> {game.name}</h1>
            <A href={`/games/${game.module}`}>&lt; Back to list </A>
            {props.store.authenticatedUser && <GameUserInfo type={game.type} {...props}/>}
            <hr/>
            <small className="d-block text-center">{game.description}</small>
            {!!game.reloadTimer && <div style={{height: 10, background: `linear-gradient(90deg, rgba(0,255,0,.8), rgba(0,255,0,0) ${game.reloadTimer}%)`}}></div>}
            {error.message && <div className="alert alert-danger">{error.message}</div>}
            {game.module === 'RoPaSci' && <RoPaSci game={game} myId={myId} doTurn={doTurn} {...props}/>}
            {game.module === 'Reversi' && <Reversi game={game} myId={myId} doTurn={doTurn} {...props}/>}
            {game.module === 'Poker' && <Poker game={game} myId={myId} doTurn={doTurn} {...props}/>}
            {game.module === 'TicTacToe' && <TicTacToe game={game} myId={myId} doTurn={doTurn} {...props}/>}
            {game.module === 'SeaBattle' && <SeaBattle game={game} myId={myId} doTurn={doTurn} {...props}/>}
            {props.store.authenticatedUser && <div>
                {game.players.map(g => g.id).includes(props.store.authenticatedUser.id) || game.waitList.map(g => g.id).includes(props.store.authenticatedUser.id) ?
                    <Button variant="warning" onClick={doLeave}>Leave</Button>
                    :
                    <Button onClick={doJoin}>Join</Button>}
            </div>}
            {!!game.waitList.length && <div>
                <h3 className="text-center">Wait list</h3>
                {game.waitList.map(p => <UserAvatar key={p.id} {...p}/>)}
            </div>}
        </div>
    )
}