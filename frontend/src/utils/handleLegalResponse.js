import { detectarModelo } from "./detectaModelo";

export async function handleLegalResponse(pregunta) {
  if (!pregunta || pregunta.trim().length === 0) {
    return "Por favor, formula tu consulta legal para poder ayudarte.";
  }

  // 1. Verifica si es una solicitud de modelo
  const modelo = detectarModelo(pregunta);
  if (modelo) {
    return `Aquí tienes un modelo descargable:\n👉 [${modelo.titulo}](${modelo.enlace})`;
  }

  // 2. Respuesta genérica temporal (puedes conectar aquí tu backend)
  return `Gracias por tu consulta: "${pregunta}". Pronto te brindaré una respuesta más detallada.`;
}
