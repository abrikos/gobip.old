import React, {useEffect, useRef, useState} from 'react';
import {MinterAddressLink} from "../../components/minter/MinterLink";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import options from "./BetBalanceChartOptions";
import CopyButton from "../../components/copy-button/CopyButton";
import {A} from "hookrouter";
import MinterValue from "../../components/minter/MinterValue";

export default function BetView(props) {
    const [bet, setBet] = useState();
    const [loading, setLoading] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        loadBet();
        const timer = setInterval(loadBet, 1000)
        return () => clearInterval(timer);
    }, []);

    function loadBet() {
        props.store.api('/bet/view/' + props.id)
            .then(d => {
                chartRef.current && chartRef.current.chart.series[0].setData([
                    {name: 'For', y: d.walletF.balance, color: '#28a745'},
                    {name: 'Against', y: d.walletA.balance, color: '#dc3545'},
                ])
                setBet(d);
            })
    }

    function choiceCell(b, choice) {
        const yes = choice === 'for';
        const wallet = yes ? b.walletF : b.walletA;
        return <div className={`border p-2 ${yes ? 'border-success' : 'border-danger'}`}>
            <div>address to vote <strong>{choice}</strong>:</div>
            <MinterAddressLink address={wallet.address} {...props}/>
            <hr/>
            <div>{!!b.sum && b.balance[choice].toFixed(1)}% <small>(Votes: {!!b.sum && b.votes[choice]})</small></div>
        </div>
    }

    function votePrize(votes) {
        const sum = votes.reduce((a, b) => a.value + b.value)
        return <table className="table">
            <thead>
            <th>Tx</th>
            <th>Payed</th>
            <th>Prize</th>
            </thead>
            <tbody>
            {votes.map(v => <tr>
                <td>{v.hash.substr(0, 8)}...</td>
                <td><MinterValue value={v.value} {...props}/></td>
                <td><MinterValue value={v.value / sum * bet.sum} {...props}/></td>
            </tr>)}
            </tbody>
        </table>
    }

    if (!bet) return <div></div>;

    return <div className="container">
        <div className="alert-info alert">
            Share bet: <br/><code>{document.location.origin + bet.shareLink}</code><CopyButton text={document.location.origin + bet.shareLink}/>
            <small className="d-block">Metatags are present</small>
        </div>
        <div className="alert alert-primary">
            <h1><strong className="text-info">{bet.checkDateHuman}</strong> pair <strong className="text-info">{bet.pair}</strong> will be {bet.conditionHuman} <strong
                className="text-info">${bet.value}</strong></h1>
            {!!bet.sum && <HighchartsReact highcharts={Highcharts} options={options} allowChartUpdate ref={chartRef}/>}
        </div>
        <h2 className="text-center">Stake: <MinterValue value={bet.sum} {...props}/></h2>
        <div className="row">
            <div className="col">
                {choiceCell(bet, 'for')}
                {votePrize(bet.votesF)}
            </div>
            <div className="col">
                {choiceCell(bet, 'against')}
                {votePrize(bet.votesA)}
            </div>
        </div>
        <A href={'/cabinet/bet'}> &lt;Back to the list</A>
        {/*<div className="col-sm-4"><Mixer {...props}/></div>*/}

    </div>

}

