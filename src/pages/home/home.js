import React from 'react';
import "./home.sass";
import DailyChart from "pages/DailyChart";

export default function Home(props) {
    return <div className="home">
        <DailyChart {...props}/>
    </div>
}




