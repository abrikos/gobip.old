import {useEffect, useState} from "react";

export default function PairPrice(props){
    const [price, setPrice] = useState({});
    useEffect(()=>{
        props.pair && props.store.api(`/bet/price/${props.pair}`).then(setPrice)
    },[])

    return <strong>
        {price.pair} {price.valueHuman}
    </strong>
}