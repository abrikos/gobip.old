import React from "react";

export default function TimeLeft(props){
    const {game, player} = props
    return game.players.length>1 && game.timeLeft > 0 && <div style={{color:'white', background:`linear-gradient(90deg, rgba(255,0,0), rgba(255,0,0,0) ${game.timeLeft}%)`}}>{game.timeLeft.toFixed(0)}%</div>
}