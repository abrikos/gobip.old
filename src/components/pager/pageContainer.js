import {useEffect, useState} from "react";

export default function PageContainer(props){
    const [list,setList] =useState();
    useEffect(init,[])

   function init(){
        props.store.api(`/${props.model}`)
   }
    return <div className="page-container">
        {props.model}
    </div>
}
