import {Button} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import InputButtonLoading from "../../components/InputButtonLoading";
import LoginFormGoogle from "../../components/login/LoginFormGoogle";
import {navigate} from "hookrouter";

export default function SwapBot(props){
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
            props.store.api('/swapbot/create')
                .then(bot=>{
                    props.store.api(`/swapbot/${bot.id}/route/add`,{newRoute:r.symbols.join(' ')})
                        .then(()=>navigate('/cabinet'+bot.path))
                })
        }else{

            setStep(2)
        }
    }

    return <div className="swap-bot">
        <h1>Swap bot</h1>
        <div className="alert alert-info">
            About swap bot
        </div>

        {step===0 &&<Button onClick={()=>setStep(1)}>Create own swap bot</Button>}

        {step===1 && <div>
            <h3>{step}. Choose coins route</h3>
            <InputButtonLoading name="newRoute" onFinish={routeDone} url={`/swapbot/route/check`} buttonText="Done" required
                                placeholder="Input new route of coins separated by space" {...props}/>
        </div>}

        {step===2 &&<div>
            <h3>{step}. Please login to the system</h3>
            <LoginFormGoogle type="button" {...props}/>
        </div>}
    </div>
}