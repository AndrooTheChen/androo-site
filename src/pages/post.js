import React from "react";
import Layout from "../components/layout"
import ReactMarkdown from "react-markdown"
import rehypeRaw from 'rehype-raw';

import { Navigate, useParams } from "react-router-dom"

import postList from "../posts.json"

const Post = () => {
    // Get the ID used in the dynamic route and make sure it's valid.
    // For now we're just saying a valid page has an integer ID. 
    // TODO make this better.
    const { id } = useParams()
    const validId = parseInt(id)
    const fetchedPost = {}

    // Loop over all of our existing posts to ensure that the requested
    // post ID is valid.
    let postExists = false
    postList.forEach((post, idx) => {
        if (validId === post.id) {
            fetchedPost.title = post.title ? post.title : "No title given"
            fetchedPost.date = post.date ? post.date : "No date given"
            fetchedPost.author = post.author ? post.author : "No author given"
            fetchedPost.content = post.content ? post.content : "No content"
            postExists = true
        }
    })
    if (!validId || !postExists) {
        return <Navigate to="/404" />
    }

    return (
        <Layout>
            <div className="post">
                <h2>{fetchedPost.title}</h2>
                <small>Published on {fetchedPost.date} by {fetchedPost.author}</small>
            <hr />
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{fetchedPost.content}</ReactMarkdown>
            </div>
        </Layout>
    )
}

export default Post