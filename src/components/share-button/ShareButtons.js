import React from "react";
import Icons from "./social.jpg";
import "./share-button.sass"
import CopyButton from "components/copy-button/CopyButton";

export default function ShareButtons(props) {
    const link = window.location.origin + props.link;
    const blogs = [
        {row: 0, col: 1, link: 'https://vk.com/share.php?url='},
        {row: 0, col: 2, link: 'https://www.facebook.com/sharer/sharer.php?u='},
        {row: 3, col: 1, link: 'https://api.whatsapp.com/send?text='},
        {row: 3, col: 2, link: 'https://telegram.me/share/url?url='},
        {row: 2, col: 2, link: 'https://connect.ok.ru/offer?url='},
    ];
    const params = {
        cols: 6,
        offsetX: 102,
        offsetY: 20,
        iconWidth: 113,
        iconHeight: 113,
        spaceX: 28,
        spaceY: 27,
        percent: .4
    };


    return <div>
        <div className="alert alert-info">
            <code className="m-2">{link}</code>
            <CopyButton text={link}/>
        </div>
        {!props.noSocial && <div className="share-button d-flex justify-content-center flex-wrap">
            <h3 className="text-center">Поделись с друзьями</h3>
            {blogs.map((b, i) => {
                const x = params.offsetX + (params.iconWidth + params.spaceX) * b.col;
                const y = params.offsetY + (params.iconHeight + params.spaceY) * b.row;
                const style = {
                    width: params.iconWidth,
                    height: params.iconHeight,
                    backgroundImage: `url(${Icons})`,
                    transform: `scale(${params.percent})`,
                    backgroundPosition: `-${x}px -${y}px`,
                    cursor: 'pointer'
                };
                return <a key={i} className="share-icon" style={style} href={b.link + encodeURIComponent(link)}
                          target="_blank" rel="noopener noreferrer">{' '}</a>
            })}
        </div>}
        {/*<img src={Icons} className="border"/>*/}

    </div>


}
