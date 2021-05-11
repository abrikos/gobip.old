import React, {useState} from "react";
import {Button, Form, InputGroup} from "react-bootstrap";
import Loader from "../../components/Loader";
import MinterValue from "../../components/minter/MinterValue";

export default function MixerCalcForm(props) {
    const [calc, setCalc] = useState({});
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const min = props.store.params.mixerFee * 2 + 1;

    async function calcPrice(e) {
        setError(null)
        setLoading(true)
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        setCalc(await props.store.api('/mixer/calc', form))
        setLoading(false)
    }


    return <Form onSubmit={calcPrice} className="border p-3 my-2 block">
        <h3>Calculate amount</h3>
        <div className="alert alert-info">You can calculate the approximate amount of funds sent and received in the form "Calculate amount"</div>

        &nbsp;<span className="badge">(&lt;VALUE&gt; = &lt;mixer commission&gt; - &lt;network fee&gt; * &lt;count of txs&gt;)</span>
        <InputGroup>
            <Form.Control name="value" type="number" min={min + 1} max={props.totalAmount.toFixed(0)} step="any"/>
            <InputGroup.Append>
                <Button type="submit">Go</Button>
            </InputGroup.Append>
        </InputGroup>
        {loading ? <Loader/> : <div>
            {!!calc.balance &&
            <div className="alert alert-info">If you send <MinterValue value={calc.value} {...props}/>
                &nbsp;you will receive approximately <strong><MinterValue value={calc.balance} {...props}/></strong>
                <hr/>
                mixer commission: {}<MinterValue value={props.store.params.mixerFee} {...props}/>, count of
                txs: {calc.count}
            </div>
            }
        </div>}
        {error && <div className="alert alert-danger">{error.message}</div>}
    </Form>
}