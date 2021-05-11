import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";

export default function AdminStart(props) {
    const [treasures,setTreasures] = useState([])

    useEffect(()=>{
        loadTreasures()
    },[])

    function loadTreasures(){
        props.store.api('/admin/treasures').then(setTreasures)
    }

    function unbound(){
        props.store.api('/admin/migrate/unbound')
    }



    return <div>
        <Button onClick={unbound}>Migrate unbound</Button>
        <h3>Treasure</h3>
        {treasures.map(t=><div key={t.id}>{JSON.stringify(t)}</div>)}

    </div>

}
