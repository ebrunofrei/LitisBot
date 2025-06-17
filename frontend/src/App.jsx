import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import InstalarApp from "./components/InstalarApp";

// Importa tus páginas principales
import Bienvenida from "./pages/Bienvenida";
import LitisBotConVoz from "./components/LitisBotConVoz/LitisBotConVoz";
import LitisBotOCR from "./pages/LitisBotOCR";
import BusquedaAvanzada from "./pages/BusquedaAvanzada";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Biblioteca from "./pages/Biblioteca";
import Jurisprudencia from "./pages/Jurisprudencia";
import Tips from "./pages/Tips";
import BuscadorGoogle from "./pages/BuscadorGoogle";

function App() {
  return (
    <Router>
      <Navbar />
      <InstalarApp />
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/litisbotconvoz" element={<LitisBotConVoz />} />
        <Route path="/litisbotocr" element={<LitisBotOCR />} />
        <Route path="/busqueda-avanzada" element={<BusquedaAvanzada />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/jurisprudencia" element={<Jurisprudencia />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/buscadorgoogle" element={<BuscadorGoogle />} />
      </Routes>
    </Router>
  );
}

export default App;
