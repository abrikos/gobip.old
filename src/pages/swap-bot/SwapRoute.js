import {Button} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import InputButtonLoading from "../../components/InputButtonLoading";
import LoginFormGoogle from "../../components/login/LoginFormGoogle";
import {navigate} from "hookrouter";

export default function SwapRoutes(props){
    const [step,setStep] =useState(0)
    const [route,setRoute] =useState()

    useEffect(()=>{
        if(props.store.authenticatedUser && route){
            routeDone(route)
        }
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

        {step===0 &&<Button onClick={()=>setStep(1)}>Create own swap route</Button>}

        {step===1 && <div>
            <h3>{step}. Choose coins route</h3>
            <InputButtonLoading name="newRoute" onFinish={routeDone} url={`/swap-route/route/add`} buttonText="Done" required
                                placeholder="Input new route of coins separated by space" {...props}/>
        </div>}

        {step===2 &&<div>
            <h3>{step}. Please login to the system</h3>
            <LoginFormGoogle type="button" {...props}/>
        </div>}
    </div>
}