import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {useEffect, useRef, useState} from "react";

export default function BetCryptoChart(props){
    const [data,setData] = useState([]);
    const chartRef = useRef(null);

    useEffect(()=>{
        loadData()
        const timer = setInterval(loadData, 60000)
        return () => clearInterval(timer);
    },[])

    function loadData(){
        props.store.api(`/bet/crypto/${props.pair}`,{},true)
            .then(d=> {
                //chartRef.current && chartRef.current.chart.series[0].setData(d.map(d => [d.date,d.value]))
                setData(d)
            });
    }

    const options = {
        chart: {
            type: 'line'
        },
        title: {
            text: props.pair
        },
        legend: {
            enabled: true
        },
        /*yAxis: {
            title: {text: props.pair},
        },*/
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
            name: props.pair,
            color: 'orange',
            data: data.map(d => [d.date,d.value]),
            marker: {
                enabled: true
            }
        }]
    };

    return <div>
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} allowChartUpdate/>
    </div>
}