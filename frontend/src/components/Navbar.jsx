import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ background: "#2563eb", padding: "10px" }}>
      <Link to="/" style={{ color: "#fff", fontWeight: "bold", marginRight: 20 }}>Inicio</Link>
      <Link to="/litisbotconvoz" style={{ color: "#fff", marginRight: 10 }}>LitisBot con Voz</Link>
      <Link to="/litisbotocr" style={{ color: "#fff", marginRight: 10 }}>LitisBot OCR</Link>
      <Link to="/busqueda-avanzada" style={{ color: "#fff", marginRight: 10 }}>Búsqueda Avanzada</Link>
      <Link to="/agenda" style={{ color: "#fff", marginRight: 10 }}>Agenda</Link>
      <Link to="/clientes" style={{ color: "#fff", marginRight: 10 }}>Clientes</Link>
      <Link to="/biblioteca" style={{ color: "#fff", marginRight: 10 }}>Biblioteca</Link>
      <Link to="/jurisprudencia" style={{ color: "#fff", marginRight: 10 }}>Jurisprudencia</Link>
      <Link to="/tips" style={{ color: "#fff", marginRight: 10 }}>Tips</Link>
      <Link to="/buscadorgoogle" style={{ color: "#fff", marginRight: 10 }}>Buscador Google</Link>
    </nav>
  );
}

export default Navbar;
