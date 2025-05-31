// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    // Puedes retornar un spinner o mensaje mientras carga el estado
    return <div>Cargando...</div>;
  }

  if (!user) {
    // Si no está autenticado, redirige a login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los hijos (la página protegida)
  return children;
};

export default PrivateRoute;
