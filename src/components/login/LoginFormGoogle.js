import GoogleLogin from "react-google-login";
import React from "react";

export default function LoginFormGoogle(props) {
    //const [user, setUser] = useState()
    const responseGoogle = (response) => {
        console.log(response)
        props.store.api(`/login/google`, response)
            .then(() => {
                props.store.logIn()
                //.then(setUser)
            })
    }


    return <span className={props.className + ' pointer'}>
        {/*<Button onClick={test}>Test</Button>*/}
        {process.env.REACT_APP_GOOGLE_ID && <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_ID}
            render={renderProps => (
                <span className="pointer" onClick={renderProps.onClick} disabled={renderProps.disabled}>Login</span>
            )}
            buttonText="Вход"
            onSuccess={responseGoogle}
            onFailure={console.error}
            scope="https://www.googleapis.com/auth/analytics"
        />}
    </span>
}
