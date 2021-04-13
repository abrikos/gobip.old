import React from "react";
import moment from "moment";


export default function DateFormat(props) {

    const date = moment(props.date)
    const diff = moment().diff(date, 'days');
    let result;
    switch (diff) {
        case 0:
            result = `сегодня ${date.format('HH:mm')}`;
            break;
        case 1:
            result = `вчера ${date.format('HH:mm')}`;
            break;
        default:
            result = date.format('DD.MM.YYYY')
    }
    return <span className="date">{result}</span>
}
