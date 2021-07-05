import {useEffect, useRef, useState} from "react";
import Loader from "../../components/Loader";
import {Button} from "react-bootstrap";
import {navigate} from "hookrouter";
import moment from "moment"

export default function Exchange(props) {
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(false)
    const [chosen, setChosen] = useState({from: '', to: ''})
    const nameRef = useRef()
    const {from, to, amount} = props;

    useEffect(() => {
        init()
        //props.store.api('/exchange/coins').then(setCoins).catch(setError)
    }, [from, to, amount])

    function init(from, to, amount) {
        setLoading(true)
        props.store.api('/exchange/calc', {from, to, amount})
            .then(r => {
                setResult(r);
                setLoading(false);
            })
            .catch(e => {
                setResult(null);
                setLoading(false);
            })
    }

    function choose(type, coin) {
        const c = {...chosen};
        c[type] = coin.symbol;
        setChosen(c);
    }


    function submit(e) {
        e.preventDefault();
        const form = props.store.formToObject(e.target);
        init(form.from, form.to, form.amount);
        return navigate(`/exchange/${form.from}/${form.to}/${form.amount}`)
    }

    const results = [
        ['bip', 'Swap through BIP'],
        //['direct', 'Swap by direct pool']
    ]

    return <div className="exchange">
        <h1>Exchange rates</h1>
        <div>
            <form onSubmit={submit} ref={nameRef}>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Amount</th>
                        <th>From</th>
                        <th>To</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><input className="form-control" step="any" name="amount" type="number" min="0" defaultValue={amount}/></td>
                        <td><input className="form-control" name="from" defaultValue={from}/></td>
                        <td><input className="form-control" name="to" defaultValue={to}/></td>
                        {/*<td>{Search('from')}</td>
                        <td>{Search('to')}</td>*/}
                        <td><Button type="submit">Calc</Button></td>
                    </tr>

                    </tbody>
                </table>
                {loading ? <Loader/> : result && <table className="table">
                    <tbody>
                    <tr>
                        {/*<th></th>*/}
                        <th>{result.from}</th>
                        <th>{result.to}</th>
                    </tr>
                    {results.map(r => <tr key={r[0]}>
                        {/*<td>{r[1]}</td>*/}
                        <td>{result.amount}</td>
                        <td>{result[r[0]] && result[r[0]].value}</td>
                    </tr>)}
                    </tbody>
                </table>}
            </form>
        </div>
        {result && result.error && <div className="alert alert-danger">{result.error}</div>}
    </div>
}