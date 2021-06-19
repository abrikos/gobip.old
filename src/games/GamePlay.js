import React, {useEffect, useState} from "react";
import RoPaSci from "./RoPaSci/RoPaSci";
import Reversi from "./Reversi/Reversi";
import Dices from "./Dices/Dices";
import GameUserInfo from "./GameUserInfo";
import GameBetForm from "./GameBetForm";
import Poker from "./Poker/Poker";
import UserAvatar from "../pages/cabinet/UserAvatar";
import {Button} from "react-bootstrap";

export default function GamePlay(props){
    const [game,setGame] = useState()
    const [userInfo,setUserInfo] = useState({})

    useEffect(() => {
        loadGame();
        const timer = setInterval(loadGame, 1000)
        return () => clearInterval(timer);
    }, [])

    function loadGame(){
        props.store.api(`/game/play/${props.id}`,{},true)
            .then(setGame)
    }

    function doLeave(){
        props.store.api(`/game/leave/${game.id}`)
    }

    function doJoin(){
        props.store.api(`/game/join/${game.id}`)
            .then(loadGame)
    }

    if(!game) return <div/>
    //game.player = game.players.find(p=>props.store.authenticatedUser && p.id===props.store.authenticatedUser.id)
    return(
        <div>
            <h1>PLAY {game.type} {game.module} "{game.name}"</h1>
            <GameUserInfo type={game.type} {...props}/>
            <hr/>
            {game.module === 'RoPaSci' && <RoPaSci game={game} userInfo={userInfo} onBet={loadGame} {...props}/>}
            {game.module === 'Reversi' && <Reversi game={game} userInfo={userInfo} onBet={loadGame} {...props}/>}
            {game.module === 'Dices' && <Dices game={game} userInfo={userInfo} onBet={loadGame} {...props}/>}
            {game.module === 'Poker' && <Poker game={game} userInfo={userInfo} onBet={loadGame} {...props}/>}
            <GameBetForm userInfo={userInfo} game={game} {...props}/>
            {props.store.authenticatedUser && <div>
                {game.players.map(g=>g.id).includes(props.store.authenticatedUser.id) ? <Button variant="warning" onClick={doLeave}>Leave</Button> : <Button onClick={doJoin}>Join</Button>}
            </div>}
            {!!game.waitList.length && <div>Wait list
                {game.waitList.map(p => <UserAvatar key={p.id} {...p}/>)}
            </div>}
        </div>
    )
}