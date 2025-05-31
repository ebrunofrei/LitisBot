// src/components/LitisBotConVoz/VisualResponse.jsx
import React from 'react';

const VisualResponse = ({ respuesta }) => {
  if (!respuesta) return null;

  const {
    texto,
    fundamentos = [],
    jurisprudencia = [],
    acciones = [],
    enlaces = [],
    documentos = []
  } = respuesta;

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '1rem' }}>
      {texto && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Respuesta principal:</strong>
          <p>{texto}</p>
        </div>
      )}

      {fundamentos.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Fundamentos normativos 📘:</strong>
          <ul>
            {fundamentos.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      )}

      {jurisprudencia.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Jurisprudencia relevante ⚖:</strong>
          <ul>
            {jurisprudencia.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      )}

      {acciones.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Sugerencias o acciones legales ✅:</strong>
          <ul>
            {acciones.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      )}

      {enlaces.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Enlaces útiles 🔗:</strong>
          <ul>
            {enlaces.map(({ url, label }, idx) => (
              <li key={idx}><a href={url} target="_blank" rel="noopener noreferrer">{label}</a></li>
            ))}
          </ul>
        </div>
      )}

      {documentos.length > 0 && (
        <div>
          <strong>Documentos descargables 📄:</strong>
          <ul>
            {documentos.map(({ url, nombre }, idx) => (
              <li key={idx}><a href={url} download>{nombre}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VisualResponse;
