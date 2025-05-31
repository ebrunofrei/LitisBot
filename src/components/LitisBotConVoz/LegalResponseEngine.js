// src/components/LitisBotConVoz/LegalResponseEngine.js
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * Consulta en Firebase las fuentes legales más citadas según la materia y las incluye como respuesta preferente.
 * @param {string} inputText - Pregunta del usuario
 * @param {Object} options - Contiene tipoJuicio, materia, registrarFuente, userId
 * @returns {Object} respuesta estructurada
 */
export const handleLegalResponse = async (inputText, { tipoJuicio, materia, registrarFuente, userId }) => {
  const lowerInput = inputText.toLowerCase();

  // Resultado estructurado
  const resultado = {
    texto: '',
    fundamentos: [],
    jurisprudencia: [],
    acciones: [],
    enlaces: [],
    documentos: []
  };

  // 1. Buscar fuentes desde Firebase
  try {
    const fuentesRef = collection(db, 'fuentesLegales');
    const q = query(fuentesRef, where('materia', '==', materia), orderBy('citada', 'desc'), limit(3));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      resultado.texto = `📚 Fuentes legales más citadas en ${materia}:\n`;

      querySnapshot.forEach(doc => {
        const fuente = doc.data();
        resultado.fundamentos.push(`${fuente.tipo?.toUpperCase() || 'FUENTE'}: ${fuente.cita}. ${fuente.descripcion || ''}`);
        if (registrarFuente) registrarFuente(fuente);
      });

      resultado.acciones.push('Puedes solicitar que se profundice en alguna de estas fuentes.');
      resultado.texto += `\n🔍 ¿Te gustaría que profundice en alguna de estas fuentes o necesitas un modelo específico?\n`;

      return resultado;
    }
  } catch (error) {
    console.error('Error consultando fuentes legales:', error);
  }

  // 2. Simulación si no se encuentra en Firebase
  const baseResponses = {
    civil: {
      penal: 'En el proceso civil, no se aplican normas penales. Verifica la jurisdicción.',
      consulta: 'El Código Civil regula las obligaciones y contratos. ¿Deseas un modelo de demanda civil?'
    },
    penal: {
      penal: 'Puedes objetar una pregunta si es capciosa, impertinente o sugiere la respuesta.',
      consulta: 'El Código Penal y el Código Procesal Penal rigen este ámbito. ¿Necesitas preparar una defensa?'
    },
    constitucional: {
      penal: 'En juicio penal se puede invocar el control difuso si una norma vulnera la Constitución.',
      consulta: 'El Tribunal Constitucional ha establecido precedentes vinculantes sobre derechos fundamentales.'
    },
    administrativo: {
      penal: 'Consulta no válida: el proceso penal no se rige por la Ley del Procedimiento Administrativo General.',
      consulta: 'Puedes impugnar una resolución administrativa invocando el artículo 10 del TUO de la Ley N.º 27444.'
    },
    laboral: {
      penal: 'El fuero penal solo interviene si hay delito, no para reclamos laborales.',
      consulta: 'Puedes iniciar un proceso laboral invocando el artículo 26 de la Constitución y la Ley N.º 29497.'
    },
    familia: {
      penal: 'En delitos contra la familia, como violencia familiar, rige la Ley N.º 30364.',
      consulta: 'Puedes solicitar medidas de protección con base en la Ley N.º 30364.'
    },
    tributario: {
      penal: 'El derecho penal tributario se aplica cuando hay delito fiscal. Revisa el Código Penal, art. 179 y ss.',
      consulta: 'SUNAT y el Código Tributario regulan la materia. ¿Buscas un recurso de reclamación o apelación?'
    },
    comercial: {
      penal: 'Solo hay intervención penal si se configura un delito como fraude societario.',
      consulta: 'El derecho comercial regula sociedades, títulos valores y contratos mercantiles. ¿Deseas un modelo?'
    },
    notarial: {
      penal: 'En el ámbito notarial, los delitos comunes pueden ser falsedad ideológica o uso de documento falso.',
      consulta: 'Puedes solicitar una escritura pública conforme al Reglamento Notarial y al Código Civil.'
    },
    ambiental: {
      penal: 'Hay delitos ambientales tipificados en el Código Penal. Se requiere peritaje especializado.',
      consulta: 'Consulta la Ley General del Ambiente, Ley N.º 28611, y regulaciones sectoriales.'
    },
    general: {
      penal: '¿Te refieres a una estrategia de defensa o una pregunta jurídica general? Puedes precisar más.',
      consulta: 'Estoy listo para ayudarte con cualquier consulta legal. ¿Deseas jurisprudencia, doctrina o modelo?'
    }
  };

  const materiaKey = baseResponses[materia] ? materia : 'general';
  const tipoKey = tipoJuicio === 'penal' ? 'penal' : 'consulta';

  resultado.texto = baseResponses[materiaKey][tipoKey];
  resultado.acciones.push('Puedes pedirme un modelo de escrito o desarrollar una estrategia legal.');
  return resultado;
};
