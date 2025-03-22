import React from "react";
import ReactMarkdown from "react-markdown";
import aboutText from "../pages.json";
import rehypeRaw from 'rehype-raw';
import Layout from "../components/layout";

import "./pages.css"

const About = () => {
    return (
        <div>
            <Layout>
                <h1 style={{textAlign: `center`, marginBottom: `20px`}}>About</h1>
                <div className="page-content">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{aboutText[0].content}</ReactMarkdown>
                </div>
            </Layout>
        </div>
    )
}

export default About;