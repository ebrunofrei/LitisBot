// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [nombre, setNombre] = useState('');
  const [editando, setEditando] = useState(false);
  const [resumen, setResumen] = useState({
    carpetas: 0,
    expedientes: 0,
    modelos: 0,
    fuentes: 0
  });

  useEffect(() => {
    if (user) {
      setNombre(user.displayName || '');
      cargarResumen();
    }
  }, [user]);

  const cargarResumen = async () => {
    const carpetasSnap = await getDocs(collection(db, `usuarios/${user.uid}/carpetas`));
    const fuentesSnap = await getDocs(collection(db, `usuarios/${user.uid}/historialFuentes`));
    const modelosSnap = await getDocs(collection(db, 'biblioteca'));

    const expedientesTotales = carpetasSnap.docs.reduce((total, docu) => {
      const d = docu.data();
      return d.expedientes ? total + d.expedientes.length : total;
    }, 0);

    setResumen({
      carpetas: carpetasSnap.size,
      expedientes: expedientesTotales,
      modelos: modelosSnap.size,
      fuentes: fuentesSnap.size
    });
  };

  const guardarNombre = async () => {
    try {
      if (!nombre.trim()) return alert('El nombre no puede estar vacío.');
      await updateDoc(doc(db, 'usuarios', user.uid), { nombre });
      await user.updateProfile({ displayName: nombre });
      alert('Nombre actualizado correctamente.');
      setEditando(false);
    } catch (e) {
      console.error(e);
      alert('Hubo un error al actualizar tu nombre.');
    }
  };

  if (!user) return <p>Inicia sesión para ver tu dashboard.</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2>Mi Panel (Dashboard)</h2>
      <div style={{ marginBottom: 20 }}>
        <label>Mi nombre: </label>
        {editando ? (
          <>
            <input value={nombre} onChange={e => setNombre(e.target.value)} />
            <button onClick={guardarNombre}>Guardar</button>
            <button onClick={() => setEditando(false)}>Cancelar</button>
          </>
        ) : (
          <>
            <b>{nombre}</b>
            <button style={{ marginLeft: 10 }} onClick={() => setEditando(true)}>Editar</button>
          </>
        )}
      </div>

      <h3>Resumen de actividad:</h3>
      <ul>
        <li><b>Carpetas:</b> {resumen.carpetas}</li>
        <li><b>Expedientes:</b> {resumen.expedientes}</li>
        <li><b>Modelos descargables:</b> {resumen.modelos}</li>
        <li><b>Fuentes jurídicas citadas:</b> {resumen.fuentes}</li>
      </ul>
    </div>
  );
};

export default Dashboard;
