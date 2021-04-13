import React, {useState} from "react";
import "components/file-list/file-list.sass";
import {Button, Modal} from "react-bootstrap";
import PropTypes from "prop-types";


FileList.propTypes = {
    files: PropTypes.array.isRequired,
    editable: PropTypes.bool,
    controls: PropTypes.array,
    onDelete: PropTypes.func,
};


export default function FileModal(props) {
    const image = props.image;
    const [modal, setModal] = useState(false);
    const toggle = () => {
        props.onToggle(false)
        setModal(!modal);
    }

    function submitImageAttr(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target);
        props.store.api(`/file/${image.id}/update`, form)
            .then(props.onChange)
    }

    if (!image) return <div/>
    return <Modal isOpen={true} toggle={toggle} backdrop={true} keyboard={true}>
        <Modal.Header toggle={toggle}>Редактирование</Modal.Header>
        <Modal.Body>
            <img src={image.path} alt={'Full'} className="img-fluid w-100"/>
            <form onSubmit={submitImageAttr}>
                <label>Подпись под картинкой</label>
                <textarea name="description" defaultValue={image.description} className="w-100"/>
                <Button>Сохранить</Button>
            </form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={toggle}>Закрыть</Button>
        </Modal.Footer>
    </Modal>

}
