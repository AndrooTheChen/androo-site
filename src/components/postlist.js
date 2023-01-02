import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'
import { Link } from 'react-router-dom'

import postlist from "../posts.json";

import "./components.css";

const PostList = () => {
    // Trim the post contents to show an abridged version for posts
    // on the main post list page. We will show the full post
    // when users click on each one.
    const excerptList = postlist.map(post => {
        return post.content.split(" ").slice(0, 20).join(" ")
    })

    return (
        <div className="postlist">
            <h1 className="title">All Posts</h1>
            {postlist.length && 
                postlist.map((post, idx) => {
                    return (
                        // TODO: change key to something better. we just do this because
                        // each child in a list should have a unique key, but index probably 
                        // isn't best practice.
                        // https://reactjs.org/docs/lists-and-keys.html#keys
                        <div key={idx} className="post-card">
                            <h2><Link className="link" to={`post/${post.id}`}>{post.title}</Link></h2>
                            <small>Published on {post.date} by {post.author}</small>
                            <hr />
                            <ReactMarkdown rehypePlugins={[rehypeRaw]} children={excerptList[idx]} />
                            <small><Link className="link" to={`post/${post.id}`}>Continue reading...</Link></small>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default PostList;