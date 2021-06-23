import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import {A, navigate} from "hookrouter";
import GameUserInfo from "./GameUserInfo";

export default function GameList(props) {
    const [module, setModule] = useState({})
    const [modules, setModules] = useState([])
    const [list, setList] = useState([])


    useEffect(() => {
        if (!modules.length) loadTypes();
        loadList();
        const timer = setInterval(loadList, 5000)
        return () => clearInterval(timer);
    }, [module.name])


    function loadList() {
        if (!module) return;
        props.store.api('/game/list', {module: module.name}, true)
            .then(setList)
    }

    function loadTypes() {
        props.store.api('/game/modules')
            .then(r => {
                setModules(r);
                props.module && setModule(r.find(m => m.name === props.module))
            })
    }

    function startGame(type) {
        props.store.api('/game/start', {module, type})
            .then(g => navigate(g.link))
    }

    function gameList(type) {
        if(!module.name) return <div/>
        return <div>
            {props.store.authenticatedUser && <Button onClick={() => startGame(type)} className="d-block m-auto">Start new <strong className="d-block">"{module.label}"</strong> (<i>{type} balance</i>)</Button>}
            {list.filter(g => g.type === type).map(g => <div key={g.id}><A href={g.link}>{g.name}</A></div>)}
        </div>
    }

    return (
        <div>
            {props.store.authenticatedUser && <GameUserInfo type={'any'} {...props}/>}
            <hr/>
            <Nav variant="tabs" className="mb-2" onSelect={m => {
                setModule(modules.find(m1 => m1.name === m));
                loadList();
            }} activeKey={module.name}>
                {modules.map((t) => <Nav.Item key={t.name} className="nav-item">
                    <Nav.Link eventKey={t.name}>{t.label}</Nav.Link>
                </Nav.Item>)}
            </Nav>
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
    )
}