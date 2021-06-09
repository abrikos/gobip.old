import {Button, Form, InputGroup} from "react-bootstrap";
import React, {useState} from "react";
import PropTypes from "prop-types";
import Loader from "./Loader";


InputButtonLoading.propTypes = {
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    buttonText: PropTypes.string,
    onFinish: PropTypes.func,
};

export default function InputButtonLoading(props) {
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    const handleSubmit = (event) => {
        setLoading(true);
        event.preventDefault();
        const form = props.store.formToObject(event.target);
        console.log(event.currentTarget.checkValidity())
        if (event.currentTarget.checkValidity() === false) {
            event.stopPropagation();
        }
        props.store.api(props.url,form)
            .then(r=>{
                setError(null)
                props.onFinish && props.onFinish(r);
                setLoading(false);
            })
            .catch(e=>{
                setError(e.message)
                setLoading(false);
            })
        setValidated(true);

    };

    return <Form onSubmit={handleSubmit} validated={validated} noValidate>
            <InputGroup>
                {props.label && <InputGroup.Prepend>
                    <InputGroup.Text>{props.label}</InputGroup.Text>
                </InputGroup.Prepend>}
                <Form.Control required name={props.name} placeholder={props.placeholder} defaultValue={props.value}/>
                <InputGroup.Append>
                    <Button type="submit">{loading ? <Loader/> : props.buttonText}</Button>
                </InputGroup.Append>
            </InputGroup>
            {error && <div className="text-danger">{error}</div>}
    </Form>
}
