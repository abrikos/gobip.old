import PropTypes from 'prop-types';
import CopyButton from "components/copy-button/CopyButton";
import {faFileInvoice} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";

MinterAddressLink.propTypes = {
    address: PropTypes.string.isRequired,
    short: PropTypes.number,
};
MinterTxLink.propTypes = {
    tx: PropTypes.string,
};


export function MinterAddressLink(props) {
    const address = props.short ? props.address.substr(0, props.short) + '...' : props.address;
    return <span><a href={props.store.network.explorer + 'address/' + props.address} target="_blank" style={{fontFamily: 'monospace'}}>{address}</a> <CopyButton text={props.address}/> </span>
}

export function MinterTxLink(props) {
    if(!props.tx) return '';
    return <span>
        <a href={props.store.network.explorer + 'transactions/' + props.tx} target="_blank" style={{fontFamily: 'monospace'}} title={props.tx}>
        {props.tx.substr(0, 10)}...
            <FontAwesomeIcon icon={faFileInvoice}/>
    </a>

    </span>
}
