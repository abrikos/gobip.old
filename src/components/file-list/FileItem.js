import React, {useState} from "react";
import "components/file-list/file-list.sass";
import {Button} from "react-bootstrap";
import PropTypes from "prop-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import FileModal from "components/file-list/FileModal";

FileList.propTypes = {
    files: PropTypes.array.isRequired,
    editable: PropTypes.bool,
    controls: PropTypes.array,
    onDelete: PropTypes.func,
};

export default function FileItem(props) {
    const [image, setImage] = useState(props.image);
    const [modalImage, setModalImage] = useState();

    function deleteImage() {
        if (!window.confirm('Удалить изображение?')) return;
        props.store.api('/file/delete/' + image.id)
            .then(() => {
                setImage(null)
            })
    }

    if (!image) return <span/>

    return <div className="image-cell">

        <div>
            <Button size="sm" variant="success" onClick={() => props.setPreview(image)} title="Сделать основной картинкой">
                <FontAwesomeIcon icon={faCheck}/>
            </Button>
            <Button size="sm" variant="primary" onClick={() => setModalImage(image)} title="Редактировать свойства">
                <FontAwesomeIcon icon={faEdit}/>
            </Button>
            <Button size="sm" variant="danger" onClick={() => deleteImage(image)}>
                <FontAwesomeIcon icon={faTrash}/>
            </Button>
        </div>

        <div>

            {image.error ?
                <small>
                    <div className="error">{image.error}</div>
                    <strong>{image.file.name}</strong> <br/> <small
                    className="error">{(image.file.size / 1024 / 1024).toFixed(1)} Mb</small> </small>
                :
                <img src={image.path} alt={image.path} className="img-fluid" title={image.description} onClick={() => setModalImage(image)}/>}
            <br/>
            <small>{image.description}</small>

            <FileModal image={modalImage} onToggle={setModalImage} onChange={setImage} store={props.store}/>
        </div>


    </div>

}
