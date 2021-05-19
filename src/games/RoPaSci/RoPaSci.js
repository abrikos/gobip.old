import * as images from "../RoPaSci"
import UserAvatar from "../../pages/cabinet/UserAvatar";
import "./ropasci.sass";

export default function RoPaSci(props) {
    const {game} = props;
    const myId = props.store.authenticatedUser && props.store.authenticatedUser.id
    function drawPlayer(p) {
        const result = game.data.choices.find(ch => ch.userId === p.id)
        return <div key={p.id} className={`${p.id === myId ? 'bg-success' : ''} row`}>
            <div className="col"><UserAvatar {...p}/></div>
            <div className="col">
                {game.data.variants.map(v => <img src={images[v]} key={v} className={`choice ${result && result.choice === v?'selected':''}`}/>)}
            </div>
        </div>
    }

    return (
        <div>

            <hr/>
            <div>
                {game.players.map(drawPlayer)}
            </div>

            Rock Paper Scissors "{game.name}"

        </div>
    )
}