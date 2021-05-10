import React, {useEffect, useState} from 'react';
import "./cabinet.sass"
import {Button, Form, FormControl} from "react-bootstrap";

export default function CabinetUser(props) {
    const [user, setUser] = useState();
    useEffect(() => {
        props.store.api('/cabinet/user')
            .then(setUser)

    }, [props.control])

    function submit(e) {
        e.preventDefault();
        const form = props.store.formToObject(e.target)
        props.store.api('/cabinet/user/update', form)
            .then(setUser)

    }

    if (!user) return <div/>
    return <div className="cabinet">
        <div>
            <Form onSubmit={submit} className={`alert alert-${user.address ? 'success' : 'danger'}`}>
                Address for all payments from the system. {user.address ? '' : <strong>No address specified. You will not receive payments from the system!</strong>}
                <FormControl name="address" defaultValue={user.address}/>
                {/*{user.address && <MinterAddressLink address={user.address} {...props}/>}*/}
                <hr/>
                <Button type="submit">Save</Button>
            </Form>
        </div>


    </div>

}

