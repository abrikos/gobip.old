import {useEffect, useState} from "react";
import RoPaSci from "./RoPaSci/RoPaSci";
import Reversi from "./Reversi/Reversi";
import Dices from "./Dices/Dices";
import GameUserInfo from "./GameUserInfo";
import GameBetForm from "./GameBetForm";
import Poker from "./Poker/Poker";

export default function GamePlay(props){
    const [game,setGame] = useState()
    const [userInfo,setUserInfo] = useState({})

    useEffect(() => {
        loadGame();
        const timer = setInterval(loadGame, 10000)
        return () => clearInterval(timer);
    }, [])

    function loadGame(){
        props.store.api(`/game/play/${props.id}`,{},true)
            .then(setGame)
        props.store.api('/game/cabinet/user/info', {}, true)
            .then(setUserInfo)
    }

    if(!game) return <div/>
    //game.player = game.players.find(p=>props.store.authenticatedUser && p.id===props.store.authenticatedUser.id)
    return(
        <div>
            <h1>PLAY {game.type} {game.module} "{game.name}"</h1>
            <GameUserInfo userInfo={userInfo} type={game.type} {...props}/>
            <hr/>
            {game.module === 'RoPaSci' && <RoPaSci game={game} {...props}/>}
            {game.module === 'Reversi' && <Reversi game={game} {...props}/>}
            {game.module === 'Dices' && <Dices game={game} {...props}/>}
            {game.module === 'Poker' && <Poker game={game} {...props}/>}
            {props.store.authenticatedUser && props.store.authenticatedUser.id === game.activePlayer.id &&  <GameBetForm userInfo={userInfo} game={game} {...props}/>}
        </div>
    )
}