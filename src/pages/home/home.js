import React from 'react';
import "./home.sass";
import {A} from "hookrouter"

export default function Home(props) {
    return <div className="home">
        <ul>
            <li><A href="/unbound">Neuro</A></li>
            <li><A href="/unbound">Unbound</A></li>
        </ul>


    </div>
}




