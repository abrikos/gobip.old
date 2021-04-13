import {useRoutes} from "hookrouter";
import routes from "Routes";
import ThemeMain from "themes/main/ThemeMain";
import ThemeAdmin from "themes/admin/ThemeAdmin";
import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import f2o from "form-to-object"

export default function Application() {
    const [authenticatedUser, setAuthUser] = useState(false);

    useEffect(() => {
        //let isSubscribed = true
        //startWebSocket();
        //setInterval(checkWebsocket, 1000);
        store.getUser()
            .then(setAuthUser)

        //return () => isSubscribed = false;
        //const t = params.getCookie('theme');
    }, []);

    const store = {
        authenticatedUser,
        async postData(path = '', data = {}) {
            const label = new Date().valueOf() + ' - POST ' + path;
            console.time(label)
            const url = '/api' + path;
            return new Promise((resolve, reject) => {
                axios.post(url, data)
                    .then(res => {
                        resolve(res.data)
                        console.timeEnd(label)
                    })
                    .catch(err => {
                        reject({error: err.response.status, message: err.response.data.message || err.response.statusText})
                    })

            })
        },

        async api(path, data) {
            return await this.postData(path, data)
        },

        logOut() {
            setAuthUser(null)
            this.api('/logout').then(()=>window.history.back())
        },

        formToObject(form){
            return f2o(form)
        },

        logIn() {
            this.getUser()
                .then(setAuthUser)
        },

        async getUser() {
            const user = await this.postData('/user/authenticated');
            if (!user.error) {
                return user;
            } else {
                console.warn(user.error)
            }
        },
    }

    let routeResult = useRoutes(routes(store));
    const admin = window.location.pathname.match(/^\/editor/);
    return (
        <div className="App">
            {!admin && <ThemeMain routeResult={routeResult} store={store}/>}
            {admin && <ThemeAdmin routeResult={routeResult} store={store}/>}
        </div>
    );
}
