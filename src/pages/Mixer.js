import {useEffect, useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import Loader from "components/Loader";
import CopyButton from "components/copy-button/CopyButton";
import {MinterAddressLink} from "components/MinterLink";

export default function Mixer(props) {
    const [data, setData] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [calc, setCalc] = useState({});
    const [loading, setLoading] = useState({});
    const min = props.store.params.mixerFee * 2 + 1;

    useEffect(()=>{
        props.store.api('/mixer/total-amount')
            .then(r=>setTotalAmount(r.amount))
    })

    async function getAddress(e) {
        setLoading({address: true})
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        setData(await props.store.api('/mixer/address', form))
        setLoading({})
    }

    async function calcPrice(e) {
        setLoading({balance: true})
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        setCalc(await props.store.api('/mixer/calc', form))
        setLoading({})
    }



    return <div>
        <h1>BIP Mixer </h1>
        <h3>Available amount: {totalAmount.toFixed(0)}{props.store.network.coin}</h3>
        <Form onSubmit={getAddress}>
            Address to receive
            <InputGroup>
                <Form.Control name="to" placeholder={'Enter your address to receive the mix'}/>
                <InputGroup.Append>
                    <Button type="submit">Go</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>


        {loading.address ? <Loader/>:<div>
            {data.address && <div className="alert alert-info">Send more than <strong>{min} {props.store.network.coin}</strong> and less than <strong>{totalAmount.toFixed(0)} {props.store.network.coin}</strong> to the address <MinterAddressLink address={data.address} {...props}/></div>}
            {data.error && <div className="alert alert-danger">{data.error.message}</div>}
        </div>}



        <Form onSubmit={calcPrice}>
            Calculate amount
             &nbsp;<span className="badge">(&lt;VALUE&gt; = &lt;mixer commission&gt; - &lt;network fee&gt; * &lt;count of txs&gt;)</span>
            <InputGroup>
                <Form.Control name="value" type="number" min={min + 1} max={totalAmount.toFixed(0)} step="any"/>
                <InputGroup.Append>
                    <Button type="submit">Go</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
        {loading.balance ? <Loader/> : <div>
            {!!calc.balance && <div className="alert alert-info">An approximate amount will be received: <strong>{calc.balance.toFixed(2)}</strong>{props.store.network.coin},&nbsp;
                mixer commission: {props.store.params.mixerFee}{props.store.network.coin},  count of txs: {calc.count}
                {calc.exceed && <span className="text-danger">Amount exceed mixer's limit</span> }</div>}
        </div>}


    </div>
}
