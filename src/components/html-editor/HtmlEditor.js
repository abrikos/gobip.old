import React, {useState} from "react";
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PropTypes from "prop-types";

HtmlEditor.propTypes = {
    value: PropTypes.string,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    options: PropTypes.object,
};

export default function HtmlEditor(props) {
    const [value, setValue] = useState(props.value);
    const options = {...props.options}

    const config = {
        language: 'ru',
        toolbar: [
            'Undo', 'Redo',
            'heading', 'bold', 'italic', 'link',
            'bulletedList', 'insertTable'
        ]
    }

    return <div>

        <textarea name={props.name} value={value} readOnly hidden style={{width: '100%', height: options.height}}/>
        {/*<EditorComponent
            //ref={editor}
            value={value}
            config={options}
            tabIndex={1} // tabIndex of textarea
            onBlur={handleChange} // preferred to use only this option to update the content for performance reasons
            onChange={props.onChange}
        />*/}
        <CKEditor
            editor={ClassicEditor}
            data={value}
            config={config}
            onInit={editor => {
                // You can store the "editor" and use when it is needed.
                console.log('Editor is ready to use!', editor.config);

            }}
            onChange={(event, editor) => {
                const data = editor.getData();
                setValue(data)
                props.onChange(true)
                console.log({event, editor, data});
            }}
            /*onBlur={(event, editor) => {
                //console.log( 'Blur.', editor );
            }}
            onFocus={(event, editor) => {
                //console.log( 'Focus.', editor );
            }}*/
        />
    </div>
}
