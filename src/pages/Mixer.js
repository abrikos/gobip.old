import {useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import Loader from "components/Loader";
import CopyButton from "components/copy-button/CopyButton";
import MinterLink from "components/MinterLink";

export default function Mixer(props) {
    const [data, setData] = useState({});
    const [calc, setCalc] = useState({});
    const [loading, setLoading] = useState({});

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
        <h1>BIP Mixer</h1>
        <Form onSubmit={getAddress}>
            Address to receive
            <InputGroup>
                <Form.Control name="to" placeholder={'Enter your address to receive the mix'}/>
                <InputGroup.Append>
                    <Button type="submit">Go</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>


        {loading.address && <Loader/>}
        {loading.address || data.address && <div className="alert alert-info">Send up to <strong>{data.amount.toFixed(0)} {data.network.coin}</strong> to the address <MinterLink explorer={data.network.explorer} address={data.address}/></div>}
        {data.error && <div className="alert alert-danger">{data.error.message}</div>}


        <Form onSubmit={calcPrice}>
            Calculate amount
             &nbsp;<span className="badge">(&lt;VALUE&gt; = &lt;mixer commission&gt; - &lt;network fee&gt; * &lt;count of txs&gt;)</span>
            <InputGroup>
                <Form.Control name="value" type="number"/>
                <InputGroup.Append>
                    <Button type="submit">Go</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
        {loading.balance && <Loader/>}
        {loading.balance || calc.balance && <div className="alert alert-info">an approximate amount will be received: <strong>{calc.balance.toFixed(2)}</strong>{calc.network.coin}&nbsp;
            = {calc.value}{calc.network.coin} - {calc.profit}{calc.network.coin}  -  {calc.commission}{calc.network.coin} * {calc.count}
            {calc.exceed && <span className="text-danger">Amount exceed mixer's limit</span> }</div>}
    </div>
}
