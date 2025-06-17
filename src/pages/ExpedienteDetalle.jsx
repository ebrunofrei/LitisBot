// src/pages/ExpedienteDetalle.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const ExpedienteDetalle = () => {
  const { carpetaId } = useParams();
  const [documentos, setDocumentos] = useState([]);
  const [fuentes, setFuentes] = useState([]);
  const [nombreCarpeta, setNombreCarpeta] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubDocs = onSnapshot(
      query(collection(db, 'biblioteca'), where('carpetaId', '==', carpetaId)),
      snapshot => {
        setDocumentos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubFuentes = onSnapshot(
      query(collection(db, 'fuentesLegal'), where('carpetaId', '==', carpetaId)),
      snapshot => {
        setFuentes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubDocs();
      unsubFuentes();
    };
  }, [carpetaId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Expediente: {nombreCarpeta || carpetaId}</h2>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        Volver
      </button>

      <h3>📄 Documentos relacionados</h3>
      {documentos.length === 0 ? (
        <p>No hay documentos registrados.</p>
      ) : (
        <ul>
          {documentos.map(doc => (
            <li key={doc.id}>
              <a href={doc.url} target="_blank" rel="noreferrer">{doc.nombre}</a>
            </li>
          ))}
        </ul>
      )}

      <h3>📚 Fuentes Jurídicas citadas</h3>
      {fuentes.length === 0 ? (
        <p>No se han citado fuentes para este expediente.</p>
      ) : (
        <ul>
          {fuentes.map(f => (
            <li key={f.id}>
              <b>{f.tipo}:</b> {f.cita} ({f.materia})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpedienteDetalle;
