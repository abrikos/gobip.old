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
    const chartRef = useRef(null);
    let timer;

    useEffect(() => {
        loadBet();
        timer = setInterval(loadBet, 1000)
        return () => clearInterval(timer);
    }, []);

    function loadBet() {
        props.store.api('/bet/view/' + props.id,{},true)
            .then(d => {
                if(d.closed) clearInterval(timer);
                chartRef.current && chartRef.current.chart.series[0].setData([
                    {name: 'For', y: d.stakes.for, color: '#28a745'},
                    {name: 'Against', y: d.stakes.against, color: '#dc3545'},
                ])
                setBet(d);
            })
    }

    function choiceCell(b, choice) {
        if(b.closed) return
        const yes = choice === 'for';
        const wallet = yes ? b.walletF : b.walletA;
        return <div className={`border p-2 ${yes ? 'border-success' : 'border-danger'}`}>
            <div>address to vote <strong>{choice}</strong>:</div>
            <MinterAddressLink short={9} address={wallet.address} {...props}/>

            {!!b.sum && <div><hr/>{b.balance[choice].toFixed(1)}% <small>(Votes: {b.votes[choice]})</small></div>}
        </div>
    }

    function votePrize(votes) {
        const sum = votes.length && votes.map(v=>v.value).reduce((a, b) => a + b)
        return <table className="table">
            <thead>
            <tr>
                <th>From</th>
                <th>Payed</th>
                <th>Prize</th>
            </tr>
            </thead>
            <tbody>
            {votes.map(v => <tr key={v.hash}>
                <td>{v.from.substr(0, 8)}...</td>
                <td><MinterValue value={v.value} {...props}/></td>
                <td><MinterValue value={v.value / sum * bet.prizeForWinners} {...props}/></td>
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
            <h1>At <strong className="text-info">{bet.checkDateHuman}</strong> pair <strong className="text-info">{bet.pair}</strong> will be {bet.conditionHuman} <strong
                className="text-info">${bet.value}</strong></h1>
            <HighchartsReact highcharts={Highcharts} options={options} allowChartUpdate ref={chartRef}/>
        </div>
        <h2 className="text-center">Prize: <MinterValue value={bet.prizeForWinners} {...props}/></h2>
        <div className="row">
            <div className="col-6">
                {choiceCell(bet, 'for')}
                {votePrize(bet.votesF)}
            </div>
            <div className="col-6">
                {choiceCell(bet, 'against')}
                {votePrize(bet.votesA)}
            </div>
        </div>
        <A href={'/cabinet/bet'}> &lt;Back to the list</A>
        {/*<div className="col-sm-4"><Mixer {...props}/></div>*/}

    </div>

}

