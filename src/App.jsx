import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import InstalarApp from "./components/InstalarApp";

// Importa tus páginas desde /pages/
import Bienvenida from "./pages/Bienvenida";
import LitisBotConVoz from "./pages/LitisBotConVoz";
import LitisBotOCR from "./pages/LitisBotOCR";
import BusquedaAvanzada from "./pages/BusquedaAvanzada";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Biblioteca from "./pages/Biblioteca";
import Jurisprudencia from "./pages/Jurisprudencia";
import Tips from "./pages/Tips";
import BuscadorGoogle from "./pages/BuscadorGoogle";
import Colaboracion from "./pages/Colaboracion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Agrega más imports según crees nuevas páginas

function App() {
  return (
    <Router>
      <div>
        {/* Navbar superior */}
        <Navbar />

        {/* Banner de instalación PWA */}
        <InstalarApp />

        {/* Rutas principales */}
        <div className="main-content" style={{ padding: "2rem 1rem" }}>
          <Routes>
            <Route path="/" element={<Bienvenida />} />
            <Route path="/litisbotconvoz" element={<LitisBotConVoz />} />
            <Route path="/litisbotorc" element={<LitisBotOCR />} />
            <Route path="/busqueda-avanzada" element={<BusquedaAvanzada />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/jurisprudencia" element={<Jurisprudencia />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/buscador" element={<BuscadorGoogle />} />
            <Route path="/colaboracion" element={<Colaboracion />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* Puedes agregar aquí más rutas si creas nuevas páginas */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
