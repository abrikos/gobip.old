import UserAvatar from "../../pages/cabinet/UserAvatar";
import Dice from "./Dice";
import "./dices.sass"

export default function Dices(props) {
    const {game} = props;
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id
    function drawPlayer(p) {
        const hand = game.data.hands.find(ch => ch.userId === p.id)
        return <div key={p.id} className={`${p.id === myId ? 'bg-success' : ''} row`}>
            <div className="col"><UserAvatar {...p}/></div>
            <div className="col">
                {hand && hand.dices.map(h=><Dice value={h} key={h}/>)}
            </div>
        </div>
    }

    return (
        <div className='dices'>
            <div>
                {game.players.map(drawPlayer)}
            </div>
        </div>
    )
}