import React, {useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-solid-svg-icons";
import {Overlay, Popover, PopoverHeader} from "react-bootstrap";
import md5 from 'md5';

export default function CopyButton(props) {
    const [showPopOver, setShowPopOver] = useState(false);
    const target = useRef(null);

    const copyToClipboard = (text) => {
        setShowPopOver(true);
        const textField = document.createElement('textarea')
        textField.innerText = text
        document.body.appendChild(textField)
        textField.select();
        document.execCommand('copy')
        textField.remove();
        setTimeout(() => {
            setShowPopOver(false);
        }, 2000);
    }

    const id = 'cpbtn' + md5(props.text)
    return <><span style={{cursor: 'pointer', color: '#555'}} ref={target} id={id} onClick={() => copyToClipboard(props.text)}
                 title={`Press to copy: ${props.text}`}>
            <FontAwesomeIcon size="sm" icon={faCopy}/> Копировать

        </span>
        <Overlay target={target.current}
                 show={showPopOver}
                 placement={"right"}>
            {({ placement, arrowProps, show: _show, popper, ...props }) => (
                <div
                    {...props}
                    style={{
                        backgroundColor: 'white',
                        opacity:.5,
                        padding: '2px 10px',
                        //color: 'white',
                        borderRadius: 3,
                        ...props.style,
                    }}
                >
                    Скопировано
                </div>
            )}
        </Overlay>
        </>
}
