import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAward} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function WinnerSign(){
    return <h1 className="text-success m-3"><FontAwesomeIcon icon={faAward}/></h1>
}