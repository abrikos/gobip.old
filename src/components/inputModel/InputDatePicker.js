import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, {useState} from "react";
import ru from 'date-fns/locale/ru';
import moment from "moment";

registerLocale('ru', ru)

export default function InputDatePicker(props){
    const [date, setDate] = useState(props.value)
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
        console.log(event)
        element.dispatchEvent(event);
    }


    return <div>

        {show && <DatePicker
            hidden
            inline
            withPortal
            onChange={changeDate}
        />}
       <button onClick={setShow}> {adaptDate(date)}</button>
        <input value={date}  name={props.name} readOnly hidden id={`picker-${props.name}`}/>
    </div>
}
