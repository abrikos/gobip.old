import React from "react";
import Home from "pages/home/home";
import Logout from "components/login/Logout";
import ErrorPage from "components/service/ErrorPage";
import AdminIndex from "pages/admin/AdminIndex";
import Login from "components/login/login";
import Cabinet from "pages/cabinet/cabinet";
import PostView from "pages/post/PostView";
import UnboundCharts from "pages/UnboundCharts";
import Mixer from "pages/Mixer";

export default function Routes(store) {
    const routes = {
        "/": () => <Home store={store}/>,
        "/unbound": () => <UnboundCharts store={store}/>,
        "/mixer": () => <Mixer store={store}/>,
        "/post/:id/:head": (params) => <PostView store={store} {...params}/>,
        "/login": () => <Login store={store}/>,
    };

    const routesLogged = {
        "/cabinet": (params) => <Cabinet store={store} {...params}/>,
        "/cabinet/:control": (params) => <Cabinet store={store} {...params}/>,
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
            store.authenticatedUser.editor || store.authenticatedUser.admin ? routesEditor[path] : () => <ErrorPage error={403} store={store} message={'Access for editors only'}/>
            :
            () => <ErrorPage error={401} store={store}/>
        ;
    }
    for (const path of Object.keys(routesAdmin)) {
        routes[path] = store.authenticatedUser ?
            store.authenticatedUser.admin ? routesAdmin[path] : () => <ErrorPage error={403} store={store} message={'Access for administrators only'}/>
            :
            () => <ErrorPage error={401} store={store}/>
        ;
    }
    return routes;
}
