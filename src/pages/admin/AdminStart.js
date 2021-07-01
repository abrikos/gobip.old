import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";

export default function AdminStart(props) {
    const [treasures,setTreasures] = useState([])
    const [main,setMain] = useState()

    useEffect(()=>{
        init();
        const timer = setInterval(init, 5000)
        return () => clearInterval(timer);
    },[])

    function init(){
        props.store.api('/admin/main/balance',{}, true).then(setMain)
        props.store.api('/admin/treasures',{}, true).then(setTreasures)
    }


    function balances(){
        props.store.api('/admin/balances/update')
    }


    if(!main) return <div/>
    return <div>
        <Button onClick={balances}>Update balances</Button>
        <h3>Available balance</h3>
        <table className="table">
            <tbody>
            <tr>
                <td>Balance</td>
                <th>{main.balance.toLocaleString('ru')}</th>
            </tr>
            <tr>
                <td>Available</td>
                <th>{main.available.toLocaleString('ru')}</th>
            </tr>
            <tr>
                <td>Users reserved</td>
                <th>{(main.balance - main.available).toLocaleString('ru')}</th>
            </tr>
            </tbody>
        </table>
        <h3>Treasure</h3>
        {treasures.map(t=><div key={t.id}>{JSON.stringify(t)}</div>)}

    </div>

}
