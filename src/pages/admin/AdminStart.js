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

    function balances(){
        props.store.api('/admin/balances/update')
    }



    return <div>
        <Button onClick={balances}>Update balances</Button>
        <h3>Treasure</h3>
        {treasures.map(t=><div key={t.id}>{JSON.stringify(t)}</div>)}

    </div>

}
