import {Button, Modal} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {MinterAddressLink, MinterTxLink} from "../../components/minter/MinterLink";
import InputButtonLoading from "../../components/InputButtonLoading";
import MinterValue from "../../components/minter/MinterValue";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {navigate} from "hookrouter";
import "./swap-route.sass"
import ButtonLoading from "../../components/ButtonLoading";
import CopyButton from "../../components/copy-button/CopyButton";

export default function SwapRoutesCabinet(props) {
    const [routes, setRoutes] = useState([]);
    const [balance, setBalance] = useState([]);
    const [modal, setModal] = useState({});
    const [wallet, setWallet] = useState({});
    const ref = document.location.origin + '/api/referral/' + props.store.authenticatedUser.referral;

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
                <InputButtonLoading label="Amount" value={r.amount.toString()} name="amount" onFinish={() => {
                    loadRoutes();
                    setModal({})
                }} url={`/swap-route/route/${r.id}/update/`} buttonText="Save" {...props}/>
                <hr/>
                <InputButtonLoading label="MinToBuy" value={r.minToBuy.toString()} name="minToBuy" onFinish={() => {
                    loadRoutes();
                    setModal({})
                }} url={`/swap-route/route/${r.id}/update/`} buttonText="Save" {...props}/>
                <small className="text-danger">{r.execDateHuman}: {r.lastError}</small>
            </div>
        })
    }

    function createWallet() {
        props.store.api('/swap-route/wallet/create')
            .then(loadRoutes)
    }

    return <div className="swap-bot-edit">
        <h1>My swap routes </h1>
        <div className="alert alert-success">
            <h4>Referral program</h4>
            Each route paid by your referrals will bring you 10% of the cost
            <hr/>
            <code>
                {ref} <CopyButton text={ref}/>
            </code>
        </div>
        {!wallet.address && <Button onClick={createWallet}>Create wallet for routes</Button>}


        {wallet.address && <div>
            <div className="row">
                <div className="col-9">
                    <div className="alert alert-info">
                        Address for the routes: <MinterAddressLink address={wallet.address} {...props}/>
                        <br/>
                        Send on it first coins for swapping
                    </div>
                </div>
                <div className="col-3">
                    <table className="table table-responsive">
                        <tbody>
                        {wallet.balance.map(b => <tr key={b.symbol}>
                            <td className="text-right">{b.symbol}</td>
                            <td>{b.value}</td>
                        </tr>)}
                        </tbody>
                    </table>
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
                        Withdraw
                    </ButtonLoading>}
                </div>
            </div>


            <h3>Routes</h3>

            <InputButtonLoading label="New route" name="newRoute" onFinish={loadRoutes} url={`/swap-route/route/add`} buttonText="Add" required
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
                {routes.map((r, i) => <tr key={i} className={r.payDate ? '' : 'bg-warning'}>
                    <td>
                        {r.payDate && <ButtonLoading
                            onFinish={r => {
                                console.log('onFinis', r)
                                //setSuccess(<div>Withdraw TX: <MinterTxLink tx={r.hash} {...props}/></div>);
                                loadRoutes()
                            }}
                            url={`/swap-route/doswap/${r.id}`}
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
                        <small>{r.payedUntil || <span>Send <MinterValue value={r.payNeeded} {...props}/><br/> to <MinterAddressLink short={7}
                                                                                                                                    address={r.wallet.address} {...props}/></span>}</small>
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
        </div>}
    </div>;
}