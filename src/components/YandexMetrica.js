import React from "react";
import {YMInitializer} from 'react-yandex-metrika';

export default function YandexMetrica() {
    //const ID = 61177273;
    const ID = 61177573;


    //return <div dangerouslySetInnerHTML={{__html: ym()}}/>
    return <YMInitializer accounts={[ID]} options={{
        informer: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
    }} version="2"/>
}
