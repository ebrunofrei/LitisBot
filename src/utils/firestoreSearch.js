import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

async function buscarEnFirestore(texto, filtros) {
  let coleccionRef = collection(db, 'biblioteca');
  let consultas = [];

  // Filtrar por tipo si está definido
  if (filtros.tipo) {
    consultas.push(where('tipo', '==', filtros.tipo));
  }

  // Filtrar por fechas
  if (filtros.fechaDesde) {
    consultas.push(where('createdAt', '>=', new Date(filtros.fechaDesde)));
  }
  if (filtros.fechaHasta) {
    consultas.push(where('createdAt', '<=', new Date(filtros.fechaHasta)));
  }

  // Filtrar por texto: para texto simple, Firestore no tiene búsqueda full text,
  // así que buscaré coincidencia en el campo 'name' con '>= texto' y '<= texto + \uf8ff'
  consultas.push(where('name', '>=', texto));
  consultas.push(where('name', '<=', texto + '\uf8ff'));

  let q = query(coleccionRef, ...consultas, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
