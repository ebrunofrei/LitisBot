// src/pages/Expediente.jsx
import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';

const Expediente = () => {
  const [user] = useAuthState(auth);
  const [expedientes, setExpedientes] = useState([]);
  const [nombreExpediente, setNombreExpediente] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [expedienteActivo, setExpedienteActivo] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, `usuarios/${user.uid}/expedientes`),
      snapshot => {
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpedientes(lista);
      }
    );
    return () => unsub();
  }, [user]);

  const crearExpediente = async () => {
    if (!nombreExpediente.trim()) return;
    await addDoc(collection(db, `usuarios/${user.uid}/expedientes`), {
      nombre: nombreExpediente.trim(),
      creadoEn: new Date()
    });
    setNombreExpediente('');
  };

  const subirArchivo = async () => {
    if (!archivo || !expedienteActivo) return;

    const archivoRef = ref(storage, `usuarios/${user.uid}/expedientes/${expedienteActivo}/${archivo.name}`);
    await uploadBytes(archivoRef, archivo);
    const url = await getDownloadURL(archivoRef);

    await addDoc(collection(db, `usuarios/${user.uid}/expedientes/${expedienteActivo}/archivos`), {
      nombre: archivo.name,
      url,
      creadoEn: new Date()
    });

    setArchivo(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestión de Expedientes Digitales</h2>

      <div>
        <input
          value={nombreExpediente}
          onChange={(e) => setNombreExpediente(e.target.value)}
          placeholder="Nombre del expediente"
        />
        <button onClick={crearExpediente}>Crear</button>
      </div>

      <ul>
        {expedientes.map((exp) => (
          <li key={exp.id}>
            <button onClick={() => setExpedienteActivo(exp.id)}>{exp.nombre}</button>
          </li>
        ))}
      </ul>

      {expedienteActivo && (
        <div>
          <h3>Subir archivo al expediente</h3>
          <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />
          <button onClick={subirArchivo}>Subir</button>
        </div>
      )}
    </div>
  );
};

export default Expediente;
