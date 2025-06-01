import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import InstalarApp from "./components/InstalarApp";

// Importa aquí tus páginas
import LitisBotOCR from './pages/LitisBotOCR';
import Bienvenida from './pages/Bienvenida';
import Agenda from './pages/Agenda';
import Biblioteca from './pages/Biblioteca';
import Clientes from './pages/Clientes';
import Jurisprudencia from './pages/Jurisprudencia';
import Tips from './pages/Tips';
import BuscadorGoogle from './pages/BuscadorGoogle';
import Colaboracion from './pages/Colaboracion';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import LitisBotConVoz from './pages/LitisBotConVoz';

// Puedes agregar aquí más páginas según tu estructura...

function App() {
  return (
    <Router>
      <div>
        {/* Navbar principal */}
        <Navbar />

        {/* Banner PWA InstalarApp */}
        <InstalarApp />

        {/* Contenido principal de rutas */}
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
            {/* Agrega aquí más rutas si tienes nuevas páginas */}
            {/* <Route path="/otra-pagina" element={<OtraPagina />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
