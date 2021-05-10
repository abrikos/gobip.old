import React, {useEffect, useState} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import {A} from "hookrouter";
import "./cabinet.sass"
import MixerCabinet from "pages/mixer/MixerCabinet";
import BannerCabinet from "pages/banner/BannerCabinet";
import BetCabinet from "../bet/BetCabinet";
import {MinterAddressLink} from "../../components/minter/MinterLink";
import {Button, Form, FormControl} from "react-bootstrap";

export default function CabinetUser(props) {
    const [user, setUser] = useState();
    useEffect(() => {
        props.store.api('/cabinet/user')
            .then(setUser)

    }, [props.control])

    function submit(e){
        e.preventDefault();
        const form = props.store.formToObject(e.target)
        props.store.api('/cabinet/user/update', form)
            .then(setUser)

    }

    if(!user) return <div/>
    return <div className="cabinet">
        <div>
            <h1>My data</h1>

            <Form onSubmit={submit}>
                Address for all payments from the system
                <FormControl name="address" defaultValue={user.address}/>
                {/*{user.address && <MinterAddressLink address={user.address} {...props}/>}*/}
                <hr/>
                <Button type="submit">Save</Button>
            </Form>
        </div>


    </div>

}

