import React, {useEffect, useState} from 'react';
import "./cabinet.sass"
import {Button} from "react-bootstrap";
import MinterLink from "components/MinterLink";
import Loader from "components/Loader";

export default function CabinetMixer(props) {
    const [wallets, setWallets] = useState([]);
    const [network, setNetwork] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(()=> {
        props.store.api('/network').then(setNetwork)
        loadWallets();
        const timer = setInterval(loadWallets, 5000)
        return () => clearInterval(timer);
    }, []);

    function loadWallets() {
        props.store.api('/cabinet/mixer/wallets')
            .then(d => {
                setWallets(d);
            })
        //.catch(console.warn)
    }

    function createWallet(){
        setLoading(true)
        props.store.api('/cabinet/mixer/wallet/create')
            .then(d => {
                console.log('zzzzzzzzzzzz', d)
                loadWallets();
                setLoading(false)
            })
    }

    return <div>
        <h1>Mixer</h1>
        <Button onClick={createWallet}>Add wallet</Button>
        {wallets.map(d=><div key={d.id}>
            <strong>{d.balance.toFixed(2)} {network.coin}</strong> <MinterLink address={d.address} explorer={network.explorer}/> {JSON.stringify(d.profits)}
        </div>)}
        {loading && <Loader/>}
    </div>

}

