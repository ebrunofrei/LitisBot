
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const verificarVigencia = require("./vigenciaNormativa");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let normas = [];
try {
  const data = fs.readFileSync("./normas.json", "utf8");
  normas = JSON.parse(data);
  console.log("Normas cargadas correctamente:", normas.length);
} catch (error) {
  console.error("Error al cargar normas:", error);
}

app.post("/api/juicio/analyze", (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ respuesta: "Texto no proporcionado." });

  const coincidencias = buscarNormasRelacionadas(texto);
  if (coincidencias.length > 0) {
    return res.json({ respuesta: formatRespuesta(coincidencias) });
  } else {
    return res.json({ respuesta: "No se detectaron normas relevantes. Revisa el contenido o sé más específico." });
  }
});

function buscarNormasRelacionadas(texto) {
  const textoLower = texto.toLowerCase();
  return normas.filter(n =>
    textoLower.includes(n.articulo.toLowerCase()) ||
    textoLower.includes(n.codigo.toLowerCase().split(" ")[1]) ||
    textoLower.includes(n.contenido.toLowerCase().split(" ").slice(0, 5).join(" "))
  );
}

function formatRespuesta(lista) {
  return lista.map(n => {
    const vigencia = verificarVigencia(n.codigo, n.articulo);
    return `📘 *${n.codigo}*, Art. ${n.articulo}:
${n.contenido}

🧾 Estado legal: ${vigencia}`;
  }).join("\n\n");
}

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});

