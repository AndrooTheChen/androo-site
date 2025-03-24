import React from "react";
import { Link } from "react-router-dom"

const Navbar = () => {
    return (
        <div className="navbar">
            <Link className="links" to="/">Home</Link>
            <Link className="links" to="/about">About</Link>
            <Link className="links" to="/prayer-partners">Prayer Partners</Link>
        </div>
    )
}

export default Navbar;