import React, {useState} from "react";
import "./image-modal.sass"

export default function ImageModal(props) {
    const [modal, setModal] = useState(false);
    //const [modalImage, setModalImage] = useState();
    const toggle = () => setModal(!modal);


    return <div className="image-modal">
        <img src={props.src} className="image-preview" alt={props.alt} onClick={toggle}/>
        {modal && <div className="full-image-background" onClick={toggle}>
            <img src={props.src} alt={'Full'} onClick={toggle}/>
        </div>}
        {/*<Modal isOpen={modal} toggle={toggle} backdrop={true} keyboard={true}>
            <ModalHeader toggle={toggle}></ModalHeader>
            <ModalBody>
                <img src={props.src} alt={'Full'} className="xfull-image"/>
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" onClick={toggle}>Закрыть</Button>
            </ModalFooter>
        </Modal>*/}
    </div>
}
