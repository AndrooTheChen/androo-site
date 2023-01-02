import logo from './logo.svg';
import './App.css';
import Home from './pages/home';
import About from './pages/about';

import {
  BrowserRouter as Router,
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
          </Routes>
        </Router>
    </div>
  );
}
