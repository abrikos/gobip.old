import React from "react";
import PostList from "pages/post/PostList";

export default function NewsPage(props) {
    const filter = {where: {published: true, isMassMedia: {$ne: true}}};
    return <div>
        <h2>Новости</h2>
        <PostList filter={filter} {...props}/>
        {/*<hr/>
        <h2>Видео</h2>
        <VideoList {...props}/>*/}
    </div>
}
