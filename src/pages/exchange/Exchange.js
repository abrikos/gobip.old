import {useEffect, useRef, useState} from "react";
import Loader from "../../components/Loader";
import {Button} from "react-bootstrap";


export default function Exchange(props) {
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(false)
    const [coins, setCoins] = useState([])
    const [found, setFound] = useState({from: [], to: []})
    const [chosen, setChosen] = useState({from: '', to: ''})
    const nameRef = useRef()

    function getCoins(e, type) {
        choose(type, {symbol: e.target.value})
        if (e.target.value.length < 2) return;
        const f = {...found};
        f[type] = coins.filter(c => c.symbol.indexOf(e.target.value.toUpperCase()) === 0);
        setFound(f);

    }

    useEffect(() => {
        props.store.api('/exchange/coins').then(setCoins)
    }, [])


    function Coin(coin) {
        return <span className="pointer coin" onClick={coin.onClick}>
                    <img src={props.store.network.image + coin.symbol}/>
                    <span>{coin.symbol}</span>
                </span>
    }

    function choose(type, coin) {
        const c = {...chosen};
        c[type] = coin.symbol;
        setChosen(c);
    }

    function Search(type) {
        return <div>
            <input className="form-control" onChange={e => getCoins(e, type)} value={chosen[type]} name={type}/>
            <div className="coin-list">
                {found[type].map(f => <Coin key={f.id} {...f} onClick={() => {
                    setFound({from: [], to: []})
                    choose(type, f)
                }}/>)}
            </div>
        </div>
    }

    function submit(e) {
        e.preventDefault();
        setLoading(true);
        const form = props.store.formToObject(e.target);
        props.store.api('/exchange/calc', form)
            .then(r => {
                setResult(r);
                setLoading(false);
                setFound({from: [], to: []})
            })
            .catch(e => {
                setResult({})
                setLoading(false);
            })
    }

    const results = [
        ['bip', 'Swap through BIP'],
        //['direct', 'Swap by direct pool']
    ]

    return <div className="exchange">
        <h1>Exchange rates</h1>
        {!coins.length ? <Loader/> : <div>
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
                        <td><input className="form-control" step="any" name="amount" type="number" min="0" defaultValue={1}/></td>
                        <td>{Search('from')}</td>
                        <td>{Search('to')}</td>
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
                        <th>Errors</th>
                    </tr>
                    {results.map(r => <tr key={r[0]}>
                        {/*<td>{r[1]}</td>*/}
                        <td>{result.amount}</td>
                        <td>{result[r[0]].value}</td>
                        <td className="text-danger">{result[r[0]].error}</td>
                    </tr>)}
                    </tbody>
                </table>}
            </form>
        </div>}
    </div>
}