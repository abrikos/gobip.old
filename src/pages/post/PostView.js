import React, {useEffect, useState} from 'react';
import ErrorPage from "components/service/ErrorPage";
import {A} from "hookrouter"
import DateFormat from "components/DateFormat";
import MarkDown from "react-markdown";
import ShareButtons from "components/share-button/ShareButtons";

export default function PostView(props) {
    const [model, setModel] = useState();
    useEffect(() => {
        props.store.api(`/post/${props.id}/view`)
            .then(setModel)
    }, [])

    if (!model) return <ErrorPage error={404}/>
    return <div className="post-view container">
        {props.store.authenticatedUser && props.store.authenticatedUser.admin && <A href={model.adminLink}>Редактировать</A>}
        <h2>{model.header}</h2>
        <div>Докладчик: <strong>{model.speaker}</strong> <small>{model.speaker2}</small></div>
        <div>Дата: <strong>{model.dayDate}</strong></div>
        <div>Время:{' '}
            <strong>{model.hour}</strong> (ЯКТ),
            <strong>{model.hour - 2}</strong> (НСК),
            <strong>{model.hour - 6}</strong> (МСК)
        </div>
        <hr/>

        <div className="d-sm-flex align-items-start text-justify">
            <div><MarkDown source={model.annotation}/></div>
            <div><img src={model.previewPath} alt={model.header} className="img-fluid m-3" style={{maxWidth:400}}/></div>
        </div>
        <div><a href={model.meeting} target="_blank">Ссылка на подключение</a></div>

        <div className="p-2">
            <MarkDown source={model.text}/>
        </div>
        {model.presentation && <div><a href={model.presentation} target="_blank">Ссылка на презентацию</a></div>}
        {model.video && <div><a href={model.video} target="_blank">Ссылка на видео</a></div>}
        <small className="d-block text-right text-secondary"><DateFormat date={model.date}/></small>
        <ShareButtons link={model.shareLink}/>
    </div>
}




