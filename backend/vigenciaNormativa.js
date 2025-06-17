
const fs = require("fs");

function verificarVigencia(codigo, articulo) {
  try {
    const data = fs.readFileSync("./estado_normas.json", "utf8");
    const estados = JSON.parse(data);

    const estadoNorma = estados.find(n =>
      n.codigo.toLowerCase() === codigo.toLowerCase() &&
      n.articulo.toLowerCase() === articulo.toLowerCase()
    );

    if (!estadoNorma) {
      return "⚠️ Estado de vigencia no registrado. Verificar manualmente.";
    }

    if (estadoNorma.estado === "vigente") {
      return `✅ Vigente desde ${estadoNorma.vigencia}.`;
    } else if (estadoNorma.estado === "derogada") {
      return `❌ Derogada por ${estadoNorma.derogada_por} el ${estadoNorma.derogacion}.`;
    } else if (estadoNorma.estado === "vacatio legis") {
      return `⏳ Vacatio legis. Entra en vigencia el ${estadoNorma.vigencia}.`;
    } else if (estadoNorma.estado === "pendiente reglamentación") {
      return `📄 Aprobada pero pendiente de reglamentación. Fecha prevista: ${estadoNorma.vigencia || "no definida"}.`;
    }

    return "⚠️ Estado normativo desconocido.";
  } catch (error) {
    return "❌ Error al verificar vigencia: " + error.message;
  }
}

module.exports = verificarVigencia;
