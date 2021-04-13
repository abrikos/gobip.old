import GoogleLogin from "react-google-login";
import React from "react";

export default function LoginFormGoogle(props) {
    //const [user, setUser] = useState()
    const responseGoogle = (response) => {
        props.store.api(`/login/google`, response)
            .then(() => {
                props.store.logIn()
                //.then(setUser)
            })
    }


    return <div className="m-2">
        {/*<Button onClick={test}>Test</Button>*/}
        {process.env.REACT_APP_GOOGLE_ID && <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_ID}
            render={renderProps => (
                <a href={'#'} onClick={renderProps.onClick} disabled={renderProps.disabled}>Вход</a>
            )}
            buttonText="Вход"
            onSuccess={responseGoogle}
            onFailure={console.error}
            scope="https://www.googleapis.com/auth/analytics"
        />}
    </div>
}
