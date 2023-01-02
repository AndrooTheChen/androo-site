import React from "react";

import Layout from "../components/layout"
import PostList from "../components/postlist"
import "./pages.css"

function Home() {
    return (
        <div>
            <Layout>
                <h1 className="postlist">
                    <PostList />
                </h1>
            </Layout>
        </div>
    )
}

export default Home;