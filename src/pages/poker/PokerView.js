import PokerCard from "./PokerCard";
import {useEffect, useState} from "react";

export default function PokerView(props) {
    const [poker, setPoker] = useState();
    const [cards, setCards] = useState([]);
    useEffect(() => {
        loadData()
        const timer = setInterval(loadData, 5000)
        return () => clearInterval(timer);
    }, [])

    function loadData() {
        props.store.api(`/poker/view/${props.id}`).then(setPoker)
        props.store.api(`/poker/mycards/${props.id}`,{},true).then(setCards)
    }

    if (!poker) return <div>Loading</div>
    return <div>
        <h1>Pokher "{poker.name}"</h1>
        <div>
            {[0,1].map((p, i) => <PokerCard {...p} key={i}/>)}
        </div>

        {poker.desk.map((p, i) => <PokerCard {...p} key={i}/>)}

        <div>
            {[0,1].map((p, i) => <PokerCard {...p} key={i}/>)}
        </div>

    </div>
}