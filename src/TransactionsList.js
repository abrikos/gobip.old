import {useEffect, useState} from "react";
import Pager from "components/Pager";

export default function TransactionsList(props) {
    const [list, setList] = useState({list: [], count: 0});
    const [filter, setFilter] = useState({limit: 25, sort: {date: -1}})
    useEffect(init, [filter])

    function init() {
        props.store.api(`/${props.model}/list`, filter)
            .then(setList)
    }

    function pageClick(e) {
        setFilter(e)
        init()
    }

    if (!list.count) return <div></div>
    console.log(list)
    return <div>zzz44
        <table className="table">
            <tbody>
            {list.list.map(l => <tr key={l.hash}>
                <td>{l.dateHuman}</td>
                <td><a href={`https://explorer.minter.network/transactions/${l.hash}`} target="_blank">{l.hash}</a></td>
                <td>{l.coin}</td>
                <td>{l.value.toFixed(2)}</td>
            </tr>)}
            </tbody>
            <Pager count={list.count} filter={filter} onPageChange={pageClick}/>
        </table>
    </div>
}
