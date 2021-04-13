import React from "react";
import {Button} from "react-bootstrap";

export default function (props) {
    return <div className="text-center d-none d-sm-block">
        <hr/>
        Выбирите стиль отображения сайта: {props.themes.map(t => <Button key={t.name}
                                                                         onClick={() => props.switchTheme(t.name)}
                                                                         size="sm">{t.label}</Button>)}

    </div>
}
