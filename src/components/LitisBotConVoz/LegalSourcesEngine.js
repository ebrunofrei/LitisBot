// src/components/LitisBotConVoz/LegalSourcesEngine.js

export const legalSourcesDB = {
  penal: {
    jurisprudencia: [
      {
        titulo: "Casación N.º 219-2017-Lima",
        fuente: "Corte Suprema de Justicia",
        resumen: "Define el criterio de valoración de la retractación en delitos sexuales.",
        enlace: "https://www.pj.gob.pe/casacion-219-2017-lima"
      }
    ],
    normas: [
      {
        articulo: "Art. 1 del CPP",
        descripcion: "Finalidad del proceso penal en el Estado de Derecho"
      }
    ],
    doctrina: [
      {
        autor: "Roxin, Claus",
        obra: "Derecho Penal. Parte General",
        enfoque: "Rol de la culpabilidad como límite a la pena"
      }
    ]
  },
  civil: {
    jurisprudencia: [
      {
        titulo: "Casación N.º 1234-2020-Lima",
        fuente: "Corte Suprema",
        resumen: "Sobre la nulidad de acto jurídico por falta de manifestación válida de voluntad.",
        enlace: "https://www.pj.gob.pe/casacion-1234-2020"
      }
    ],
    normas: [
      {
        articulo: "Art. 219 CC",
        descripcion: "Causales de nulidad de acto jurídico"
      }
    ],
    doctrina: [
      {
        autor: "Messineo, Francesco",
        obra: "Manual de Derecho Civil",
        enfoque: "Concepto de voluntad negocial"
      }
    ]
  }
  // Puedes seguir agregando materias...
};

export const getLegalSourcesByMateria = (materia = 'general') => {
  return legalSourcesDB[materia] || {};
};
