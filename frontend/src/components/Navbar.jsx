import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      background: "#1976d2",
      color: "#fff",
      padding: "9px 0",
      display: "flex",
      alignItems: "center"
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#fff", fontWeight: "bold", fontSize: 28, marginLeft: 14 }}>
        {/* Asegúrate que el logo existe y la ruta es correcta */}
        <img
          src="/logo.svg"      // o "/web-app-manifest-192x192.png" o el PNG cuadrado que generaste
          alt="LitisBot"
          style={{ height: 38, marginRight: 12, borderRadius: 10, background: "#fff" }}
          onError={e => { e.target.onerror = null; e.target.src="/web-app-manifest-192x192.png"; }}
        />
        LitisBot
      </Link>
      {/* ...aquí puedes agregar el menú... */}
    </nav>
  );
}
