// src/pages/Clientes.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  Timestamp
} from 'firebase/firestore';

const Clientes = () => {
  const [user, setUser] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', dni: '', correo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `usuarios/${user.uid}/clientes`));
    const unsub = onSnapshot(q, snapshot => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(lista);
    });

    return () => unsub();
  }, [user]);

  const guardarCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.dni) return;
    try {
      await addDoc(collection(db, `usuarios/${user.uid}/clientes`), {
        ...nuevoCliente,
        creadoEn: Timestamp.now()
      });
      setNuevoCliente({ nombre: '', dni: '', correo: '' });
      alert('Cliente guardado exitosamente');
    } catch (err) {
      console.error('Error al guardar cliente:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Debes iniciar sesión para gestionar clientes.</p>
        <button onClick={() => navigate('/login')}>Ir a iniciar sesión</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestión de Clientes / Patrocinados</h2>
      <div style={{ maxWidth: 400, marginBottom: 30 }}>
        <h4>Nuevo Cliente</h4>
        <input
          placeholder="Nombre completo"
          value={nuevoCliente.nombre}
          onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
          style={{ marginBottom: 10, width: '100%' }}
        />
        <input
          placeholder="DNI"
          value={nuevoCliente.dni}
          onChange={e => setNuevoCliente({ ...nuevoCliente, dni: e.target.value })}
          style={{ marginBottom: 10, width: '100%' }}
        />
        <input
          placeholder="Correo electrónico (opcional)"
          value={nuevoCliente.correo}
          onChange={e => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })}
          style={{ marginBottom: 10, width: '100%' }}
        />
        <button onClick={guardarCliente}>Guardar Cliente</button>
      </div>

      <h4>Listado de Clientes</h4>
      <ul>
        {clientes.map(cliente => (
          <li key={cliente.id}>
            <b>{cliente.nombre}</b> – DNI: {cliente.dni} <br />
            <button onClick={() => navigate(`/cliente/${cliente.id}`)}>Ver Detalle</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;
