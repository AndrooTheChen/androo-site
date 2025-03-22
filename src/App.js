import logo from './logo.svg';
import './App.css';
import Home from './pages/home';
import About from './pages/about';
import Post from './pages/post';
import NotFound from "./pages/notfound";
import React from 'react';


import {
  HashRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

export default function App() {
  return (
    <div>
        <Router>
          <Routes>
              <Route exact path="/" element={<Home/>} />
              <Route path="/about" element={<About/>} />
              <Route path="/post/:id" element={<Post/>} />
              <Route path="/*" element={<NotFound/>} />
          </Routes>
        </Router>
    </div>
  );
}
