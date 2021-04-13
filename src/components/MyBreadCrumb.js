import {Breadcrumb, BreadcrumbItem} from "react-bootstrap";
import {A} from "hookrouter";
import React from "react";

export default function MyBreadCrumb(props) {
    //if (props.items.length) props.items[props.items.length - 1].href = null;
    return <Breadcrumb>
        <BreadcrumbItem linkAs={'span'}><A key={'home'} href={'/'}>Начало</A></BreadcrumbItem>
        {props.items.map((item, i) => <BreadcrumbItem key={i} linkAs={'span'}>{item.href ?
            <A href={item.href}>{item.label}</A> : item.label}</BreadcrumbItem>)}
    </Breadcrumb>
}
