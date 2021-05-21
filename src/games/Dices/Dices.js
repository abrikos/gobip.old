import UserAvatar from "../../pages/cabinet/UserAvatar";
import Dice from "./Dice";
import "./dices.sass"

export default function Dices(props) {
    const {game} = props;
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id
    function drawPlayer(p) {
        return <div key={p.id} className={`${p.id === myId ? 'bg-success' : ''} row`}>
            <div className="col-2"><UserAvatar {...p}/></div>
            <div className="col-2">
                {game.data.hands[p.id] && game.data.hands[p.id].map((h,i)=><Dice value={h} key={i}/>)}
            </div>
            <div className="col-8">
                Stake: {game.stakes[p.id]}                Bet: {game.data.bets[game.data.round][p.id]}
                {game.activePlayer.id === p.id && <span> TURN</span>}
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