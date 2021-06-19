import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import {A, navigate} from "hookrouter";

export default function GameList(props) {
    const [module, setModule] = useState({name:'RoPaSci'})
    const [modules, setModules] = useState([])
    const [list, setList] = useState([])


    useEffect(() => {
        loadTypes();
        loadList();
        const timer = setInterval(loadList, 5000)
        return () => clearInterval(timer);
    }, [module])


    function loadList() {
        props.store.api('/game/list', {module:module.name}, true)
            .then(setList)
    }

    function loadTypes() {
        props.store.api('/game/modules')
            .then(setModules)
    }

    function startGame(type) {
        props.store.api('/game/start', {module,type})
            .then(g=>navigate(g.link))
    }

    function gameList(type){
        return <div>
            {props.store.authenticatedUser && <Button onClick={()=>startGame(type)}>Start new {module.label} ({type})</Button>}
            {list.filter(g=>g.type===type).map(g=><div key={g.id}><A href={g.link}>{g.name}</A></div>)}
        </div>
    }

    return (
        <div>
            {JSON.stringify(modules)}
            <Nav variant="tabs" onSelect={m => {
                setModule(m);
                loadList();
            }} activeKey={module.name}>
                {modules.map((t) => <Nav.Item key={t.name} className="nav-item">
                    <Nav.Link eventKey={t.name}>{t.label}</Nav.Link>
                </Nav.Item>)}
            </Nav>

            <div className="row my-2" key={module}>
                <div className="col">
                    {gameList('virtual')}
                </div>
                <div className="col">
                    {gameList('real')}
                </div>

            </div>

        </div>
    )
}