import React, {useEffect, useState} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import ErrorPage from "components/service/ErrorPage";
import "./cabinet.sass"

export default function CabinetBanner(props) {
    const [user, setUser] = useState();

    useEffect(loadUser, []);

    function loadUser() {
        props.store.api('/post/999/view')
            .then(d => {
                console.log('zzzzzzzzzzzz', d)
                setUser(d)
            })
        //.catch(console.warn)
    }

    return <div>
        <h1>Banner</h1>

    </div>

}

