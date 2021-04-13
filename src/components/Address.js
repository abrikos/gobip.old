import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

export default function Address(props) {
    return <a href={props.link}><FontAwesomeIcon icon={faMapMarkerAlt}/> {props.label}</a>

}
