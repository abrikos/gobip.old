import {A} from "hookrouter";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function (props) {
    if (!props.model) return 'no model';
    if (!props.model.adminLink) return 'no model.adminLink';
    return props.isAdmin || props.store.authenticatedUser.admin ?
        <A href={props.model.adminLink}><FontAwesomeIcon icon={faEdit}/></A> : ''
}
