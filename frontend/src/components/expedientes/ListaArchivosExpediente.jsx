// src/components/Expedientes/ListaArchivosExpediente.jsx
import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const ListaArchivosExpediente = ({ clienteId, expedienteId }) => {
  const [archivos, setArchivos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const storage = getStorage();
  const rutaBase = `expedientes/${clienteId}/${expedienteId}`;

  const cargarArchivos = async () => {
    const listaRef = ref(storage, rutaBase);
    const resultado = await listAll(listaRef);
    const urls = await Promise.all(
      resultado.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const nombre = itemRef.name;
        return { nombre, url, fullPath: itemRef.fullPath };
      })
    );
    setArchivos(urls);
  };

  useEffect(() => {
    if (clienteId && expedienteId) {
      cargarArchivos();
    }
  }, [clienteId, expedienteId]);

  const eliminarArchivo = async (fullPath) => {
    try {
      await deleteObject(ref(storage, fullPath));
      alert('Archivo eliminado.');
      cargarArchivos();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('No se pudo eliminar.');
    }
  };

  const iniciarEdicion = (nombreActual) => {
    setEditando(nombreActual);
    setNuevoNombre(nombreActual.replace(/\.[^/.]+$/, ''));
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoNombre('');
  };

  const renombrarArchivo = async (archivo) => {
    const extension = archivo.nombre.split('.').pop();
    const nuevoNombreConExt = `${nuevoNombre}.${extension}`;
    const nuevaRuta = `${rutaBase}/${nuevoNombreConExt}`;

    try {
      const archivoRef = ref(storage, archivo.fullPath);
      const archivoNuevoRef = ref(storage, nuevaRuta);

      // Descargar y volver a subir
      const response = await fetch(archivo.url);
      const blob = await response.blob();
      await deleteObject(archivoRef);
      await archivoNuevoRef.put(blob);

      cancelarEdicion();
      alert('Archivo renombrado.');
      cargarArchivos();
    } catch (error) {
      console.error('Error renombrando:', error);
      alert('No se pudo renombrar.');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>Archivos del Expediente</h4>
      {archivos.length === 0 ? (
        <p>No hay archivos subidos.</p>
      ) : (
        <ul>
          {archivos.map((archivo) => (
            <li key={archivo.fullPath} style={{ marginBottom: 8 }}>
              {editando === archivo.nombre ? (
                <>
                  <input
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    style={{ marginRight: 5 }}
                  />
                  <button onClick={() => renombrarArchivo(archivo)}>Guardar</button>
                  <button onClick={cancelarEdicion} style={{ marginLeft: 5 }}>Cancelar</button>
                </>
              ) : (
                <>
                  <a href={archivo.url} target="_blank" rel="noopener noreferrer">
                    {archivo.nombre}
                  </a>
                  <button onClick={() => iniciarEdicion(archivo.nombre)} style={{ marginLeft: 10 }}>Editar</button>
                  <button onClick={() => eliminarArchivo(archivo.fullPath)} style={{ marginLeft: 5, color: 'red' }}>
                    Eliminar
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListaArchivosExpediente;
