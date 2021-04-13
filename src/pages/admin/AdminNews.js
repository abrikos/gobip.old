import React, {useState} from "react";
import PostList from "pages/news/PostList";
import PostUpdate from "pages/news/PostUpdate";
import {Button, Nav, NavItem} from "react-bootstrap";
import {navigate} from "hookrouter"

export default function AdminNews(props) {
    const navs = [
        {label: 'Новости', filter: {where: {isMassMedia: {$ne: true}}}},
        {label: 'Сми о нас', filter: {where: {isMassMedia: true}}},
        {label: 'Выборы', filter: {where: {isElection: true}}},
    ]
    const [filter, setFilter] = useState(navs[0].filter)
    const [nav, setNav] = useState(0)


    function changeFilter(i, f) {
        setNav(i)
        setFilter(f)
    }

    function create() {
        props.store.api('/post/create')
            .then(post => navigate(`/admin/news/${post.id}/update`))
    }

    return <div>


        <h1 className="text-danger">Редактирование новостей</h1>
        {!!props.id || <div>
            <Nav tabs>
                {navs.map((d, i) => <NavItem key={i}><span className={`nav-link  ${nav === i ? 'active' : ''}`}
                                                           onClick={() => changeFilter(i, d.filter)}>{d.label}</span></NavItem>)}
            </Nav>
            <Button onClick={create}>Создать новость</Button>
            <PostList key={JSON.stringify(filter)} isAdmin={true} filter={filter} store={props.store}/>
        </div>}

        <PostUpdate key={props.id} store={props.store}/>


    </div>

}
