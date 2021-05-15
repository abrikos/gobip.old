import {Form, InputGroup} from "react-bootstrap";
import MinterValue from "../../components/minter/MinterValue";
import {MinterAddressLink} from "../../components/minter/MinterLink";
import React, {useState} from "react";
import ButtonLoading from "../../components/ButtonLoading";

export default function MixerAddressForm(props) {
    const [data, setData] = useState({});
    const [form, setForm] = useState({});
    const min = props.store.params.mixerFee * 2 + 1;


    function fto(e){
        setForm({to:e.target.value})
    }

    return <Form onChange={fto} className="border p-3 my-2 block">
        <h3>Get address</h3>
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
        </div>

        <InputGroup>
            <Form.Control name="to" placeholder={'Enter your address to receive the mix'}/>
            <InputGroup.Append>
                <ButtonLoading
                    onFinish={setData}
                    url={'/mixer/address'}
                    data={form}
                    {...props}>
                    Go
                </ButtonLoading>
            </InputGroup.Append>
        </InputGroup>
        <div>
            {data.address &&
            <div className="alert alert-info">Send more than <strong><MinterValue
                value={min} {...props}/></strong> and less than <strong><MinterValue
                value={props.totalAmount} {...props}/></strong> to
                the
                address <MinterAddressLink address={data.address} {...props}/></div>}
        </div>
    </Form>

}