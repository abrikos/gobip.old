import React from "react";
import * as files from "./photos/partners"

export default function Partners() {
    const partners = [
        'https://internat.msu.ru',
        'https://sesc.nsu.ru',
        'https://www.s-vfu.ru',
        'https://yakutia.science',
        'http://lensky-kray.ru',
        'https://nikolaevcentre.ru/about',
        'http://www.school.ioffe.ru',
        'https://www.bmstu.ru',
        'https://tpykt.ru',
        'http://ugsakha.ru',
    ]

    return <div>
        <hr/>
        <div className="d-flex">
            <hr/>
            <div>Наши партнеры</div>
            <hr/>
        </div>
        <div className="partners">
            {partners.map((p, i) => <a key={i} href={p} target="_blank"><img src={files[`i${i + 1}`]}
                                                                             className="img-fluid"/></a>)}
        </div>
    </div>

}
