import React from 'react';
import "./home.sass";
import UnboundCharts from "pages/UnboundCharts";
import {A} from "hookrouter"

export default function Home(props) {
    return <div className="home">
        <A href="/unbound">Unbound charts</A>

    </div>
}




