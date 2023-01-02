import React from "react";
import Layout from "../components/layout"

import { Navigate, useParams } from "react-router-dom"

const Post = () => {
    // Get the ID used in the dynamic route and make sure it's valid.
    // For now we're just saying a valid page has an integer ID. 
    // TODO make this better.
    const { id } = useParams()
    const validId = parseInt(id)
    if (!validId) {
        return <Navigate to="/404" />
    }

    return (
        <Layout>
            <h1>This is an individual post.</h1>
        </Layout>
    )
}

export default Post