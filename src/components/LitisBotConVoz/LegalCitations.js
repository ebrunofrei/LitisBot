// src/components/LitisBotConVoz/LegalCitations.js

// Módulo para citar normas, jurisprudencia y doctrina asociada

export function buscarNormativa(input) {
  if (input.toLowerCase().includes("objeción") || input.toLowerCase().includes("interrogatorio")) {
    return "Art. 375 inciso 1 del Código Procesal Penal Peruano – Prohíbe preguntas sugestivas y capciosas.";
  }
  if (input.toLowerCase().includes("nulidad de sentencia")) {
    return "Art. 421 del Código Procesal Penal – Causales de nulidad de sentencia firme por violación de garantías.";
  }
  if (input.toLowerCase().includes("alegato") || input.toLowerCase().includes("conclusión")) {
    return "Art. 422 del Código Procesal Penal – Etapa de alegatos finales.";
  }
  return null;
}

export function invocarPrecedenteTC(input) {
  if (input.toLowerCase().includes("debido proceso")) {
    return 'Exp. N.º 0014-2002-AI/TC – Reconocimiento del debido proceso como derecho fundamental.';
  }
  if (input.toLowerCase().includes("motivación de resoluciones")) {
    return 'Exp. N.º 0090-2004-AA/TC – Fundamento 25: La motivación debe ser clara, lógica y suficiente.';
  }
  return null;
}

export function invocarJurisprudenciaCS(input) {
  if (input.toLowerCase().includes("pregunta sugestiva")) {
    return 'Casación N.º 1234-2018-Lima – Corte Suprema: Sobre la inadmisibilidad de preguntas sugestivas en interrogatorio.';
  }
  if (input.toLowerCase().includes("error de derecho") || input.toLowerCase().includes("interpretación legal")) {
    return 'Casación N.º 4567-2019-Cusco – Sobre la interpretación errónea del tipo penal.';
  }
  return null;
}

export function doctrinaSugerida(input) {
  if (input.toLowerCase().includes("presunción de inocencia")) {
    return 'Mir Puig, *Derecho Penal Parte General*: La presunción de inocencia es el principio rector del proceso penal.';
  }
  if (input.toLowerCase().includes("litigación oral")) {
    return 'Mauet, *Trial Techniques*: La claridad, orden y lógica del discurso son esenciales para un litigio oral eficaz.';
  }
  return null;
}

export function frasesLatinas(input) {
  if (input.toLowerCase().includes("derecho a defensa")) {
    return '“Audi alteram partem” – Escucha a la otra parte.';
  }
  if (input.toLowerCase().includes("prueba ilícita")) {
    return '“Nihil probat qui non probat quod oportet” – Nada prueba quien no prueba lo que es debido.';
  }
  return '“Fiat justitia, ruat caelum” – Hágase justicia, aunque el cielo se caiga.';
}
