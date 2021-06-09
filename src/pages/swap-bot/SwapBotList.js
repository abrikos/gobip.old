import {Button} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {A, navigate} from "hookrouter"

export default function SwapBotList(props) {
    const [list, setList] = useState([])


    useEffect(() => {
            loadList();
    }, [])


    function loadList() {
        props.store.api('/swapbot/list', {}, true)
            .then(setList)
    }

    function add() {
        props.store.api('/swapbot/create')
            .then(r=>navigate('/cabinet'+r.path))
    }

    return <div>

            <h1>My bots</h1>
            <Button onClick={add}>Create bot</Button>
            {list.map(l => <div key={l.id}>
                <A href={'/cabinet' + l.path} className="pointer">{l.name || l.id}</A>
            </div>)}
    </div>;
}