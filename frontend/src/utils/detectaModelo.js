export function detectarModelo(pregunta) {
  if (!pregunta) return null;
  const texto = pregunta.toLowerCase();

  const modelos = [
    {
      claves: ["modelo de demanda", "plantilla de demanda", "formato de demanda", "modelo demanda"],
      titulo: "Modelo de Demanda (Word)",
      enlace: "/modelos/modelo_demanda_final.docx"
    },
    {
      claves: ["modelo de carta", "plantilla de carta", "formato carta reclamo"],
      titulo: "Modelo de Carta de Reclamo",
      enlace: "/modelos/carta_reclamo.docx"
    },
    {
      claves: ["modelo de oficio", "formato de oficio simple", "plantilla de oficio"],
      titulo: "Modelo de Oficio Simple",
      enlace: "/modelos/oficio_simple.docx"
    }
  ];

  for (const modelo of modelos) {
    if (modelo.claves.some(clave => texto.includes(clave))) {
      return modelo;
    }
  }

  return null;
}
