import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import LitisBotConVoz from './pages/LitisBotConVoz';
import LitisBotOCR from './pages/LitisBotOCR';
import BusquedaAvanzada from './pages/BusquedaAvanzada';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Colaboracion from './pages/Colaboracion';
import BuscadorGoogle from './pages/BuscadorGoogle';
import Biblioteca from './pages/Biblioteca';
import Jurisprudencia from './pages/Jurisprudencia';
import Tips from './pages/Tips';
import Agenda from './pages/Agenda';

import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/litisbotconvoz" element={<LitisBotConVoz />} />
          <Route path="/litisbotorc" element={<LitisBotOCR />} />
          <Route path="/busqueda-avanzada" element={<BusquedaAvanzada />} />
          <Route path="/agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/jurisprudencia" element={<Jurisprudencia />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/buscador" element={<BuscadorGoogle />} />
          <Route path="/colaboracion" element={<Colaboracion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="*"
            element={
              <div style={{ padding: 20 }}>
                <h1>404 - Página no encontrada</h1>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
