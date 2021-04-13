import React from "react";

/*
HtmlView.propTypes = {
    text: PropTypes.string,
};
*/

export default function HtmlView(props) {
    //return <span dangerouslySetInnerHTML={{__html: (props.text && props.text.replace('\n', '<br/>'))}}></span>
    return <span dangerouslySetInnerHTML={{__html: typeof props.text === 'string' ? props.text : props.text ? 'Да' : 'Нет'}}></span>
}
