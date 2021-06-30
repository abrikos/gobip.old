import * as dices from "../Dices"

export default function Dice(props){
    return <img src={dices[`d${props.value}`]} alt={`value ${props.value}`} className="dice"/>
}