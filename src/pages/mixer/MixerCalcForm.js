import React, {useState} from "react";
import {Form, InputGroup} from "react-bootstrap";
import Loader from "../../components/Loader";
import MinterValue from "../../components/minter/MinterValue";
import ButtonLoading from "../../components/ButtonLoading";

export default function MixerCalcForm(props) {
    const [calc, setCalc] = useState({});
    const [form, setForm] = useState({});
    const min = props.store.params.mixerFee * 2 + 1;

    function fto(e) {
        setForm({value: e.target.value})
    }

    return <Form onChange={fto} className="border p-3 my-2 block">
        <h3>Calculate amount</h3>
        <div className="alert alert-info">You can calculate the approximate amount of funds sent and received in the form "Calculate amount"</div>

        &nbsp;<span className="badge">(&lt;VALUE&gt; = &lt;mixer commission&gt; - &lt;network fee&gt; * &lt;count of txs&gt;)</span>
        <InputGroup>
            <Form.Control name="value" type="number" min={min + 1} max={props.totalAmount.toFixed(0)} step="any"/>
            <InputGroup.Append>
                <ButtonLoading
                    onFinish={setCalc}
                    url={'/mixer/calc'}
                    data={form}
                    {...props}>
                    Go
                </ButtonLoading>
            </InputGroup.Append>
        </InputGroup>
        <div>
            {!!calc.balance &&
            <div className="alert alert-info">If you send <MinterValue value={calc.value} {...props}/>
                &nbsp;you will receive approximately <strong><MinterValue value={calc.balance} {...props}/></strong>
                <hr/>
                mixer commission: {}<MinterValue value={props.store.params.mixerFee} {...props}/>, count of
                txs: {calc.count}
            </div>
            }
        </div>
    </Form>
}