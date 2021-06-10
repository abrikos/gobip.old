import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import {A, navigate} from "hookrouter";

export default function GameList(props) {
    const [module, setModule] = useState('RoPaSci')
    const [modules, setModules] = useState([])
    const [list, setList] = useState([])


    useEffect(() => {
        loadTypes();
        loadList();
        const timer = setInterval(loadList, 5000)
        return () => clearInterval(timer);
    }, [module])


    function loadList() {
        props.store.api('/game/list', {module}, true)
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
            {props.store.authenticatedUser && <Button onClick={()=>startGame(type)}>Start new {module} ({type})</Button>}
            {list.filter(g=>g.type===type).map(g=><div key={g.id}><A href={g.link}>{g.name}</A></div>)}
        </div>
    }

    return (
        <div>
            <Nav variant="tabs" onSelect={m => {
                setModule(m);
                loadList();
            }} activeKey={module}>
                {modules.map((t) => <Nav.Item key={t} className="nav-item">
                    <Nav.Link eventKey={t}>{t}</Nav.Link>
                </Nav.Item>)}
            </Nav>

            <div className="row" key={module}>
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