// src/pages/BuscadorGoogle.jsx
import React, { useState } from 'react';

const BuscadorGoogle = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    // Simulación de resultados
    setResults([
      { id: 1, title: `Resultado para "${query}" #1`, link: '#' },
      { id: 2, title: `Resultado para "${query}" #2`, link: '#' },
    ]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Buscador Google</h1>
      <input
        type="text"
        placeholder="Escribe para buscar"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ width: 300, padding: 8 }}
      />
      <button onClick={handleSearch} style={{ marginLeft: 10, padding: 8 }}>
        Buscar
      </button>

      <ul style={{ marginTop: 20 }}>
        {results.map(r => (
          <li key={r.id}>
            <a href={r.link}>{r.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BuscadorGoogle;
