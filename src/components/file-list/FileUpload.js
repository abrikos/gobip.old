import React, {useRef, useState} from "react";
import FileList from "components/file-list/FileList";
import Loader from "components/loader/Loader";
import PropTypes from "prop-types";
import {Button} from "react-bootstrap";

FileUpload.propTypes = {
    uploadDone: PropTypes.func.isRequired
};

export default function FileUpload(props) {
    //const [filesUploaded, setImagesUploaded] = useState([]);
    const [filesDeclined, setImagesDeclined] = useState([]);
    const [loader, setLoader] = useState(false);
    const tokens = props.tokens;
    const nameRef = useRef()

    async function _handleImageChange(e) {
        setLoader(true)
        e.preventDefault();
        const uploaded = [];
        const declined = [];
        for (const file of e.target.files) {
            /*let reader = new FileReader();
            reader.onloadend = () => {

                console.log(1,items)
                items.push(reader.result);
                //setImagesUploaded(ims);
            };*/
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tokens', tokens);
            try {
                const image = await props.store.api('/file/upload/', formData);
                if(image.error){
                    declined.push({error: image.message, file})
                }else{
                    uploaded.push(image);
                }
                console.log('UPLOADED',uploaded)
            } catch (e) {
                declined.push({error: e.message, file})
                //reader.readAsDataURL(file);
            }

        }
        if (uploaded.length && props.uploadDone) props.uploadDone(uploaded.map(i => i.id))
        //setImagesUploaded(uploaded);
        setImagesDeclined(declined);
        setLoader(false)
    }

    function openDialog() {
        nameRef.current.click()
    }

    return <div>
        {loader ? <Loader/> : <input type="file" ref={nameRef} multiple={props.multiple} onChange={_handleImageChange}
                                     className="d-none"/>}
        <Button onClick={openDialog}>Загрузить фотографии</Button>
        {/*{!!filesUploaded.length && <div>
            <h4>Загружено</h4>
            <ImageList files={filesUploaded} editable={props.editable} store={props.store}/>
        </div>}*/}

        {!!filesDeclined.length && <div>
            <h4>Отказано</h4>
            <FileList files={filesDeclined} store={props.store}/>
        </div>}

    </div>

}

