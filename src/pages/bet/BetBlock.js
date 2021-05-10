import React from 'react';
import {A} from "hookrouter"
import "./bet.sass"
import MinterValue from "../../components/minter/MinterValue";


export default function BetBlock(props) {
    const d = props.bet;
    return <div key={d.id} className="w-25 p-2 bet-cell">
        <div className="border p-2">
            <div className="row">


                <div className="col">
                    <A href={`${props.cabinet ? '/cabinet':''}/bet/${d.id}`}>
                        <strong className="d-block">{d.pair}<br/> {d.conditionHuman} <br/> {d.value}</strong>
                        at {d.checkDateHuman}
                    </A>
                </div>
                {!!d.sum && <div className="col">

                    <MinterValue value={d.prizeForWinners} {...props}/>
                    <div className="text-success">{d.balance.for.toFixed(0)}% <small>({d.votes.for})</small></div>
                    <div className="text-danger">{d.balance.against.toFixed(0)}% <small>({d.votes.against})</small></div>
                </div>}


            </div>

        </div>
    </div>
}

