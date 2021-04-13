import React from "react";
import Home from "pages/home/home";
import PostList from "pages/post/PostList";
import Logout from "components/login/Logout";
import ErrorPage from "components/service/ErrorPage";
import AdminIndex from "pages/admin/AdminIndex";
import Login from "components/login/login";
import Cabinet from "pages/cabinet/cabinet";
import PostView from "pages/post/PostView";

export default function Routes(store) {
    const routes = {
        "/": () => <Home store={store}/>,
        "/graphs": () => <PostList key={'news'} title="Новости" modelName="post" filter={{order: {createdAt: -1}}} store={store}/>,
        "/post/:id/:head": (params) => <PostView store={store} {...params}/>,
        "/login": () => <Login store={store}/>,

        //"/persons/:type": (params) => <PersonListLarge {...params} store={store}/>,

    };

    const routesLogged = {
        "/cabinet": () => <Cabinet store={store}/>,
        "/logout": () => <Logout store={store}/>,
    }

    const routesEditor = {}

    const routesAdmin = {
        "/admin/:control": (params) => <AdminIndex {...params} store={store}/>,
        "/admin/:control/:id/update": (params) => <AdminIndex {...params} store={store}/>,
        "/admin": () => <AdminIndex store={store}/>,
    }


    for (const path of Object.keys(routesLogged)) {
        routes[path] = store.authenticatedUser ? routesLogged[path] : () => <ErrorPage error={401} store={store}/>;
    }
    for (const path of Object.keys(routesEditor)) {
        routes[path] = store.authenticatedUser ?
            store.authenticatedUser.editor || store.authenticatedUser.admin ? routesEditor[path] : () => <ErrorPage error={403} store={store} message={'Доступ разрешен только редакторам'}/>
            :
            () => <ErrorPage error={401} store={store}/>
        ;
    }
    for (const path of Object.keys(routesAdmin)) {
        routes[path] = store.authenticatedUser ?
            store.authenticatedUser.admin ? routesAdmin[path] : () => <ErrorPage error={403} store={store} message={'Доступ разрешен только администраторам'}/>
            :
            () => <ErrorPage error={401} store={store}/>
        ;
    }
    return routes;
}
