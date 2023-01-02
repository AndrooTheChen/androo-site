import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'

import postlist from "../posts.json";

import "./components.css";

const PostList = () => {
    console.log(postlist)
    return (
        <div className="postlist">
            <h1 className="title">All Posts</h1>
            {postlist.length && 
                postlist.map((post, idx) => {
                    return (
                        <div className="post-card">
                            <h2>{post.title}</h2>
                            <small>Published on {post.date} by {post.author}</small>
                            <hr />
                            <ReactMarkdown rehypePlugins={[rehypeRaw]} children={post.content} />
                        </div>
                    )
                })
            }
        </div>
    )
}

export default PostList;