import React, {useEffect} from 'react';

export default function Logout(props) {
    useEffect(init, [])

    function init() {
        props.store.logOut()
    }

    return <div>

    </div>


}


