import PropTypes from 'prop-types';
import CopyButton from "components/copy-button/CopyButton";

MinterLink.propTypes = {
    address: PropTypes.string.isRequired,
    explorer: PropTypes.string.isRequired,
};


export default function MinterLink(props){
    return <span><CopyButton text={props.address}/> <a href={props.explorer+'address/'+props.address} target="_blank" style={{fontFamily:'monospace'}}>{props.address}</a></span>
}
