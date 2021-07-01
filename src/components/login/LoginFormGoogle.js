import GoogleLogin from "react-google-login";
import React from "react";
import {Button} from "react-bootstrap";

export default function LoginFormGoogle(props) {
    const responseGoogle = (response) => {
        console.log(response)
        props.store.api(`/login/google`, response)
            .then(() => {
                props.store.logIn(props.redirect)
                //.then(setUser)
            })
    }
    const label = props.label || 'Login';

    return <span className={props.className + ' pointer'}>
        {/*<Button onClick={test}>Test</Button>*/}
        {props.store && props.store.params.googleId && <GoogleLogin
            clientId={props.store.params.googleId}
            render={renderProps => {
                if(props.type==='button')
                    return <Button onClick={renderProps.onClick} disabled={renderProps.disabled}>{label}</Button>
                return <span className="pointer" onClick={renderProps.onClick} disabled={renderProps.disabled}>{label}</span>
            }}
            buttonText="Вход"
            onSuccess={responseGoogle}
            onFailure={console.error}
            scope="https://www.googleapis.com/auth/analytics"
        />}
    </span>
}
