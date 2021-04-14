import React from "react";
import "themes/main/theme-main.sass"
import MenuTop from "./MenuTop";

export default function ThemeMain(props) {


    return <div>
        <MenuTop {...props}/>
        <div className="theme-main">
            {props.errorPage || props.routeResult}
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
