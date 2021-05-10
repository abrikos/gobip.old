import React from 'react';
import "./home.sass";
import UnboundCharts from "pages/UnboundCharts";

export default function Home(props) {
    return <div className="home">
        <UnboundCharts {...props}/>

    </div>
}




