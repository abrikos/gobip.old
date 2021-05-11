import React, {useEffect, useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import Loader from "components/Loader";
import {MinterAddressLink} from "components/minter/MinterLink";
import MinterValue from "../../components/minter/MinterValue";

export default function Mixer(props) {
    const [data, setData] = useState({});
    const [error, setError] = useState();
    const [totalAmount, setTotalAmount] = useState(0);
    const [calc, setCalc] = useState({});
    const [loading, setLoading] = useState({});
    const min = props.store.params.mixerFee * 2 + 1;

    useEffect(() => {
        props.store.api('/mixer/total-amount')
            .then(r => setTotalAmount(r.amount))
    })

    function getAddress(e) {
        setLoading({address: true})
        setError(null)
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        props.store.api('/mixer/address', form)
            .then(setData)
            .catch(setError)
        setLoading({})
    }

    async function calcPrice(e) {
        setError(null)
        setLoading({balance: true})
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        setCalc(await props.store.api('/mixer/calc', form))
        setLoading({})
    }


    return <div>
        <h1>{props.store.network.coin} Mixer </h1>
        <div className="alert alert-info">
            Transfer funds using intermediary wallets
            <ol>
                <li>In the form "Get address", enter the address where you want to send the mixed funds</li>
                <li>Press "Go"</li>
                <li>Copy the received address and send funds to it <small>(Pay attention to the indicated
                    limits)</small></li>
                <li>After a while, funds <small>(minus all commissions)</small> will be received from several wallets to
                    the address you specified
                </li>
            </ol>
            You can calculate the approximate amount of funds sent and received in the form "Calculate amount"
        </div>
        Available amount for mixing <MinterValue value={totalAmount} {...props}/>

        {error && <div className="alert alert-danger">{error.message}</div>}
        <Form onSubmit={getAddress} className="border p-3 my-2">
            <h3>Get address</h3>
            <InputGroup>
                <Form.Control name="to" placeholder={'Enter your address to receive the mix'}/>
                <InputGroup.Append>
                    <Button type="submit">Go</Button>
                </InputGroup.Append>
            </InputGroup>
            {loading.address ? <Loader/> : <div>
                {data.address &&
                <div className="alert alert-info">Send more than <strong><MinterValue
                    value={min} {...props}/></strong> and less than <strong><MinterValue
                    value={totalAmount} {...props}/></strong> to
                    the
                    address <MinterAddressLink address={data.address} {...props}/></div>}
            </div>}
        </Form>


        <Form onSubmit={calcPrice} className="border p-3 my-2">
            <h3>Calculate amount</h3>
            &nbsp;<span className="badge">(&lt;VALUE&gt; = &lt;mixer commission&gt; - &lt;network fee&gt; * &lt;count of txs&gt;)</span>
            <InputGroup>
                <Form.Control name="value" type="number" min={min + 1} max={totalAmount.toFixed(0)} step="any"/>
                <InputGroup.Append>
                    <Button type="submit">Go</Button>
                </InputGroup.Append>
            </InputGroup>
            {loading.balance ? <Loader/> : <div>
                {!!calc.balance &&
                <div className="alert alert-info">An approximate amount will be received: <strong><MinterValue
                    value={calc.balance} {...props}/></strong>,&nbsp;
                    mixer commission: {}<MinterValue value={props.store.params.mixerFee} {...props}/>, count of
                    txs: {calc.count}
                    {calc.exceed && <span className="text-danger">Amount exceed mixer's limit</span>}</div>}
            </div>}
        </Form>

        <div className="alert-success alert">
            After completing a simple registration, you will be able to receive your income from the funds placed in the
            mixer. The system commission from each mix <small>(<MinterValue
            value={props.store.params.mixerFee} {...props}/>)</small> is divided among all investors in proportion to
            the amount on their wallets.
        </div>


    </div>
}
