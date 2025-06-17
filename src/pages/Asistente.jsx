import React, { useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Asistente = () => {
  const [consulta, setConsulta] = useState('');
  const [filtros, setFiltros] = useState({ fechaDesde: '', fechaHasta: '', tipo: '' });
  const [resultadosInternos, setResultadosInternos] = useState([]);
  const [resultadosWeb, setResultadosWeb] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // Buscar en Firestore con filtros básicos
  const buscarEnFirestore = async (texto, filtros) => {
    try {
      const coleccionRef = collection(db, 'biblioteca');
      let condiciones = [];

      if (filtros.tipo) condiciones.push(where('tipo', '==', filtros.tipo));
      if (filtros.fechaDesde) condiciones.push(where('createdAt', '>=', new Date(filtros.fechaDesde)));
      if (filtros.fechaHasta) condiciones.push(where('createdAt', '<=', new Date(filtros.fechaHasta)));
      condiciones.push(where('name', '>=', texto));
      condiciones.push(where('name', '<=', texto + '\uf8ff'));

      const q = query(coleccionRef, ...condiciones, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error buscando en Firestore:', error);
      return [];
    }
  };

  // Buscar en Google Custom Search API
  const buscarEnWeb = async (texto) => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const cx = process.env.REACT_APP_GOOGLE_CSE_ID;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(texto)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error en búsqueda web:', error);
      return [];
    }
  };

  const buscar = async () => {
    if (!consulta.trim()) return;
    setBuscando(true);
    setResultadosInternos([]);
    setResultadosWeb([]);

    // Buscar en Firestore
    const internos = await buscarEnFirestore(consulta, filtros);
    setResultadosInternos(internos);

    // Si no hay resultados internos, buscar en web
    if (internos.length === 0) {
      const externos = await buscarEnWeb(consulta);
      setResultadosWeb(externos);
    }

    setBuscando(false);
  };

  const resetear = () => {
    setConsulta('');
    setFiltros({ fechaDesde: '', fechaHasta: '', tipo: '' });
    setResultadosInternos([]);
    setResultadosWeb([]);
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      <h2>🔎 Asistente Legal</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Ingrese su consulta"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          style={{ width: '80%', padding: 8 }}
        />
        <button onClick={buscar} disabled={buscando || !consulta.trim()} style={{ marginLeft: 10 }}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Aquí podrías agregar filtros para fecha y tipo si quieres */}

      <div>
        <h3>Resultados de búsqueda interna:</h3>
        {resultadosInternos.length === 0 ? (
          <p>No se encontraron resultados internos.</p>
        ) : (
          <ul>
            {resultadosInternos.map(item => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noreferrer" download>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Resultados de búsqueda web:</h3>
        {resultadosWeb.length === 0 ? (
          <p>No se encontraron resultados web.</p>
        ) : (
          <ul>
            {resultadosWeb.map(item => (
              <li key={item.cacheId || item.link}>
                <a href={item.link} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                <p>{item.snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={resetear}>Nueva consulta</button>
      </div>
    </div>
  );
};

export default Asistente;

