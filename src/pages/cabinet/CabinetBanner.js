import React, {useEffect, useRef, useState} from 'react';
import "./cabinet.sass"
import {Button, FormControl} from "react-bootstrap";
import Loader from "components/Loader";
import {MinterAddressLink} from "components/MinterLink";
import {BannerContainer} from "pages/banner/Banners";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";


export default function CabinetBanner(props) {
    const [banners, setBanners] = useState();
    const [loader, setLoader] = useState(false);
    const [errors, setErrors] = useState([]);
    const [amounts, setAmounts] = useState({});
    const nameRef = useRef()

    useEffect(() => {
        loadData();
        const timer = setInterval(loadData, 5000)
        return () => clearInterval(timer);
    }, []);

    function loadData() {
        props.store.api('/banner/lottery/amounts')
            .then(setAmounts)

        props.store.api('/cabinet/banner/list')
            .then(setBanners)
        //.catch(console.warn)
    }

    function createBanner() {
        props.store.api('/cabinet/banner/create')
            .then(b => {
                console.log(b)
                loadData()
            })
    }

    function _handleImageChange(e) {
        setLoader(true)
        e.preventDefault();
        setErrors([])
        for (const file of e.target.files) {
            /*let reader = new FileReader();
            reader.onloadend = () => {

                console.log(1,items)
                items.push(reader.result);
                //setImagesUploaded(ims);
            };*/
            const formData = new FormData();
            formData.append('file', file);
            console.log(file)
            //formData.append('tokens', tokens);

            props.store.api('/cabinet/banner/create', formData)
                .then(image => {
                    loadData();
                    setLoader(false)
                })
                .catch(e => {
                    const errs = errors;
                    const {message} = e;
                    const {name, size, type} = file;
                    errs.push({message, name, size, type})
                    setErrors(errs)
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

    function deleteBanner(b) {
        if (window.confirm(`Delete banner ${b.wallet.address} URL: ${b.url}?`))
            props.store.api(`/cabinet/banner/${b.id}/delete`,)
                .then(loadData)
    }

    if (!banners) return <div/>
    return <div>
        <h1>Banners</h1>
        <div className="alert alert-primary">{amounts.prize - amounts.total} {props.store.network.coin} left until the next round of the lottery. Lottery
            prize: {amounts.prize} {props.store.network.coin}</div>
        <div className="alert alert-info">Upload an image, enter the url, translate it to an address of at least {process.env.REACT_APP_BANNER_PRICE} {props.store.network.coin} and your banner will
            appear at the top of the block. The next paid banner will move your banner down.
        </div>
        {loader ? <Loader/> : <div>
            <input type="file" ref={nameRef} multiple={true} onChange={_handleImageChange}
                   className="d-none"/>
            <Button onClick={openDialog}>Upload banner (max 50Kb)</Button>
            {!!errors.length && <div className="alert alert-danger">{errors.map((e, i) => <div key={i}>File: {e.name}, {e.message} ({(e.size / 1024).toFixed(1)}Kb)</div>)}</div>}
        </div>}

        {banners.map(b => <div key={b.id} className={`row mb-2 ${b.payDate ? '' : 'border border-danger'}`}>
            <div className="col-sm-1   text-right">{b.wallet.balance}{props.store.network.coin}</div>
            <div className="col-sm-7  ">
                <MinterAddressLink address={b.wallet.address} {...props}/>
                <FormControl placeholder="Input any URL" id={b.id} onChange={setUrl} defaultValue={b.url}/>
                {b.url && <a href={b.url} target="_blank">link</a>}
            </div>
            <div className="col-sm-2">
                <BannerContainer {...b}/>
            </div>
            <div className="col-sm-2  ">
                <Button variant="danger" size="sm" onClick={() => deleteBanner(b)}><FontAwesomeIcon icon={faTrash}/></Button>
            </div>
        </div>)}


    </div>

}

