import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import LogoutButton from './LogoutButton.jsx';
import './Navbar.css';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [menuActive, setMenuActive] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);

  useEffect(() => {
    const obtenerNombre = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setNombreUsuario(data.nombre || user.email);
          } else {
            setNombreUsuario(user.email);
          }
        } catch (err) {
          console.error('Error obteniendo nombre:', err);
          setNombreUsuario(user.email);
        }
      } else {
        setNombreUsuario('');
      }
    };
    obtenerNombre();
  }, [user]);

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <img
            src="/litisbot-logo.png"
            alt="LitisBot"
            style={{
              height: '38px',
              marginRight: '10px',
              verticalAlign: 'middle',
              borderRadius: '8px',
              background: '#fff',
              padding: '2px'
            }}
          />
          <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.5em" }}>LitisBot</span>
        </Link>
        <span className="menu-toggle" onClick={toggleMenu}>&#9776;</span>
      </div>

      <div className={`nav-links ${menuActive ? 'active' : ''}`}>
        <Link to="/" onClick={closeMenu}>Inicio</Link>
        <Link to="/litisbotconvoz" onClick={closeMenu}>LitisBot con Voz</Link>
        <Link to="/litisbotorc" onClick={closeMenu}>LitisBot OCR</Link>
        <Link to="/busqueda-avanzada" onClick={closeMenu}>Búsqueda Avanzada</Link>
        <Link to="/agenda" onClick={closeMenu}>Agenda</Link>
        <Link to="/clientes" onClick={closeMenu}>Clientes</Link>
        <Link to="/biblioteca" onClick={closeMenu}>Biblioteca</Link>
        <Link to="/jurisprudencia" onClick={closeMenu}>Jurisprudencia</Link>
        <Link to="/tips" onClick={closeMenu}>Tips</Link>
        <Link to="/buscador" onClick={closeMenu}>Buscador Google</Link>
        <Link to="/colaboracion" onClick={closeMenu}>Colabora con LitisBot</Link>
        {!user && <Link to="/login" onClick={closeMenu}>Iniciar Sesión</Link>}
        {!user && <Link to="/register" onClick={closeMenu}>Registrarse</Link>}
        {!user && <Link to="/forgot-password" onClick={closeMenu}>¿Olvidaste tu contraseña?</Link>}
        {user && (
          <>
            <span style={{ color: '#fff', marginLeft: '10px', fontWeight: 'bold' }}>
              {nombreUsuario}
            </span>
            <LogoutButton />
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
