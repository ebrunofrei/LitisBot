// src/components/expedientes/SubirArchivoExpediente.jsx
import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const SubirArchivoExpediente = ({ clienteId, expedienteId }) => {
  const [archivo, setArchivo] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('escrito');
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [user] = useAuthState(auth);

  const handleUpload = async () => {
    if (!archivo || !user || !clienteId || !expedienteId) {
      setMensaje('Faltan datos necesarios.');
      return;
    }

    setSubiendo(true);
    setMensaje('');

    try {
      const fileRef = ref(
        storage,
        `usuarios/${user.uid}/clientes/${clienteId}/expedientes/${expedienteId}/${archivo.name}`
      );
      await uploadBytes(fileRef, archivo);
      const url = await getDownloadURL(fileRef);

      await addDoc(
        collection(db, `usuarios/${user.uid}/clientes/${clienteId}/expedientes/${expedienteId}/archivos`),
        {
          nombre: archivo.name,
          url,
          tipo,
          descripcion,
          subidoPor: user.email,
          creadoEn: Timestamp.now()
        }
      );

      setMensaje('✅ Archivo subido correctamente');
      setArchivo(null);
      setDescripcion('');
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al subir el archivo');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: 'auto' }}>
      <h3>Subir documento al expediente</h3>

      <input type="file" onChange={(e) => setArchivo(e.target.files[0])} style={{ marginBottom: 10 }} />
      <br />
      <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ marginBottom: 10, width: '100%' }}>
        <option value="escrito">Escrito</option>
        <option value="resolucion">Resolución</option>
        <option value="imagen">Imagen</option>
        <option value="modelo">Modelo</option>
        <option value="otro">Otro</option>
      </select>
      <textarea
        placeholder="Descripción o detalle del archivo"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        style={{ width: '100%', marginBottom: 10 }}
      />
      <button onClick={handleUpload} disabled={subiendo}>
        {subiendo ? 'Subiendo...' : 'Subir archivo'}
      </button>

      {mensaje && <p style={{ marginTop: 10, color: mensaje.startsWith('✅') ? 'green' : 'red' }}>{mensaje}</p>}
    </div>
  );
};

export default SubirArchivoExpediente;
