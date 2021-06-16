import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {MinterAddressLink, MinterTxLink} from "../../components/minter/MinterLink";
import InputButtonLoading from "../../components/InputButtonLoading";
import MinterValue from "../../components/minter/MinterValue";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {navigate} from "hookrouter";
import "./swapbot.sass"
import ButtonLoading from "../../components/ButtonLoading";

export default function SwapBotEdit(props) {
    const [bot, setBot] = useState();
    const [balance, setBalance] = useState([]);
    const [modal, setModal] = useState({});

    useEffect(() => {
        loadBot()
        const timer = setInterval(loadBot, 5000)
        return () => clearInterval(timer);
    }, [props.id])


    function loadBot() {
        props.store.api(`/swapbot/${props.id}/view`, {}, true)
            .then(b => {
                setBot(b);
                props.store.api(`/swapbot/address/${b.wallet && b.wallet.address}`, {}, true)
                    .then(setBalance)
            })

    }

    function routeDelete(r) {
        if (!window.confirm(`Delete route ${r.name}?`)) return;
        props.store.api(`/swapbot/route/${r.id}/delete`)
            .then(loadBot)
    }

    function modalUpdate(r) {
        setModal({
            title: `Options for ${r.name}`,
            body: <div>
                <InputButtonLoading label="New route" name="name" onFinish={loadBot} url={`/swapbot/route/${r.id}/change`} buttonText="Save" required
                                    value={r.name}
                                    placeholder="Input new route of coins (symbols/ids separated by space)" {...props}/>
                <InputButtonLoading label="Amount" value={r.amount.toString()} name="amount" onFinish={() => {
                    loadBot();
                    setModal({})
                }} url={`/swapbot/route/${r.id}/update/`} buttonText="Save" {...props}/>
                <hr/>
                <InputButtonLoading label="MinToBuy" value={r.minToBuy.toString()} name="minToBuy" onFinish={() => {
                    loadBot();
                    setModal({})
                }} url={`/swapbot/route/${r.id}/update/`} buttonText="Save" {...props}/>
                <small className="text-danger">{r.execDateHuman}: {r.lastError}</small>
            </div>
        })
    }

    function botDelete(){
        if(!window.confirm(`Delete swap routes "${bot.name}"`)) return;
        props.store.api(`/swapbot/${bot.id}/delete`).then(()=>navigate('/cabinet/swapbot'))
    }


    if (!bot) return <div/>
    return <div className="swap-bot-edit">
        <h1><span className="text-secondary">My swap routes </span> {bot.name}</h1>
        <div className="row">
            <div className="col-9">
                <div className="alert alert-info">
                    Address of the bot: <MinterAddressLink address={bot.wallet && bot.wallet.address} {...props}/>
                    <br/>
                    Send on it first coins for swapping
                </div>
            </div>
            <div className="col-3">
                <table className="table table-responsive">
                    <tbody>
                    {balance.map(b => <tr key={b.symbol}>
                        <td className="text-right">{b.symbol}</td>
                        <td>{b.value}</td>
                    </tr>)}
                    </tbody>
                </table>
                {!!balance.length && <ButtonLoading
                    onFinish={r => {
                        console.log('onFinis', r)
                        //setSuccess(<div>Withdraw TX: <MinterTxLink tx={r.hash} {...props}/></div>);
                        loadBot()
                    }}
                    url={'/cabinet/swapbot/wallet/withdraw/' + bot.wallet.id}
                    variant={'warning'}
                    confirmMessage={`Withdraw all to ${props.store.authenticatedUser.address}?`}
                    {...props}>
                    Withdraw
                </ButtonLoading>}
            </div>
        </div>



        <h3>Options</h3>
        <InputButtonLoading label="Name" value={bot.name} name="name" onFinish={setBot} url={`/swapbot/${bot.id}/update/`} buttonText="Save" {...props}/>
        <div className="text-center"><Button variant="danger" onClick={botDelete}><FontAwesomeIcon icon={faTrash}/></Button></div>

        <hr/>


        <h3>Routes</h3>

        <InputButtonLoading label="New route" name="newRoute" onFinish={loadBot} url={`/swapbot/${bot.id}/route/add`} buttonText="Add" required
                            placeholder="Input new route of coins separated by space" {...props}/>


        <table className="table table-striped">
            <thead>
            <tr>
                <th></th>
                <th>Route</th>
                <th>Swap amount</th>
                <th>MinToBuy</th>
                <th>Payed until</th>
                <th>Swap result</th>
                {/*<th>Enabled</th>*/}
                <th></th>
            </tr>
            </thead>
            <tbody>
            {bot.routes.map((r, i) => <tr key={i} className={r.payDate ? '' : 'bg-warning'}>
                <td>
                    {r.payDate && <ButtonLoading
                        onFinish={r => {
                            console.log('onFinis', r)
                            //setSuccess(<div>Withdraw TX: <MinterTxLink tx={r.hash} {...props}/></div>);
                            loadBot()
                        }}
                        url={`/swapbot/doswap/${r.id}`}
                        variant={'primary'}
                        {...props}>
                        Swap
                    </ButtonLoading>}
                </td>
                <td>
                    {r.name}
                </td>
                <td>{r.amount}</td>
                <td>{r.minToBuy}</td>
                <td>
                    <small>{r.payedUntil || <span>Send <MinterValue value={r.payNeeded} {...props}/><br/> to <MinterAddressLink short={7} address={r.wallet.address} {...props}/></span>}</small>
                </td>
                <td>
                    <small>{r.execDateHuman}</small>
                    <br/>
                    <small><MinterTxLink tx={r.lastTx} {...props}/></small>
                    <small className="text-danger">{r.lastError}</small>
                </td>
                {/*<td><input type="checkbox" onChange={() => routeSwitch(r)} defaultChecked={r.enabled}/></td>*/}
                <td className="text-center">

                    {/*{!r.payedUntil && <Button size="sm" variant="primary" title="Payment" onClick={() => modalPayment(r)}><FontAwesomeIcon icon={faCoins}/></Button>}*/}

                    <Button size="sm" variant="success" onClick={() => modalUpdate(r)}><FontAwesomeIcon icon={faEdit}/></Button>
                    <Button size="sm" variant="danger" onClick={() => routeDelete(r)}><FontAwesomeIcon icon={faTrash}/></Button>
                </td>
            </tr>)}
            </tbody>
        </table>

        <Modal
            onHide={() => setModal({})}
            show={!!modal.title}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {modal.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modal.body}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setModal({})}>Close</Button>
            </Modal.Footer>
        </Modal>
    </div>;
}