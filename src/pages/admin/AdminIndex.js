import React from 'react';
import MyBreadCrumb from "components/MyBreadCrumb";
import {A} from "hookrouter";
import AdminUser from "./AdminUser";
import AdminStart from "./AdminStart";

export default function AdminIndex(props) {
    const pages = {
        start: {label: 'Start'},
        users: {label: 'Users'},
    }


    return <div className="cabinet">
        <div>
            <div >{Object.keys(pages).map(p => <span key={p}  className={`m-2 ${p===props.control ? 'glowed':''}`}><A href={`/admin/${p}`}>{pages[p].label}</A></span>)}</div>
            <hr/>
            <div>
                {props.control === 'start' && <AdminStart {...props}/>}
                {props.control === 'users' && <AdminUser {...props}/>}
            </div>
        </div>


    </div>

}

