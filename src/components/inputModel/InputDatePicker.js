import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, {useState} from "react";
import ru from 'date-fns/locale/ru';
import moment from "moment";
import {Button, Form, InputGroup} from "react-bootstrap";
import {faCalendar} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

registerLocale('ru', ru)

export default function InputDatePicker(props){
    const [date, setDate] = useState(props.defaultValue)
    const [show, setShow] = useState(false)

    function adaptDate(date){
        return moment(date).format('YYYY-MM-DD')
    }

    function changeDate(date){
        setDate(adaptDate(date))
        setShow(false)
        const element = document.getElementById(`picker-${props.name}`);

        const event = new Event("input", { bubbles: true });
        event.simulated = true;
        let tracker = element._valueTracker;
        if (tracker) {
            tracker.setValue(adaptDate(date));
        }
        props.onChange && props.onChange(adaptDate(date))
        element.dispatchEvent(event);
    }

    return <div>

        {show && <DatePicker
            inline
            withPortal
            closeOnScroll
            selected={new Date(moment(props.defaultValue).format('YYYY-MM-DD'))}
            onKeyPress={console.log}
            onChange={changeDate}
        />}
        <InputGroup>

            <Form.Control value={date} readOnly  name={props.name} className="form-control" id={`picker-${props.name}`} onClick={setShow}/>
            <InputGroup.Append>
                <Button variant="secondary" onClick={setShow}><FontAwesomeIcon size="sm" icon={faCalendar}/></Button>
            </InputGroup.Append>
        </InputGroup>



    </div>
}
