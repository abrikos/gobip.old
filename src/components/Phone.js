import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPhone} from "@fortawesome/free-solid-svg-icons";

export default function Phone(props) {
    return props.phone ? <span className="phone"><a href={`tel:${props.phone}`}><FontAwesomeIcon
        icon={faPhone}/> {props.phone}</a></span> : ''

}
