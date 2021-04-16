import {useEffect, useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import PageContainer from "components/pager/pageContainer";

export default function UnboundCharts(props) {
    const [data, setData] = useState([])
    const [coins, setCoins] = useState([])
    const [days, setDays] = useState(30)
    const [coin, setCoin] = useState('BIP')

    function init() {
        props.store.api(`/daily/${coin}/${days}`).then(setData)

    }

    useEffect(() => {
        props.store.api(`/coins`).then(setCoins)
        init();
        const timer = setInterval(init, 10000)
        return () => clearInterval(timer);
    }, [coin, days])


    const options = {
        chart: {
            type: 'column'
        },
        title: {
            text: `Unbound  volumes in ${days} days (${data.length > 0 && data.map(d => d.values).reduce((a, b) => a + b).toLocaleString()} ${coin})`
        },
        legend: {
            enabled: true
        },
        yAxis: {
            title: {text: coin},
        },
        xAxis: {categories: data.map(d => d.date)},
        plotOptions: {
            bar: {
                dataLabels: true
            },
            series: {
                dataLabels: {
                    enabled: true,
                    //borderRadius: 2,
                    //y: -10,
                    shape: 'callout'
                }
            }
        },
        series: [{
            name: `volume of ${coin}`,
            color: 'orange',
            data: data.map(d => d.values),
            marker: {
                enabled: true
            }
        }]
    };

    function changeCoin(e) {
        setCoin(e.target.value);
    }

    function changeDays(e) {
        setDays(e.target.value * 1 || 30);
    }

    console.log(data)
    return <div className="m-1">
        {/*Coin: <select value={coin} onChange={changeCoin}>{coins.map(c=><option value={c.coin} key={c.coin}>{c.coin}</option>)}</select>*/}

        {coins.map(c => <span onClick={() => setCoin(c.coin)} key={c.coin} className={`badge ${c.coin === coin ? '' : 'badge-info'} m-2 pointer`}>{c.coin}</span>)}
        <hr/>

        <HighchartsReact highcharts={Highcharts} options={options}/>
        {/*Days: <input value={days} onChange={changeDays} type="number"/>*/}

        <PageContainer model={'transaction'} fields={['hash', 'value', 'coin']} link={`https`} {...props}/>
    </div>
}
