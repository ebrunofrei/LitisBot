import React from 'react';

const modelosData = [
  {
    id: 1,
    titulo: 'Recurso de Apelación',
    descripcion: 'Modelo para presentar recurso de apelación ante entidad administrativa.',
    archivoUrl: '/modelos/recurso_apelacion.docx', // Ruta al archivo en tu servidor o almacenamiento
  },
  {
    id: 2,
    titulo: 'Recurso de Reconsideración',
    descripcion: 'Modelo para presentar recurso de reconsideración contra papeletas municipales.',
    archivoUrl: '/modelos/recurso_reconsideracion.docx',
  },
  {
    id: 3,
    titulo: 'Reclamo Administrativo',
    descripcion: 'Modelo para presentar reclamo administrativo en entidades públicas.',
    archivoUrl: '/modelos/reclamo_administrativo.docx',
  },
];

const Modelos = () => {
  const handleDownload = (url) => {
    window.open(url, '_blank'); // Abre el archivo en nueva pestaña para descarga
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Modelos de Escritos Legales</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {modelosData.map((modelo) => (
          <li
            key={modelo.id}
            style={{
              border: '1px solid #ccc',
              padding: 15,
              marginBottom: 10,
              borderRadius: 5,
            }}
          >
            <h3>{modelo.titulo}</h3>
            <p>{modelo.descripcion}</p>
            <button onClick={() => handleDownload(modelo.archivoUrl)}>Descargar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Modelos;
