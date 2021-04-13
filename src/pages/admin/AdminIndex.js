import React from "react";
import AdminUser from "pages/admin/AdminUser";
import {A} from "hookrouter"
import ErrorPage from "components/service/ErrorPage";
import AdminStart from "pages/admin/AdminStart";
import AdminModel from "pages/admin/AdminModel";
import "./admin.sass"
import AdminPostFromUrl from "pages/admin/AdminPostFromUrl";

export default function AdminIndex(props) {
    const pages = {

        start: ['Начало', <AdminStart {...props}/>],
        post: ['Статьи', <AdminModel {...props}/>],
        postUrl: ['Статья из URL', <AdminPostFromUrl {...props}/>],
        //video:['YouTube', <AdminVideo store={props.store}/>],
        users: ['Пользователи', <AdminUser {...props}/>],
    };

    if (!props.store.authenticatedUser.admin) return <ErrorPage error={403} store={props.store}/>;

    return <div>
        <div className="d-flex">
            {Object.keys(pages).map(key => <A key={key} className={`nav-link ${key === props.control ? 'active' : ''}`} href={`/admin/${key}`}>{pages[key][0]}</A>)}
        </div>
        <div className="mt-3">
            {pages[props.control] && pages[props.control][1]}
        </div>

    </div>

}
