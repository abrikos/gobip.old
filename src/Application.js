import {useRoutes} from "hookrouter";
import routes from "Routes";
import ThemeMain from "themes/main/ThemeMain";
import ThemeAdmin from "themes/admin/ThemeAdmin";
import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "themes/common.sass"
import axios from "axios";
import f2o from "form-to-object"

export default function Application() {
    const [authenticatedUser, setAuthUser] = useState(false);
    const [params, setParams] = useState({});
    useEffect(() => {
        //let isSubscribed = true
        //startWebSocket();
        //setInterval(checkWebsocket, 1000);
        store.getParams()
            .then(setParams)
        store.getUser()
            .then(setAuthUser)

        //return () => isSubscribed = false;
        //const t = params.getCookie('theme');
    }, []);

    const store = {
        authenticatedUser,
        params,
        network:params.network,
        async postData(path = '', data = {}, noLogs) {

            const label = 'POST: ' + path;
            if(!(process.env.REACT_APP_API_LOG_DISABLE * 1) && !noLogs) console.time(label)
            const url = '/api' + path;
            return new Promise((resolve, reject) => {
                axios.post(url, data)
                    .then(res => {
                        resolve(res.data)
                        if(!(process.env.REACT_APP_API_LOG_DISABLE * 1) && !noLogs) console.timeEnd(label)
                    })
                    .catch(err => {
                        //resolve({error: err.response.status, message: err.response.data.message || err.response.statusText})
                        reject({error: err.response.status, message: err.response.data.match("<html>") ? err.response.statusText : err.response.data})
                    })

            })
        },

        async api(path, data, noLogs) {
            return await this.postData(path, data, noLogs)
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
        async getParams(){
            return this.postData('/params');
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
    if(!store.network) return <div>Application</div>
    return (
        <div className="App">
            {!admin && <ThemeMain routeResult={routeResult} store={store}/>}
            {admin && <ThemeAdmin routeResult={routeResult} store={store}/>}
        </div>
    );
}
