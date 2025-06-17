import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function ExampleUUID() {
  const [id, setId] = useState('');

  const generarId = () => {
    const nuevoId = uuidv4();
    setId(nuevoId);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Generar UUID</h2>
      <button onClick={generarId}>Generar nuevo ID</button>
      {id && (
        <p>ID generado: <code>{id}</code></p>
      )}
    </div>
  );
}

export default ExampleUUID;
