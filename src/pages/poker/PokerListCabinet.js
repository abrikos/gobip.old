import {Button} from "react-bootstrap";
import {useEffect, useState} from "react";
import {A, navigate} from "hookrouter"
import Loader from "../../components/Loader";

export default function PokerListCabinet(props) {
    const [pokers, setPokers] = useState([])
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        loadData()
        const timer = setInterval(loadData, 5000)
        return () => clearInterval(timer);
    }, [])

    function loadData() {
        props.store.api('/poker/user/list', {}, true).then(setPokers)
    }

    function create() {
        setLoader(true)
        props.store.api('/poker/game/start')
            .then(r => {
                navigate(`/poker/${r.id}`)
                setLoader(false)

                //loadData()
            })
    }


    return <div>
        <h1>My Pokher games</h1>
        <Button onClick={create}>{loader ? <Loader/> : 'Create game'}</Button>
        <div className="columns">
        {pokers.map(p => <div key={p.id}><A href={`/poker/play/${p.id}`}>{p.date} {p.name}</A></div>)}
        </div>
    </div>
}