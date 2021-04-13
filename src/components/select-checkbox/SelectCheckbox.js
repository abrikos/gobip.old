import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons";
import "./select-checkbox.sass"
import {Button} from "react-bootstrap";

export default function SelectCheckbox(props) {
    const [show, setShow] = useState(false);
    const [items, setItems] = useState(props.checked || []);
    const [count, setCount] = useState(props.checked ? props.checked.length : 0);

    function openList() {
        setShow(!show)
    }

    function done() {
        setShow(false)
        setCount(items.length)
        props.onChange(items)
    }

    function clear() {
        const boxes = Array.prototype.slice.call(document.getElementsByName(props.name));
        for (const box of boxes) {
            box.checked = false;
        }
        setCount(0);
        setItems([]);
        props.onChange([])
    }

    function checkboxChange() {
        const boxes = Array.prototype.slice.call(document.getElementsByName(props.name))
        setItems(boxes.filter(b => b.checked).map(b => b.value))
    }


    return <div className="select-checkbox">
        <div className="input" onClick={openList}>
            <div className="placeholder">{props.placeholder} {!!count && `(${count})`}</div>
            <div className="triangle"><FontAwesomeIcon icon={faCaretDown}/></div>
        </div>
        {show && <div className="popup-items-container">
            <div className="popup-wrapper">
                {!!items.length && <div>
                    <Button size="sm" onClick={done} variant="success">подтвердить</Button>
                    <Button size="sm" onClick={clear} variant="warning">отменить</Button>
                </div>}
                <div className="popup-items">
                    {props.options.map((o, i) => <label htmlFor={`option-${o.value}`} key={i}
                                                        className="select-checkbox-item" onChange={checkboxChange}>
                            <input type="checkbox" id={`option-${o.value}`} name={props.name} value={o.value}
                                   defaultChecked={items.includes(o.value)}/>
                            {o.label}
                        </label>
                    )}
                </div>
            </div>
        </div>}

    </div>
}
