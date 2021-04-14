import {useEffect, useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function UnboundCharts(props) {
    const [data, setData] = useState([])
    const [coins, setCoins] = useState([])
    const [days, setDays] = useState(30)
    const [coin, setCoin] = useState('BIP')

    function init(){
        props.store.api(`/daily/${coin}/${days}`).then(setData)
        console.log(coins)
        props.store.api(`/coins`)            .then(setCoins)
    }

    useEffect(() => {
        init();
        const timer = setInterval(init, 10000)
        return () => clearInterval(timer);
    }, [coin,days])


    const options = {
        chart: {
            type: 'column'
        },
        title: {
            text: `Unbound  volumes in ${days} days`
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
            name:`volume of ${coin}`,
            color:'orange',
            data: data.map(d=>d.values),
            marker: {
                enabled: true
            }
        }]
    };

    function changeCoin(e){
        setCoin(e.target.value);
    }

    function changeDays(e){
        setDays(e.target.value*1||30);
    }

    return <div className="border bg-light  m-1">
        Coin: <select value={coin} onChange={changeCoin}>{coins.map(c=><option value={c.coin} key={c.coin}>{c.coin}</option>)}</select>
        Days: <input value={days} onChange={changeDays} type="number"/>
        <HighchartsReact highcharts={Highcharts} options={options}/>
    </div>
}
