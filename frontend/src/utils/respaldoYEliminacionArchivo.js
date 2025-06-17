// src/utils/respaldoYEliminacionArchivo.js
import { db, storage } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject
} from 'firebase/storage';

/**
 * Realiza el respaldo del archivo en Firestore y Storage antes de eliminarlo.
 * @param {string} userId - ID del usuario
 * @param {string} clienteId - ID del cliente
 * @param {string} expedienteId - ID del expediente
 * @param {Object} archivo - Objeto con información del archivo (id, nombre, url, tipo, etc.)
 */
export const respaldarYEliminarArchivo = async (userId, clienteId, expedienteId, archivo) => {
  try {
    // Paso 1: Descargar archivo original desde su URL
    const response = await fetch(archivo.url);
    const blob = await response.blob();

    // Paso 2: Subir respaldo a carpeta /backups/
    const nombreRespaldo = `${Date.now()}-${archivo.nombre}`;
    const backupRef = ref(storage, `backups/${userId}/${clienteId}/${expedienteId}/${nombreRespaldo}`);
    await uploadBytes(backupRef, blob);
    const backupUrl = await getDownloadURL(backupRef);

    // Paso 3: Guardar metadata del respaldo en Firestore
    const docRef = doc(db, `usuarios/${userId}/respaldoArchivos/${archivo.id}`);
    await setDoc(docRef, {
      ...archivo,
      urlRespaldo: backupUrl,
      respaldadoEn: Timestamp.now(),
      clienteId,
      expedienteId,
      userId
    });

    // Paso 4: Eliminar archivo original de Storage
    const originalRef = ref(storage, `expedientes/${userId}/${clienteId}/${expedienteId}/${archivo.nombre}`);
    await deleteObject(originalRef);

    // Paso 5: Eliminar referencia en Firestore
    await deleteDoc(doc(db, `usuarios/${userId}/clientes/${clienteId}/expedientes/${expedienteId}/archivos/${archivo.id}`));

    return { success: true };
  } catch (error) {
    console.error('Error al respaldar y eliminar el archivo:', error);
    return { success: false, error };
  }
};
