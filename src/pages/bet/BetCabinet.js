import React from 'react';
import BetCabinetEdit from "./BetCabinetEdit";
import BetCabinetList from "./BetCabinetList";


export default function BetCabinet(props) {
    //if(!bets) return <div/>;
    return <div className="container">
        {props.id ? <BetCabinetEdit key={props.id} {...props}/> : <BetCabinetList {...props}/>}




    </div>

}

