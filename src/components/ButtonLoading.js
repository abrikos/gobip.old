import {Button} from "react-bootstrap";
import {useState} from "react";
import Loader from "./Loader";
import PropTypes from "prop-types";

ButtonLoading.propTypes = {
    url: PropTypes.string.isRequired,
    data: PropTypes.object,
    onFinish: PropTypes.func,
    onError: PropTypes.func,
    variant: PropTypes.string,
    confirmMessage: PropTypes.string,
};


export default function ButtonLoading(props){
    const [loading, setLoading] = useState(false)
    const {url, data, onFinish, onError, children, variant, confirmMessage} = props;
    function post(){
        if(loading) return;
        if(confirmMessage && !window.confirm(confirmMessage)) return
        setLoading(true)
        props.store.api(url,data)
            .then(r=> {
                onFinish && onFinish(r);
                setLoading(false)
            })
            .catch(e=>{
                onError && onError(e)
                setLoading(false)
            })
    }
    
    return <Button variant={variant} size={props.size} onClick={post}>{loading ? <Loader/> : children}</Button>
}