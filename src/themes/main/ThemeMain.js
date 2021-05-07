import React from "react";
import "themes/main/theme-main.sass"
import MenuTop from "./MenuTop";
import {A} from "hookrouter";
import {faBlender, faImages} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Banners} from "pages/banner/Banners";

export default function ThemeMain(props) {
    const links = {
        '/mixer':{label:'Mixer', icon: faBlender},
        '/banners/lottery':{label:'Banners', icon: faImages},
    }

    return <div>
        <MenuTop {...props}/>
        <div className="theme-main">
            <div className="row">
                <div className="col-sm-2">
                    <div className="block">
                        <ul className="list-unstyled column-menu">
                            {Object.keys(links).map(l=><li key={l} className={document.location.pathname===l?'selected':''}><A href={l}><span className="icon"><FontAwesomeIcon  icon={links[l].icon}/></span> {links[l].label}</A></li>)}

                        </ul>
                    </div>
                    <div className="d-sm-block d-none">
                        <Banners type={'payed'} limit={10} {...props}/>
                    </div>


                </div>
                <div className="col-sm-10">{props.errorPage || props.routeResult}</div>
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
