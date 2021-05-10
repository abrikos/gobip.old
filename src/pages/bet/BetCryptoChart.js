import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {useState} from "react";

export default function BetCryptoChart(props){
    const [data,setData] = useState([])

    const options = {
        chart: {
            type: 'column'
        },
        title: {
            text: `PAIR`
        },
        legend: {
            enabled: true
        },
        yAxis: {
            title: {text: 'PAIR NAME'},
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
            name: `volume of `,
            color: 'orange',
            data: data.map(d => d.values),
            marker: {
                enabled: true
            }
        }]
    };

    return <div>
        <HighchartsReact highcharts={Highcharts} options={options}/>
    </div>
}