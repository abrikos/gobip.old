import {useEffect, useState} from "react";
import "./banner.sass"
import ErrorPage from "components/service/ErrorPage";

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
        const timer = setInterval(loadBanners, 5000)
        return () => clearInterval(timer);
    }, [])

    function loadBanners() {
        props.store.api(type.path, type.limit)
            .then(setBanners)
    }

    if(!type) return <ErrorPage error={404}/>
    return <div>
        {/*<h1>{type.label}</h1>*/}
        <div>
            {banners.map(b => <BannerContainer key={b.id} {...b}/>)}
        </div>
    </div>
}

export function BannerContainer(b) {
    return <div className="banner"><a href={b.url} target="_blank"> <img src={b.path} alt={b.path} className="img-fluid"/></a></div>
}

