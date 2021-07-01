import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import {A, navigate} from "hookrouter";
import GameUserInfo from "./GameUserInfo";

export default function GameList(props) {
    const [module, setModule] = useState({})
    const [modules, setModules] = useState([])
    const [list, setList] = useState([])
    const [error, setError] = useState({})


    useEffect(() => {
        loadModules();
        loadList();
        const timer = setInterval(loadList, 5000)
        return () => clearInterval(timer);
    }, [props.module])


    function loadList() {
        if (!props.module) return;
        props.store.api('/game/list', {module: props.module}, true)
            .then(setList)
            .catch(setError)
    }

    function loadModules() {
        setError({})
        props.store.api('/game/modules')
            .then(r => {
                setModules(r);
                props.module && setModule(r.find(m => m.name === props.module))
            })
            .catch(setError)
    }

    function startGame(e) {
        e.preventDefault();
        setError({})
        const form = props.store.formToObject(e.target);
        if(form.stake < 50) return setError({message:'Stake too low: '+ form.stake})
        props.store.api('/game/start', {module, ...form})
            .then(g => navigate(g.link))
            .catch(setError)
    }

    function gameList(type) {
        if (!module.name) return <div/>
        return <div>
            <form onSubmit={startGame}>
                <input type="hidden" name="type" value={type}/>
                Stake:<input type="number" min={5} name="stake" className="form-control" defaultValue={module.initialStake}/>
                {props.store.authenticatedUser && <Button variant="success" type="submit" className="d-block m-auto">Start new <strong
                    className="d-block">"{module.label}"</strong> (<i>{type} balance</i>)</Button>}
            </form>

            {list.filter(g => g.type === type).map(g => <div key={g.id}><A href={g.link}>{g.name} {g.stake}</A></div>)}
        </div>
    }

    return (
        <div>
            {props.store.authenticatedUser && <GameUserInfo type={'any'} {...props}/>}
            <hr/>
            <div className="row">
                <div className="col-sm-4">
                    <Nav variant="pills" className="flex-column mb-2" onSelect={m => {
                        setModule(modules.find(m1 => m1.name === m));
                        loadList();
                    }} activeKey={module.name}>
                        {modules.map((t) => <Nav.Item key={t.name} className="nav-item">
                            <A href={`/games/${t.name}`} className={`nav-link ${t.name === props.module ? 'active' : ''}`}>{t.label}</A>
                        </Nav.Item>)}
                    </Nav>
                </div>
                <div className="col-sm">
                    <h1>{module.label}</h1>
                    {error.message && <div className="alert alert-danger">{error.message}</div>}
                    {module.testMode && <div className="alert alert-warning text-center">!!! TEST MODE !!!</div>}
                    <div className="row my-2" key={module}>
                        <div className="col">
                            {gameList('virtual')}
                        </div>
                        <div className="col">
                            {!module.testMode && gameList('real')}
                        </div>

                    </div>
                </div>
            </div>


        </div>
    )
}