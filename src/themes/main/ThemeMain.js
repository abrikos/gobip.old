import React from "react";
import "themes/main/theme-main.sass"
import ThemeMainTopMenu from "./ThemeMainTopMenu";
import {A} from "hookrouter";
import {faBlender, faChartLine, faCrown, faExchangeAlt, faGamepad, faHome, faImages, faQuestionCircle, faRecycle, faSignInAlt, faSignOutAlt, faUserCog} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Banners} from "pages/banner/Banners";
import LoginFormGoogle from "../../components/login/LoginFormGoogle";
import ErrorPage from "../../components/service/ErrorPage";

export default function ThemeMain(props) {
    const links = [
        {path: '/', label: 'Home', icon: faHome},
        {path: '/exchange', label: 'Exchange rates', icon: faExchangeAlt},
        {path: '/swap-routes', label: 'Swap routes', icon: faRecycle},
        {path: '/games/SeaBattle', label: 'P2P Games', icon: faGamepad},
        {path: '/mixer', label: props.store.network.coin + ' Mixer', icon: faBlender},
        {path: '/lottery/winners', label: 'Banner lottery', icon: faImages},
        {path: '/bet', label: 'Crypto bets', icon: faChartLine},
        {path: '/cabinet/user', label: 'Cabinet', icon: faUserCog, type: 'logged'},
        {path: '/admin/start', label: 'Admin', icon: faCrown, type: 'admin'},
        {path: '/support', label: 'Support', icon: faQuestionCircle, type: 'admin'},
        {path: '/logout', label: 'Logout', icon: faSignOutAlt, type: 'logged'},
        {path: '/login', component: <LoginFormGoogle {...props}/>, icon: faSignInAlt, type: 'not-logged'},


    ]

    function checkPath(p){
        const loc = document.location.pathname.match(/\/\w+/)

        const loc2 = p.match(/\/\w+/)
        if(!loc || !loc2) return false;
        return loc2[0] === loc[0];
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

    function ym(){
        return "<!-- Yandex.Metrika informer -->\n" +
            "<a href=\"https://metrika.yandex.ru/stat/?id=81116914&amp;from=informer\"\n" +
            "target=\"_blank\" rel=\"nofollow\"><img src=\"https://informer.yandex.ru/informer/81116914/3_1_FFFFFFFF_EFEFEFFF_0_pageviews\"\n" +
            "style=\"width:88px; height:31px; border:0;\" alt=\"Яндекс.Метрика\" title=\"Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)\" class=\"ym-advanced-informer\" data-cid=\"81116914\" data-lang=\"ru\" /></a>\n" +
            "<!-- /Yandex.Metrika informer -->\n" +
            "\n" +
            "<!-- Yandex.Metrika counter -->\n" +
            "<script type=\"text/javascript\" >\n" +
            "   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};\n" +
            "   m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})\n" +
            "   (window, document, \"script\", \"https://mc.yandex.ru/metrika/tag.js\", \"ym\");\n" +
            "\n" +
            "   ym(81116914, \"init\", {\n" +
            "        clickmap:true,\n" +
            "        trackLinks:true,\n" +
            "        accurateTrackBounce:true\n" +
            "   });\n" +
            "</script>\n" +
            "<noscript><div><img src=\"https://mc.yandex.ru/watch/81116914\" style=\"position:absolute; left:-9999px;\" alt=\"\" /></div></noscript>\n" +
            "<!-- /Yandex.Metrika counter -->"
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
                        <div className="text-center" dangerouslySetInnerHTML={{__html: ym()}}/>
                    </div>


                </div>
                <div className="col-sm-8">
                    {props.store.errorGlobal.error  && <ErrorPage {...props.store.errorGlobal}/>}
                    {props.errorPage || props.routeResult}
                </div>
                <div className="col-sm-2">
                    <Banners type={'payed'} limit={10} {...props}/>
                </div>
            </div>

        </div>
        <footer className="bg-dark">
            <div className="footer__container u-container u-container--large"><img src="https://explorer.minter.network/img/minter-logo-circle.svg" alt="Minter" className="footer__logo"/>
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
