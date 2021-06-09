import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {A} from "hookrouter"
import {MinterAddressLink} from "../../components/minter/MinterLink";
import ButtonLoading from "../../components/ButtonLoading";
import InputButtonLoading from "../../components/InputButtonLoading";
import MinterValue from "../../components/minter/MinterValue";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";

export default function SwapBotCabinet(props) {
    const [list, setList] = useState([])
    const [bot, setBot] = useState()

    useEffect(() => {
        if (props.id) {
            loadBot()
            const timer = setInterval(loadBot, 5000)
            return () => clearInterval(timer);
        } else {
            loadList();
        }
    }, [])


    function loadList() {
        props.store.api('/swapbot/list', {}, true)
            .then(setList)
    }

    function loadBot() {
        props.store.api(`/swapbot/${props.id}/view`, {}, true)
            .then(setBot)
    }

    function add() {
        props.store.api('/swapbot/create')
            .then(loadList)
    }


    function roteDelete(r) {
        if (!window.confirm(`Delete route ${r.name}?`)) return;
        props.store.api(`/swapbot/route/${r.id}/delete`)
            .then(loadBot)
    }

    function routeSwitch(r) {
        props.store.api(`/swapbot/route/${r.id}/switch`)
            .then(loadBot)
    }

    return <div>
        {bot ? <div>
            <h1>{bot.name}</h1>
            <div className="alert alert-info">
                Address of the bot: <MinterAddressLink address={bot.wallet.address} {...props}/>
                <br/>
                Send on it all required payments and coins for swapping
            </div>
            <h3>Options</h3>
            <InputButtonLoading value={bot.name} name="name" onFilish={setBot} url={`/swapbot/${bot.id}/update/`} buttonText="Save" {...props}/>


            <hr/>


            <h3>Routes</h3>
            <div className="alert alert-info">Cost of enabling each route = <MinterValue value={props.store.params.swap.routePay} {...props}/>. To pay all your
                enabled routes you need to send{' '}
                <MinterValue value={bot.needPay} {...props}/> to{' '}
                <MinterAddressLink address={bot.wallet.address} {...props}/>
            </div>

            <InputButtonLoading name="newRoute" onFilish={loadBot} url={`/swapbot/${bot.id}/route/add`} buttonText="Add new" required
                                placeholder="Input new route of coins separated by space" {...props}/>


            <h4>Current routes</h4>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Route</th>
                    <th>Swap amount</th>
                    <th>Profit</th>
                    <th>Payed until</th>
                    <th>Enabled</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {bot.routes.map((r, i) => <tr key={i} className={r.enabled ? r.payDate ? '' : 'bg-warning' : 'bg-dark'}>
                    <td>{r.name}</td>
                    <td><MinterValue value={r.amount} {...props}/></td>
                    <td>{r.profit}</td>
                    <td>{r.payedUntil || (r.enabled && <span>Need <MinterValue value={props.store.params.swap.routePay} {...props}/></span>)}</td>
                    <td><input type="checkbox" onChange={() => routeSwitch(r)} defaultChecked={r.enabled}/></td>
                    <td>
                        <Button size="sm" variant="success"><FontAwesomeIcon icon={faEdit}/></Button>
                        <Button size="sm" variant="danger" onClick={() => roteDelete(r)}><FontAwesomeIcon icon={faTrash}/></Button>
                    </td>
                </tr>)}
                </tbody>
            </table>


        </div> : <div>
            <h1>My bots</h1>
            <Button onClick={add}>Create bot</Button>
            {list.map(l => <div key={l.id}>
                <A href={'/cabinet/swapbot/' + l.id} className="pointer" onClick={() => setBot(l)}>{l.name || l.id}</A>
            </div>)}
        </div>}


    </div>;
}