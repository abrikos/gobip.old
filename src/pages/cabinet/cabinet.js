import React, {useEffect, useState} from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import ErrorPage from "components/service/ErrorPage";
import "./cabinet.sass"

export default function Cabinet(props) {
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

    if (!props.store.authenticatedUser) return <ErrorPage {...{error: 403, message: 'Доступ запрещен'}}/>;
    return <div>
        <MyBreadCrumb items={[
            {label: 'Кабинет'},
            {label: 'Буфет', href: '/zzzzz'},
        ]}/>
        Gogo9999
        {JSON.stringify(user)}

    </div>

}

