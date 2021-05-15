import PropTypes from 'prop-types';
import CopyButton from "components/copy-button/CopyButton";
import {faFileInvoice} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

MinterAddressLink.propTypes = {
    address: PropTypes.string.isRequired,
};
MinterTxLink.propTypes = {
    tx: PropTypes.string.isRequired,
};


export function MinterAddressLink(props) {
    return <span><a href={props.store.network.explorer + 'address/' + props.address} target="_blank" style={{fontFamily: 'monospace'}}>{props.address}</a> <CopyButton text={props.address}/> </span>
}

export function MinterTxLink(props) {
    return <span>
        <a href={props.store.network.explorer + 'transactions/' + props.tx} target="_blank" style={{fontFamily: 'monospace'}} title={props.tx}>
        {props.tx.substr(0,10)}...
            <FontAwesomeIcon        icon={faFileInvoice}/>
    </a>

    </span>
}
