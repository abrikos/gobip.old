import React from 'react';
import LoginFormGoogle from "components/login/LoginFormGoogle";

export default function ErrorPage(props) {
    let message;
    const {path} = props;
    switch (props.error) {
        case 403:
            //message = <span>Доступ запрещен. Пожалуйста <GoToLogin title={'зарегистрируйтесь'} store={props.store}/>!</span>;
            //message = <span>Доступ запрещен. Зарегистрируйтесь!  <LoginFormGoogle store={props.store}/></span>;
            message = <span>{props.message}</span>;
            break;
        case 401:
            message = <span>Authorisation required <LoginFormGoogle type="button" {...props}/></span>;
            break;
        case 404:
            message = <span>Page not found</span>;
            break;
        default:
            message = props.message;

    }

    return <div className="alert alert-danger text-center">
        <strong>{props.error} {message} {path}</strong>
    </div>
};
