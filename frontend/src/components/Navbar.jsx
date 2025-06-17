import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Asegúrate de importar el CSS

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img
          src="/litisbot-logo.png" // o android-chrome-192x192.png si prefieres
          alt="LitisBot"
          onError={e => { e.target.onerror = null; e.target.src = "/favicon-32x32.png"; }}
        />
        LitisBot
      </Link>
      {/* ...Aquí tu menú de navegación... */}
    </nav>
  );
}
