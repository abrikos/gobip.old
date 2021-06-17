import React, {useEffect, useState} from 'react';
import "./cabinet.sass"
import {Button, Form, FormControl} from "react-bootstrap";
import UserAvatar from "./UserAvatar";

export default function CabinetUser(props) {
    const [user, setUser] = useState(props.user);

    function submit(e) {
        e.preventDefault();
        const form = props.store.formToObject(e.target)
        props.store.api('/cabinet/user/update', form)
            .then(setUser)

    }

    if (!user) return <div/>
    return <div className="cabinet">
        <div>
            <Form onSubmit={submit}>
                <div className={`${user.address ? 'text-success' : 'text-danger'}`}>
                    Address for all payments from the system. {user.address ? '' : <strong>No address specified. You will not receive payments from the system!</strong>}
                    <FormControl name="address" defaultValue={user.address}/>
                </div>

                <div>
                    Nickname
                    <FormControl name="name" defaultValue={user.name}/>
                </div>
                <div>Photo
                    <FormControl name="photo" defaultValue={user.photo}/>
                </div>
                <div className="d-flex justify-content-center">
                    <UserAvatar {...user}/>
                </div>


                <hr/>
                <Button type="submit">Save</Button>
            </Form>
        </div>


    </div>

}

