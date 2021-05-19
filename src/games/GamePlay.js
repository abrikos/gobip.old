import {useEffect, useState} from "react";
import RoPaSci from "./RoPaSci/RoPaSci";
import Reversi from "./Reversi/Reversi";
import Dices from "./Dices/Dices";

export default function GamePlay(props){
    const [game,setGame] = useState()

    useEffect(() => {
        loadGame();
        const timer = setInterval(loadGame, 2000)
        return () => clearInterval(timer);
    }, [])

    function loadGame(){
        props.store.api(`/game/play/${props.id}`,{},true)
            .then(setGame)
    }

    if(!game) return <div/>
    //game.player = game.players.find(p=>props.store.authenticatedUser && p.id===props.store.authenticatedUser.id)
    return(
        <div>
            <h1>PLAY {game.type} {game.module} "{game.name}"</h1>
            <hr/>
            {game.module === 'RoPaSci' && <RoPaSci game={game} {...props}/>}
            {game.module === 'Reversi' && <Reversi game={game} {...props}/>}
            {game.module === 'Dices' && <Dices game={game} {...props}/>}
        </div>
    )
}