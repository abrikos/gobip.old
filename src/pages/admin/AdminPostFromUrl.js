import React from "react";
import {Button} from "react-bootstrap";
import {navigate} from "hookrouter"

export default function AdminPostFromUrl(props) {

    function submit(e) {
        e.preventDefault()
        const form = props.store.formToObject(e.target)
        console.log('zzzzzz', form)
        props.store.api('/post/method/fromUrl', form)
            .then(post => navigate(post.adminLink))
    }

    return <form onSubmit={submit}>
        Создать новость из ссылки
        <input name="url"/>
        <Button type="submit">Создать</Button>
    </form>
}
