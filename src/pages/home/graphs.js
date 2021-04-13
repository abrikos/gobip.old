import React, {useEffect, useState} from 'react';

export default function Graphs(props) {
    const [txs, setTxs] = useState([])

    function init() {
        props.store.api('/tx/list')
            .then(setTxs)
    }

    useEffect(() => {
        const timer = setInterval(init, 10000)
        return () => clearInterval(timer);
    }, [])

    return <div>
        <h1>Daily</h1>


    </div>
}




