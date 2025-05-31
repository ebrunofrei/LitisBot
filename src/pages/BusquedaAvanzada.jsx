import React, { useState } from 'react';

const CATEGORIAS = [
  'Jurídico',
  'Administrativo',
  'Penal',
  'Civil',
  'Laboral',
  'Comercial',
];

const BUSQUEDA_SIMULADA = [
  { id: 1, titulo: 'Derecho Administrativo Peruano', categoria: 'Administrativo' },
  { id: 2, titulo: 'Casos de Derecho Penal', categoria: 'Penal' },
  { id: 3, titulo: 'Reformas Laborales 2025', categoria: 'Laboral' },
  { id: 4, titulo: 'Contratos Civiles Básicos', categoria: 'Civil' },
  { id: 5, titulo: 'Ley de Comercio Exterior', categoria: 'Comercial' },
];

const BusquedaAvanzada = () => {
  const [palabraClave, setPalabraClave] = useState('');
  const [categoria, setCategoria] = useState('');
  const [resultados, setResultados] = useState([]);

  const manejarBusqueda = (e) => {
    e.preventDefault();

    // Filtra resultados simulados según palabra clave y categoría
    let filtrados = BUSQUEDA_SIMULADA;

    if (palabraClave.trim() !== '') {
      filtrados = filtrados.filter(item =>
        item.titulo.toLowerCase().includes(palabraClave.toLowerCase())
      );
    }

    if (categoria !== '') {
      filtrados = filtrados.filter(item => item.categoria === categoria);
    }

    setResultados(filtrados);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Búsqueda Avanzada</h1>
      <form onSubmit={manejarBusqueda}>
        <div>
          <label>Palabra clave:</label><br />
          <input
            type="text"
            value={palabraClave}
            onChange={e => setPalabraClave(e.target.value)}
            placeholder="Ingresa palabra clave"
            style={{ width: '300px', padding: '6px' }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Categoría:</label><br />
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            style={{ width: '310px', padding: '6px' }}
          >
            <option value="">-- Todas --</option>
            {CATEGORIAS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ marginTop: 15, padding: '8px 12px' }}>
          Buscar
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <h2>Resultados:</h2>
        {resultados.length === 0 ? (
          <p>No hay resultados para la búsqueda.</p>
        ) : (
          <ul>
            {resultados.map(item => (
              <li key={item.id}>
                <strong>{item.titulo}</strong> - <em>{item.categoria}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BusquedaAvanzada;
