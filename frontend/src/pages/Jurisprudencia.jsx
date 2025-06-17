// src/pages/Jurisprudencia.jsx
import React, { useEffect, useState } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Jurisprudencia = () => {
  const [user, setUser] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qDocs = query(collection(db, 'jurisprudencia'), orderBy('createdAt', 'desc'));
    const unsubDocs = onSnapshot(qDocs, snapshot => {
      setDocumentos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubDocs();
    };
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Debes iniciar sesión para ver jurisprudencia.</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: 10 }}>
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Jurisprudencia</h2>

      {documentos.length === 0 ? (
        <p>No hay documentos disponibles.</p>
      ) : (
        <ul>
          {documentos.map(doc => (
            <li key={doc.id} style={{ marginBottom: 10 }}>
              <a href={doc.url} target="_blank" rel="noreferrer" download>
                {doc.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Jurisprudencia;
