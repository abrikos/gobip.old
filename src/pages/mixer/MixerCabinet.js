import React, {useEffect, useState} from 'react';
import {Button} from "react-bootstrap";
import {MinterAddressLink} from "components/minter/MinterLink";
import Loader from "components/Loader";
import CopyButton from "../../components/copy-button/CopyButton";
import MinterValue from "../../components/minter/MinterValue";

export default function MixerCabinet(props) {
    const [wallets, setWallets] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWallets();
        const timer = setInterval(loadWallets, 5000)
        return () => clearInterval(timer);
    }, []);

    function loadWallets() {
        props.store.api('/cabinet/mixer/wallets')
            .then(d => {
                setWallets(d);
            })
    }

    function createWallet() {
        setLoading(true)
        props.store.api('/cabinet/mixer/wallet/create')
            .then(d => {
                loadWallets();
                setLoading(false)
            })
    }

    if(!wallets) return <div/>;
    return <div>

            <h1>My mixer wallets</h1>
            <div className="alert alert-info">Create an address, send funds to it and get a proportional percentage of mixer commission from each mix in the system</div>
            <Button onClick={createWallet}>Add wallet</Button>
            <table className="table">
                <thead>
                <tr>
                    <th>Funds on wallet</th>
                    <th>Address</th>
                    <th>seed/mnemonic</th>
                </tr>
                </thead>
                <tbody>
                {wallets.map(d => <tr key={d.id}>
                    <td className="text-right"><MinterValue value={d.balance} {...props}/></td>
                    <td><MinterAddressLink address={d.address} {...props}/></td>
                    {/*<div>
                {d.profits.map(p=><div key={p.date}><small>{p.date}</small> {p.value.toFixed(1)}</div>)}
            </div>*/}
                    <td className="text-center"> <CopyButton text={d.seedPhrase}/></td>
                </tr>)}
                </tbody>
            </table>
            {loading && <Loader/>}

        {/*<div className="col-sm-4"><Mixer {...props}/></div>*/}

    </div>

}

