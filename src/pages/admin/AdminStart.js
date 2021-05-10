import React, {useEffect, useState} from "react";

export default function AdminStart(props) {
    const [treasures,setTreasures] = useState([])

    useEffect(()=>{
        loadTreasures()
    },[])

    function loadTreasures(){
        props.store.api('/admin/treasures').then(setTreasures)
    }

    return <div>
        <h3>Treasure</h3>
        {treasures.map(t=><div key={t.id}>{JSON.stringify(t)}</div>)}

    </div>

}
