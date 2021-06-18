import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {MinterAddressLink, MinterTxLink} from "../../components/minter/MinterLink";
import InputButtonLoading from "../../components/InputButtonLoading";
import MinterValue from "../../components/minter/MinterValue";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import "./swap-route.sass"
import ButtonLoading from "../../components/ButtonLoading";
import CopyButton from "../../components/copy-button/CopyButton";
import Loader from "../../components/Loader";

export default function SwapRoutesCabinet(props) {
    const [routes, setRoutes] = useState([]);
    const [modal, setModal] = useState({});
    const [wallet, setWallet] = useState({});

    useEffect(() => {
        loadRoutes()
        const timer = setInterval(loadRoutes, 5000)
        return () => clearInterval(timer);
    }, [props.id])


    function loadRoutes() {
        props.store.api(`/swap-route/list`, {}, true)
            .then(setRoutes)
        props.store.api(`/swap-route/wallet`, {}, true)
            .then(setWallet)
    }

    function routeDelete(r) {
        if (!window.confirm(`Delete route ${r.name}?`)) return;
        props.store.api(`/swap-route/route/${r.id}/delete`)
            .then(loadRoutes)
    }

    function modalUpdate(r) {
        setModal({
            title: `Options for ${r.name}`,
            body: <div>
                <InputButtonLoading label="New route" name="name" onFinish={loadRoutes} url={`/swap-route/route/${r.id}/change`} buttonText="Save" required
                                    value={r.name}
                                    placeholder="Input new route of coins (symbols/ids separated by space)" {...props}/>
                <InputButtonLoading label="Amount" value={r.amount} name="amount" onFinish={loadRoutes} url={`/swap-route/route/${r.id}/update/`}
                                    buttonText="Save" {...props}/>
                <hr/>
                <InputButtonLoading label="MinToBuy" value={r.minToBuy} name="minToBuy" onFinish={loadRoutes()} url={`/swap-route/route/${r.id}/update/`}
                                    buttonText="Save" {...props}/>
                <small className="text-danger">{r.execDateHuman}: {r.lastError}</small>
            </div>
        })
    }

    function createWallet() {
        props.store.api('/swap-route/wallet/create')
            .then(loadRoutes)
    }

    function changeCron(e, r) {
        console.log(e.target.checked)
        props.store.api(`/swap-route/route/${r.id}/update/`, {cron: e.target.checked})
            .then(loadRoutes)
    }

    return <div className="swap-bot-edit">
        <h1>My swap routes </h1>

        {/*{!wallet.address && <Button onClick={createWallet}>Create wallet for routes</Button>}*/}


        {!wallet.address ? <div>{/*<Button onClick={createWallet}>Create wallet for routes</Button>*/}<Loader/></div> : <div>
            <div className="row">
                <div className="col-9">
                    <div className="alert alert-info">
                        Top up the balance of this wallet with coins that you plan to use in exchanges: <MinterAddressLink address={wallet.address} {...props}/>
                        <br/>

                    </div>
                </div>
                <div className="col-3">
                    <table className="table table-responsive">
                        <tbody>
                        {wallet.balance.map(b => <tr key={b.symbol}>
                            <td className="text-right">{b.symbol}</td>
                            <td>{(b.value * 1).toFixed(3)}</td>
                        </tr>)}
                        </tbody>
                    </table>
                    {!wallet.balance.length && <div className="text-danger">Empty balance</div>}

                </div>
            </div>
            <div className="text-center">
                {!!wallet.balance.length && <ButtonLoading
                    onFinish={r => {
                        console.log('onFinis', r)
                        //setSuccess(<div>Withdraw TX: <MinterTxLink tx={r.hash} {...props}/></div>);
                        loadRoutes()
                    }}
                    url={'/cabinet/swap-route/wallet/withdraw/'}
                    variant={'warning'}
                    confirmMessage={`Withdraw all to ${props.store.authenticatedUser.address}?`}
                    {...props}>
                    Withdraw all to your address <MinterAddressLink address={props.user.address} {...props}/>
                </ButtonLoading>}
            </div>
            <hr/>
            <h3>Routes </h3>

            <InputButtonLoading label="New route" name="newRoute" onFinish={loadRoutes} url={`/swap-route/route/add`} buttonText="Add" required
                                placeholder="Input ids/symbols of coins separated by space or comma" {...props}/>

            <small>Each route must be activated by paying <MinterValue value={props.store.params.swap.routePay} {...props}/></small>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th></th>
                    <th>Route</th>
                    <th>Amount</th>
                    <th>MinToBuy</th>
                    <th>Payed until</th>
                    <th>Swap result</th>
                    {/*<th>Enabled</th>*/}
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {routes.map((r, i) => <tr key={i} className={r.payDate ? '' : 'bg-warning'}>
                    <td>
                        {r.payDate && <span>
                            <ButtonLoading
                                onFinish={r => {
                                    console.log('onFinis', r)
                                    //setSuccess(<div>Withdraw TX: <MinterTxLink tx={r.hash} {...props}/></div>);
                                    loadRoutes()
                                }}
                                url={`/swap-route/doswap/${r.id}`}
                                variant={'primary'}
                                {...props}>
                            Swap
                        </ButtonLoading>
                            <br/> auto launch
                            <br/>
                        <input type="checkbox" onChange={e => changeCron(e, r)} defaultChecked={r.cron}/>
                        </span>}
                    </td>
                    <td>
                        {r.name}
                    </td>
                    <td>{r.amount}</td>
                    <td>{r.minToBuy}</td>
                    <td>
                        <small>{r.payedUntil || <span>Send <MinterValue value={r.payNeeded} {...props}/><br/> to <MinterAddressLink short={7}
                                                                                                                                    address={r.wallet.address} {...props}/></span>}</small>
                    </td>
                    <td>
                        <small className="d-block">{r.execDateHuman}</small>
                        <small className="d-block"><MinterTxLink tx={r.lastTx} {...props}/></small>
                        <small className="text-danger">{r.lastError}</small>
                    </td>
                    {/*<td><input type="checkbox" onChange={() => routeSwitch(r)} defaultChecked={r.enabled}/></td>*/}
                    <td className="text-left">

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
        </div>}
    </div>;
}