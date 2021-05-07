import PropTypes from 'prop-types';
import CopyButton from "components/copy-button/CopyButton";

MinterLink.propTypes = {
    address: PropTypes.string.isRequired,
};


export default function MinterLink(props){
    return <span><a href={props.store.network.explorer+'address/'+props.address} target="_blank" style={{fontFamily:'monospace'}}>{props.address}</a> <CopyButton text={props.address}/> </span>
}
