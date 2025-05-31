// src/components/LogoutButton.jsx
import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch {
      alert('Error cerrando sesión');
    }
  };

  return (
    <button onClick={handleLogout} style={{ padding: '6px 12px' }}>
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
