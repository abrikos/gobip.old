import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAward} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function WinnerSign(){
    return <h1 className="text-success"><FontAwesomeIcon icon={faAward}/></h1>
}