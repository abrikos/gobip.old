import {useRoutes} from "hookrouter";
import routes from "Routes";
import ThemeMain from "themes/main/ThemeMain";
import ThemeAdmin from "themes/admin/ThemeAdmin";
import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "themes/common.sass"
import axios from "axios";
import f2o from "form-to-object"
import {navigate} from "hookrouter"

export default function Application() {
    const [authenticatedUser, setAuthUser] = useState(false);
    const [params, setParams] = useState({});
    const [errorGlobal, setErrorGlobal] = useState({});
    useEffect(() => {
        //let isSubscribed = true
        //startWebSocket();
        //setInterval(checkWebsocket, 1000);
        store.getParams().then(setParams)
        store.getUser().then(setAuthUser)

        //return () => isSubscribed = false;
        //const t = params.getCookie('theme');
    }, []);

    const store = {
        authenticatedUser,
        params,
        errorGlobal,
        network:params.network,
        async postData(path = '', data = {}, noLogs) {
            //setErrorGlobal({})
            const label = 'POST: ' + path;
            if(process.env.REACT_APP_LOG_ENABLE * 1 && !noLogs) console.time(label)
            const url = '/api' + path;
            return new Promise((resolve, reject) => {
                axios.post(url, data)
                    .then(res => {
                        resolve(res.data)
                        if(process.env.REACT_APP_LOG_ENABLE * 1 && !noLogs) console.timeEnd(label)
                    })
                    .catch(err => {
                        console.log(err.response)
                        const error = {
                            path,
                            error: err.response && err.response.status,
                            message: typeof err.response.data === 'object' ?  err.response.data.message : err.response.statusText
                        }
                        if(process.env.REACT_APP_LOG_ENABLE * 1) setErrorGlobal(error)
                        //resolve({error: err.response.status, message: err.response.data.message || err.response.statusText})
                        reject(error)
                    })

            })
        },

        async api(path, data, noLogs) {
            return new Promise((resolve,reject)=>{
                this.postData(path, data, noLogs)
                    .then(resolve)
                    .catch(reject)
            })
        },

        logOut() {
            setAuthUser(null)
            this.api('/logout').then(()=>window.history.back())
        },

        formToObject(form){
            return f2o(form)
        },

        logIn(redirect) {
            this.getUser()
                .then(setAuthUser)
            if(redirect){
                navigate(redirect)
            }
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
