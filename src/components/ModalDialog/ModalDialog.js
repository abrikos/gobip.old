import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import "./modal-dialog.sass"
import PropTypes from "prop-types";

ModalDialog.propTypes = {
    body: PropTypes.object,
    header: PropTypes.string,
    controls: PropTypes.array,
};

export function ModalDialog(props) {
    const [modal, setModal] = useState(props.show);
    const toggle = () => setModal(!modal);


    return <div>
        <Modal size="lg" show={modal} onHide={toggle} dialogClassName={props.full && "modal-90w"}>
            <Modal.Header closeButton>{props.header}</Modal.Header>
            <Modal.Body>
                {props.body}
            </Modal.Body>
            <Modal.Footer>
                {props.controls && props.controls.map((c, i) => <span key={i}>{c}</span>)}
                <Button variant="secondary" onClick={toggle}>Закрыть</Button>
            </Modal.Footer>
        </Modal>
        <div className="pointer" onClick={toggle}>{props.buttonText}</div>
    </div>
}
