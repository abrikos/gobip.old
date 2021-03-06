import React from "react";
import ThemeMainTopMenu from "themes/main/ThemeMainTopMenu";
import "./theme-admin.sass"

export default function ThemeAdmin(props) {
    return <div className="container-fluid bg-light">
        <ThemeMainTopMenu store={props.store}/>
        {/*<div className="m-auto bg-light p-3">
            <Letters path={'/editor/article/letter'} letter={decodeURI(props.letter)} store={props.store}/>
            <SearchForm editor store={props.store}/>

        </div>*/}
        <hr/>
        <div className="container-fluid admin-content">

            {props.errorPage || props.routeResult}

        </div>

    </div>
}
