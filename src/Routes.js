import React from "react";
import Home from "pages/home/home";
import Logout from "components/login/Logout";
import ErrorPage from "components/service/ErrorPage";
import AdminIndex from "pages/admin/AdminIndex";
import Login from "components/login/login";
import Cabinet from "pages/cabinet/cabinet";
import UnboundCharts from "pages/UnboundCharts";
import Mixer from "pages/mixer/Mixer";
import {Banners} from "pages/banner/Banners";
import BannerLottery from "./pages/banner/BannerLottery";
import BetList from "./pages/bet/BetList";
import BetView from "./pages/bet/BetView";
import GameList from "./games/GameList";
import GamePlay from "./games/GamePlay";
import SwapRoutes from "./pages/swap-route/SwapRoute";
import Exchange from "./pages/exchange/Exchange";
import Support from "./pages/Support";

export default function Routes(store) {
    const routes = {
        "/": () => <Home store={store}/>,
        "/support": () => <Support store={store}/>,
        "/unbound": () => <UnboundCharts store={store}/>,
        "/exchange": () => <Exchange store={store}/>,
        "/mixer": () => <Mixer store={store}/>,
        "/bet": () => <BetList store={store}/>,
        "/bet/:id": (params) => <BetView store={store}  {...params}/>,
        "/banners/:type": (params) => <Banners limit={100} store={store}  {...params}/>,
        "/lottery/winners": (params) => <BannerLottery store={store}  {...params}/>,
        "/games": (params) => <GameList store={store} {...params}/>,
        "/games/:module": (params) => <GameList store={store} {...params}/>,
        "/swap-routes": (params) => <SwapRoutes store={store} {...params}/>,
        "/game/:module/:id": (params) => <GamePlay store={store} {...params}/>,
        "/login": () => <Login store={store}/>,
    };

    const routesLogged = {
        "/cabinet/:control": (params) => <Cabinet store={store} {...params}/>,
        "/cabinet/:control/:id": (params) => <Cabinet store={store} {...params}/>,
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
