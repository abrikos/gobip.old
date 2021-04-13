import React from "react";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function Email(props) {
    return props.email ?
        <span className="email"><a href={`mailto:${props.email}`}><FontAwesomeIcon icon={faEnvelope}/> {props.email}</a></span> : ''

}
