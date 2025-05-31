// src/components/LitisBotConVoz/LegalSourcesDatabase.js
import { db } from '../../firebase';
import { collection, doc, setDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * Registra o actualiza una fuente legal en Firestore.
 * @param {Object} fuente - Contiene los campos: tipo, cita, descripcion, enlace, materia.
 */
export const saveLegalSource = async (fuente) => {
  if (!fuente || !fuente.cita || !fuente.materia) return;

  const ref = doc(collection(db, 'fuentesLegales'), fuente.cita);

  try {
    await setDoc(ref, {
      tipo: fuente.tipo || 'jurisprudencia',
      cita: fuente.cita,
      descripcion: fuente.descripcion || '',
      enlace: fuente.enlace || '',
      materia: fuente.materia || 'general',
      citada: increment(1),
      ultimaActualizacion: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error al guardar la fuente legal:', error);
  }
};

/**
 * Incrementa la frecuencia de citación de una fuente ya registrada.
 * @param {string} cita - Identificador de la fuente.
 */
export const incrementarCitaFuente = async (cita) => {
  if (!cita) return;

  const ref = doc(collection(db, 'fuentesLegales'), cita);
  try {
    await updateDoc(ref, {
      citada: increment(1),
      ultimaActualizacion: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al actualizar la fuente legal:', error);
  }
};
