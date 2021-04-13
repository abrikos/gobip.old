import React from "react";
import "themes/main/theme-main.sass"
import MenuTop from "./MenuTop";

export default function ThemeMain(props) {


    return <div>
        <div className="theme-main">
            <div>
                <h1><img src="/logo.svg" alt="Логотип" width={50}/> {process.env.REACT_APP_SITE_TITLE}</h1>
                <i>{process.env.REACT_APP_SITE_DESCRIPTION}</i>
            </div>
            {props.errorPage || props.routeResult}
            <hr/>
            <footer>
                <div className="footer__container u-container u-container--large"><img src="/logo.svg" alt="Minter" className="footer__logo"/>
                    <div className="footer__menu">
                        <div className="footer__menu-item"><a href="https://www.minter.network/" target="_blank" rel="nofollow noopener" className="footer__link link--hover">Intro</a></div>
                        <div className="footer__menu-item"><a href="https://about.minter.network/" target="_blank" rel="nofollow noopener" className="footer__link link--hover">Network</a></div>
                        <div className="footer__menu-item"><a href="https://console.minter.network/" target="_blank" rel="nofollow noopener" className="footer__link link--hover">Console</a></div>
                        <div className="footer__menu-item"><a href="https://status.minter.network/" target="_blank" rel="nofollow noopener" className="footer__link link--hover">Status</a></div>
                        <div className="footer__menu-item"><a href="https://explorer.minter.network/" target="_blank" rel="nofollow noopener" className="footer__link link--hover">Explorer</a></div>
                        <div className="footer__menu-item"><a href="https://github.com/MinterTeam" target="_blank" rel="nofollow noopener" className="footer__link link--hover">API &amp; SDK</a></div>
                        <div className="footer__menu-item"><a href="https://docs.minter.network" target="_blank" rel="nofollow noopener" className="footer__link link--hover">Docs</a></div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
}
