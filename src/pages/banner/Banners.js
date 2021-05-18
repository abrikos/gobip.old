import {useEffect, useState} from "react";
import "./banner.sass"

export function Banners(props) {
    const [banners, setBanners] = useState([]);
    const types = {
        payed: {label: '', path:'/banner/payed', limit:{limit: props.limit}},
        lottery: {label: 'Winning banners', path:'/banner/lottery/winners'}
    }
    const type = types[props.type];

    useEffect(() => {
        if(!type) return;
        loadBanners();
        const timer = setInterval(loadBanners, 1000)
        return () => clearInterval(timer);
    }, [])

    function loadBanners() {
        props.store.api(type.path, type.limit, true)
            .then(setBanners)
    }


    return <div>
        <div>
            {banners.map(b => <BannerContainer key={b.id} {...b}/>)}
        </div>
    </div>
}

export function BannerContainer(b) {
    return <div className="banner"><a href={b.url} target="_blank"> <img src={b.path} alt={b.path} className="img-fluid"/></a></div>
}

