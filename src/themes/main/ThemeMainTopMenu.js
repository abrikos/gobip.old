import React from 'react';
import "themes/main/menu-top.sass"
import {A} from "hookrouter"
import {Navbar} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import LoginFormGoogle from "components/login/LoginFormGoogle";

export default function ThemeMainTopMenu(props) {
    const items = [
        //{label: "Нагрузка онлайн", href: "/resource"},
        //{label: "Home", href: "/"},
        //{label: "Видео", items: [{label: "Level 1", href: "/zzz"}, {label: "Level 2", href: "/zzz"}]},
        //{label: "АДМИН", href: "/admin/start", hidden: !(props.store.authenticatedUser && props.store.authenticatedUser.admin)},
        {label: props.store.authenticatedUser && props.store.authenticatedUser.name, href: "/cabinet/user", hidden: !(props.store.authenticatedUser)},

    ];
    return <Navbar bg="dark" expand="lg">
        <Navbar.Brand className="text-light"><img src="/logo.svg" alt="Логотип" width={50}/> {process.env.REACT_APP_SITE_TITLE}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
                {items.filter(i=>!i.hidden).map((item, i) => item.items ?
                    <NavDropdown title={item.label} id="basic-nav-dropdown" key={i}>
                        {item.items.map((item2, i2) => <NavDropdown.Item key={i2} as={"span"}><A href={item2.href}>{item2.label}</A></NavDropdown.Item>)}
                    </NavDropdown>
                    :
                    <Nav.Link as={"span"} key={i}><A href={item.href} className="text-light">{item.label}</A></Nav.Link>)}
                <Nav.Item className="nav-link">
                    {props.store.authenticatedUser ? <A href="/logout" className={'text-light'}>Logout</A> : <LoginFormGoogle className="text-light" {...props}/>}
                </Nav.Item>
            </Nav>
            {/*<Form inline>
                <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                <Button variant="outline-success">Search</Button>
            </Form>*/}
        </Navbar.Collapse>
    </Navbar>
}
