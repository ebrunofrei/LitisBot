import React, { useEffect, useState } from 'react';
import { db, storage, auth } from '../firebase';

const TestFirebase = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Prueba de conexión Firebase</h2>
      {user ? <p>Usuario conectado: {user.email}</p> : <p>No hay usuario conectado.</p>}
    </div>
  );
};

export default TestFirebase;