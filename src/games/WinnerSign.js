import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAward} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function WinnerSign(){
    return <div className="w-100 h-100 border border-success text-center">
        <h1 className="text-danger m-3"><FontAwesomeIcon icon={faAward}/></h1>
        {/*<img src={winsign} alt="win sign" className="img-fluid"/>*/}
    </div>

}