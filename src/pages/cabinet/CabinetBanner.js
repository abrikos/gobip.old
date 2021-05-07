import React, {useEffect, useRef, useState} from 'react';
import "./cabinet.sass"
import {Button, FormControl} from "react-bootstrap";
import Loader from "components/Loader";
import MinterLink from "components/MinterLink";
import {BannerContainer} from "pages/banner/Banners";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";


export default function CabinetBanner(props) {
    const [banners, setBanners] = useState();
    const [filesDeclined, setImagesDeclined] = useState([]);
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(false);
    const nameRef = useRef()

    useEffect(() => {
        loadBanners();
        const timer = setInterval(loadBanners, 5000)
        return () => clearInterval(timer);
    }, []);

    function loadBanners() {
        props.store.api('/cabinet/banner/list')
            .then(d => {
                setBanners(d)
            })
        //.catch(console.warn)
    }


    function createBanner() {
        props.store.api('/cabinet/banner/create')
            .then(b => {
                console.log(b)
                loadBanners()
            })
    }

    function _handleImageChange(e) {
        setLoader(true)
        e.preventDefault();
        for (const file of e.target.files) {
            /*let reader = new FileReader();
            reader.onloadend = () => {

                console.log(1,items)
                items.push(reader.result);
                //setImagesUploaded(ims);
            };*/
            const formData = new FormData();
            formData.append('file', file);
            //formData.append('tokens', tokens);

            props.store.api('/cabinet/banner/create', formData)
                .then(image=>{
                    setError(null)
                    loadBanners();
                    setLoader(false)
                })
                .catch(e=>{
                    setError(e.message)
                    setLoader(false)
                })
        }

    }

    function openDialog() {
        nameRef.current.click()
    }

    function setUrl(e) {
        props.store.api(`/cabinet/banner/${e.target.id}/update`, {url: e.target.value})
            .then(console.log)
    }

    function deleteBanner(b){
        if(window.confirm(`Delete banner ${b.wallet.address} URL: ${b.url}?`))
        props.store.api(`/cabinet/banner/${b.id}/delete`,)
            .then(loadBanners)
    }

    if(!banners) return <div/>
    return <div>
        <h1>Banners</h1>
        <div className="alert alert-info">Upload an image, enter the url, translate it to an address of at least {process.env.REACT_APP_BANNER_PRICE}{props.store.network.coin} and your banner will appear at the top of the block. The next paid banner will move your banner down.</div>
        {loader ? <Loader/> : <div>
            <input type="file" ref={nameRef} multiple={props.multiple} onChange={_handleImageChange}
                   className="d-none"/>
            <Button onClick={openDialog}>Upload banner</Button>
            {error && <div className="alert alert-danger">{error}</div>}
        </div>}

        {banners.map(b => <div key={b.id} className={`row mb-2 ${b.payDate ? '' : 'border border-danger'}`}>
            <div className="col-sm-1   text-right">{b.wallet.balance}{props.store.network.coin}</div>
            <div className="col-sm-7  ">
                <MinterLink address={b.wallet.address} {...props}/>
                <FormControl placeholder="Input any URL" id={b.id} onChange={setUrl} defaultValue={b.url}/>
                {b.url && <a href={b.url} target="_blank">link</a> }
            </div>
            <div className="col-sm-2  ">
                <BannerContainer {...b}/>
            </div>
            <div className="col-sm-2  ">
                <Button variant="danger" size="sm" onClick={()=>deleteBanner(b)}><FontAwesomeIcon  icon={faTrash}/></Button>
            </div>
        </div>)}


    </div>

}

