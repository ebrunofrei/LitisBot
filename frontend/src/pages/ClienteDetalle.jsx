
// src/pages/ClienteDetalle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ClienteDetalle = () => {
  const { clienteId } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [expedientes, setExpedientes] = useState([]);
  const [modelos, setModelos] = useState([]);

  useEffect(() => {
    const obtenerCliente = async () => {
      const docRef = doc(db, 'clientes', clienteId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCliente(docSnap.data());
      }
    };

    const obtenerExpedientes = async () => {
      const q = query(collection(db, 'expedientes'), where('clienteId', '==', clienteId));
      const snapshot = await getDocs(q);
      setExpedientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const obtenerModelos = async () => {
      const q = query(collection(db, 'biblioteca'), where('clienteId', '==', clienteId));
      const snapshot = await getDocs(q);
      setModelos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    obtenerCliente();
    obtenerExpedientes();
    obtenerModelos();
  }, [clienteId]);

  if (!cliente) return <p>Cargando datos del cliente...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Detalle del Cliente</h2>
      <p><strong>Nombre:</strong> {cliente.nombre}</p>
      <p><strong>Documento:</strong> {cliente.documento}</p>
      <p><strong>Email:</strong> {cliente.email || 'N/A'}</p>

      <hr />
      <h3>Expedientes Asociados</h3>
      <ul>
        {expedientes.map(e => (
          <li key={e.id}>
            <b>{e.nombre}</b> – {e.materia}
          </li>
        ))}
      </ul>

      <hr />
      <h3>Modelos Legales Asociados</h3>
      <ul>
        {modelos.map(m => (
          <li key={m.id}>
            <a href={m.url} target="_blank" rel="noopener noreferrer">{m.nombre}</a>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate(-1)} style={{ marginTop: 20 }}>Volver</button>
    </div>
  );
};

export default ClienteDetalle;
