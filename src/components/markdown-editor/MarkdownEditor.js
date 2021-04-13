import React, {useEffect, useState} from "react";
import "./markdown.sass"
import MarkDown from "react-markdown";
import PropTypes from "prop-types";
import {FormControl} from "react-bootstrap";
import {ModalDialog} from "components/ModalDialog/ModalDialog";

MarkdownEditor.propTypes = {
    value: PropTypes.string,
    name: PropTypes.string.isRequired,
    invalid: PropTypes.bool,
};


export default function MarkdownEditor(props) {
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    function handleChange(e) {

        setValue(e.target.value)
        if (props.onChange) props.onChange(e)
    }

    return <>
        <FormControl name={props.name} defaultValue={value} invalid={props.invalid} as="textarea" rows={props.rows || 3}
                     onChange={handleChange}/>
        <div className="text-center">
            <ModalDialog
                body={<MarkDown source={value}/>}
                //open={true}
                header="Форматированный текст"
                //controls={[<Button onClick={submit} variant="primary">Отправить</Button>, <Button onClick={clear} variant="warning">Отменить</Button>]}
                buttonText="Предпросмотр"/>
        </div>
    </>

}
