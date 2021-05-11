import {useEffect, useState} from "react";
import {A} from "hookrouter"
import "./poker.sass"

export default function PokerListCabinet(props) {
    const [pokers, setPokers] = useState([])
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        loadData()
        const timer = setInterval(loadData, 5000)
        return () => clearInterval(timer);
    }, [])

    function loadData() {
        props.store.api('/poker/list', {}, true).then(setPokers)
    }

    function checkIsPlayer(p) {
        const u = props.store.authenticatedUser;
        if (!u) return false;
        return [p.user, p.owner].includes(u.id)
    }

    return <div>
        <h1>Pokher games</h1>

        <div className="columns">
            {pokers.map(p => <div key={p.id}><A href={`/poker/${checkIsPlayer(p) ? 'play' : 'view'}/${p.id}`}>{p.date} {p.name}</A></div>)}

        </div>
    </div>
}