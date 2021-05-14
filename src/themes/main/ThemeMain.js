import React from "react";
import "themes/main/theme-main.sass"
import ThemeMainTopMenu from "./ThemeMainTopMenu";
import {A} from "hookrouter";
import {faBlender, faCoins, faCrown, faHeart, faHome, faImages, faSignInAlt, faSignOutAlt, faUserCog} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Banners} from "pages/banner/Banners";
import LoginFormGoogle from "../../components/login/LoginFormGoogle";
import ErrorPage from "../../components/service/ErrorPage";
import {YMInitializer} from "react-yandex-metrika";

export default function ThemeMain(props) {
    const links = [
        {path: '/', label: 'Home', icon: faHome},
        {path: '/poker', label: 'Pokher', icon: faHeart},
        {path: '/mixer', label: props.store.network.coin + ' Mixer', icon: faBlender},
        {path: '/lottery/winners', label: 'Banner lottery', icon: faImages},
        {path: '/bet', label: 'Crypto bets', icon: faCoins},
        {path: '/cabinet/user', label: 'Cabinet', icon: faUserCog, type: 'logged'},
        {path: '/admin/start', label: 'Admin', icon: faCrown, type: 'admin'},
        {path: '/logout', label: 'Logout', icon: faSignOutAlt, type: 'logged'},
        {path: '/login', component: <LoginFormGoogle store={props.store}/>, icon: faSignInAlt, type: 'not-logged'},

    ]

    function checkPath(p){
        const loc = document.location.pathname.match(/\/\w+/)
        const loc2 = p.match(/\/\w+/)
        if(!loc) return false;
        return loc2 && loc2[0] === loc[0];
    }

    function menuItem(l) {
        let ret = false;
        switch (l.type){
            case 'logged': ret = !props.store.authenticatedUser ; break;
            case 'admin': ret = !(props.store.authenticatedUser && props.store.authenticatedUser.admin) ; break;
            case 'not-logged': ret = props.store.authenticatedUser ; break;
            default:
        }
        if(ret) return;
        return <li key={l.path} className={checkPath( l.path) ? 'glowed' : ''}>
            <span className="icon">
                                        <FontAwesomeIcon icon={l.icon}/>
                                    </span>
            {l.path && <A href={l.path} className="d-flex align-items-center"><span>{l.label}</span></A>}
            {l.component}
        </li>
    }

    return <div>
        <ThemeMainTopMenu {...props}/>
        <div className="theme-main">
            <div className="row">
                <div className="col-sm-2">
                    <div className="block">
                        <ul className="list-unstyled column-menu">
                            {links.map(menuItem)}
                        </ul>
                    </div>

                    <div className="d-sm-block d-none">
                        <YMInitializer accounts={[75689170]}/>

                        <a href="https://metrika.yandex.ru/stat/?id=75689170&amp;from=informer"
                           target="_blank" rel="nofollow">
                            <img src="https://informer.yandex.ru/informer/75689170/3_1_FFFFFFFF_EFEFEFFF_0_pageviews"
                                                       alt="Яндекс.Метрика" title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)"
                                                   className="ym-advanced-informer" data-cid="75689170" data-lang="ru" /></a>

                    </div>


                </div>
                <div className="col-sm-8">
                    {props.store.errorGlobal.error  && <ErrorPage {...props.store.errorGlobal}/>}
                    {props.errorPage || props.routeResult}
                </div>
                <div className="col-sm-2"><Banners type={'payed'} limit={10} {...props}/></div>
            </div>

        </div>
        <footer className="bg-dark">
            <div className="footer__container u-container u-container--large"><img src="/logo.svg" alt="Minter" className="footer__logo"/>
                <div className="footer__menu">
                    <div className="footer__menu-item"><a href="https://www.minter.network/" target="_blank" rel="nofollow noopener" className="text-light">Intro</a></div>
                    <div className="footer__menu-item"><a href="https://about.minter.network/" target="_blank" rel="nofollow noopener" className="text-light">Network</a></div>
                    <div className="footer__menu-item"><a href="https://console.minter.network/" target="_blank" rel="nofollow noopener" className="text-light">Console</a></div>
                    <div className="footer__menu-item"><a href="https://status.minter.network/" target="_blank" rel="nofollow noopener" className="text-light">Status</a></div>
                    <div className="footer__menu-item"><a href="https://explorer.minter.network/" target="_blank" rel="nofollow noopener" className="text-light">Explorer</a></div>
                    <div className="footer__menu-item"><a href="https://github.com/MinterTeam" target="_blank" rel="nofollow noopener" className="text-light">API &amp; SDK</a></div>
                    <div className="footer__menu-item"><a href="https://docs.minter.network" target="_blank" rel="nofollow noopener" className="text-light">Docs</a></div>
                </div>
            </div>
        </footer>

    </div>
}
