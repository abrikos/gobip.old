import {Button} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import InputButtonLoading from "../../components/InputButtonLoading";
import LoginFormGoogle from "../../components/login/LoginFormGoogle";
import {navigate} from "hookrouter";
import {MinterTxLink} from "../../components/minter/MinterLink";

export default function SwapRoutes(props){
    const [step,setStep] =useState(0)
    const [route,setRoute] =useState()
    const [transactions,setTrensactions] =useState([])

    useEffect(()=>{
        if(props.store.authenticatedUser && route){
            routeDone(route)
        }
        props.store.api('/swap-route/transactions')
            .then(setTrensactions)
    },[props.store.authenticatedUser])

    function routeDone(r){
        setRoute(r)
        if(props.store.authenticatedUser){
            navigate('/cabinet/swaproutes')
        }else{

            setStep(2)
        }
    }

    return <div className="swap-bot">
        <h1>Swap routes</h1>
        <div className="alert alert-info">
            You can create your own coin swap routes
        </div>

        {step===0 &&<Button onClick={()=>navigate('/cabinet/swaproutes')}>Create own swap route</Button>}

        {step===1 && <div>
            <h3>{step}. Choose coins route</h3>
            <InputButtonLoading name="newRoute" onFinish={routeDone} url={`/swap-route/route/add`} buttonText="Done" required
                                placeholder="Input new route of coins separated by space" {...props}/>
        </div>}

        {step===2 &&<div>
            <h3>{step}. Please login to the system</h3>
            <LoginFormGoogle type="button" {...props}/>
        </div>}


        <hr/>
        <h3>Success arbitrage swap routes</h3>
        <table className="table">
            <thead>
            <th>Date</th>
            <th>Route</th>
            <th>Link</th>
            </thead>
            <tbody>
            {transactions.map(tx=><tr key={tx.hash}>
                <td>{tx.dateHuman}</td>
                <td>{tx.data.coins.map(c=>c.symbol).join(' > ')}</td>
                <td><MinterTxLink tx={tx.hash} {...props}/></td>
                  </tr>)}
            </tbody>
        </table>

    </div>
}