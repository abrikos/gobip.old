import {useEffect, useState} from "react";
import "./banner.sass"

export default function Banners(props){
    const [banners, setBanners] = useState([]);
    useEffect(()=>{
        loadBanners();
        const timer = setInterval(loadBanners, 5000)
        return () => clearInterval(timer);
    },[])

    function loadBanners(){
        props.store.api('/banners',{limit:props.limit})
            .then(setBanners)
    }

    function sort(b,a){
        return a.wallet.updatedAt < b.wallet.updatedAt ? -1 : a.wallet.updatedAt > b.wallet.updatedAt ? 1 : 0
    }

    if(!banners.length) return <div/>;
    return <div className="banners">
        {banners.sort(sort).map(b=><BannerContainer key={b.id} {...b}/>)}
    </div>
}

export function BannerContainer(b){
    return <div className="banner"><a href={b.url} target="_blank"> <img src={b.path} alt={b.path} className="img-fluid"/></a></div>
}
