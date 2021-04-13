import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import React, {useState} from "react";

export default function ImageView(props) {
    const [modal, setModal] = useState(false);
    const [modalImage, setModalImage] = useState();
    const toggle = () => setModal(!modal);

    function showImage(src) {
        setModalImage(src);
        toggle();
    }

    return <div>
        <img store={props.store} onClick={() => showImage(props.src)}/>
        <Modal isOpen={modal} toggle={toggle} backdrop={true} keyboard={true}>
            <ModalHeader toggle={toggle}></ModalHeader>
            <ModalBody>
                <img src={modalImage} alt={'Full'} className="img-fluid"/>
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" onClick={toggle}>Закрыть</Button>
            </ModalFooter>
        </Modal>
    </div>

}
