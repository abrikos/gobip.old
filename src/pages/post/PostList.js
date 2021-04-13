import React, {useEffect, useState} from 'react';
import Pager from "components/Pager";
import Loader from "components/Loader";
import "./post.sass"
import DateFormat from "components/DateFormat";
import {A} from "hookrouter"

export default function PostLIst(props) {
    /*this.propTypes = {
        filter: PropTypes.object,
    };*/

    const [posts, setPosts] = useState();
    const [first, setFirst] = useState();
    const [totalCount, setTotalCount] = useState();
    const [filter, setFilter] = useState(props.filter);

    useEffect(init, [filter, props]);

    function init() {
        const f = filter ? Object.assign(filter, {}) : {where: {}};
        if (!f.where) f.where = {};
        f.order = {createdAt: -1};
        f.limit = 12;
        f.skip = 0;
        if (!props.isAdmin) f.where.published = true;
        setFilter(f);
        props.store.api('/post/list', f).then(res => {
            console.log(res)
            setFirst(res.list.shift())
            setPosts(res.list)
            setTotalCount(res.count);
        });
    }

    function pageChange(f) {
        props.store.api('/post/list', f).then(res => setPosts(res.list));
    }

    if (!posts) return <Loader/>
    return <div className="post-list">
        <div>
            <div className="d-sm-flex justify-content-center">
                <div>
                    {first.previewPath && <img src={first.previewPath} alt={first.header} className="img-fluid"/>}
                </div>
                <div className="d-sm-flex align-items-center p-2">
                    <div>
                        <h3><A href={first.link} className="d-sm-flex justify-content-center"><strong>{first.header}</strong></A></h3>
                        <div>Дата: <strong>{first.dayDate || first.date}</strong></div>
                        <div> Время:{' '}
                            <strong>{first.hour}</strong> (ЯКТ),
                            <strong>{first.hour - 2}</strong> (НСК),
                            <strong>{first.hour - 6}</strong> (МСК)
                        </div>
                        <div>
                            Докладчик: <strong>{first.speaker}</strong> <small>{first.speaker2}</small>
                        </div>
                        Подключение: <a href={first.meeting} target="_blank">{first.meeting}</a>
                    </div>
                </div>
            </div>
        </div>
        <hr/>
        <h3 className="text-center">Прошедшие доклады</h3>
        <div className="container">
            {posts.map(p => <div key={p.id}   className="row my-3">
                <div className="col-4 text-right">{p.dayDate}</div>
                <div className="col-8"> <A href={p.link}>{p.header}</A> - {p.speaker}</div>
            </div>)}
        </div>
        {filter && !!totalCount && <Pager count={totalCount} filter={filter} onPageChange={pageChange}/>}
    </div>
}
