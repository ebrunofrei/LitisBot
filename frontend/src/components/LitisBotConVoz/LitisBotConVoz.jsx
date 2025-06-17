import React, { useState, useRef } from "react";
import { db, auth, storage } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;

const estados = {
  INICIO: "Haz tu pregunta legal o toca el micrófono para hablar...",
  ESCUCHANDO: "Escuchando... habla ahora.",
  PROCESANDO: "Procesando tu consulta...",
  RESPONDIENDO: "¡Aquí tienes la respuesta!"
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const LIMITE_CONSULTAS_GRATIS = 10;

const AREAS_DERECHO = [
  "General", "Civil", "Penal", "Laboral", "Familia", "Constitucional", "Administrativo", "Comercial"
];

const OBJECIONES = [
  {
    tipo: "Pregunta impertinente",
    palabraClave: "impertinente",
    fundamento: "Artículo 188 del Código Procesal Civil Peruano: Las preguntas deben ser pertinentes, relacionadas directamente con los hechos materia de la litis.",
    ejemplo: "Objeción, señor juez: La pregunta es impertinente porque no guarda relación con el objeto del proceso.",
    fraseModelo: "Objeción por pregunta impertinente, solicito se reformule."
  },
  {
    tipo: "Pregunta capciosa",
    palabraClave: "capciosa",
    fundamento: "Artículo 192 CPC: Prohíbe preguntas capciosas o que sugieran la respuesta al testigo.",
    ejemplo: "Objeción, la pregunta es capciosa ya que induce la respuesta del testigo.",
    fraseModelo: "Objeción por pregunta capciosa, solicito se retire o se precise."
  },
  {
    tipo: "Leading question (sugestiva)",
    palabraClave: "sugestiva",
    fundamento: "Artículo 192 CPC: Las preguntas no deben ser sugestivas o inducir la respuesta.",
    ejemplo: "Objeción, la pregunta es sugestiva.",
    fraseModelo: "Objeción, la pregunta es sugestiva y contraviene la neutralidad exigida."
  },
  {
    tipo: "Violación del derecho de defensa",
    palabraClave: "defensa",
    fundamento: "Artículo 139.14 de la Constitución Política del Perú: Principio de derecho de defensa.",
    ejemplo: "Objeción, se está vulnerando el derecho de defensa.",
    fraseModelo: "Objeción por vulneración del derecho de defensa del litigante."
  },
  {
    tipo: "Pregunta reiterativa",
    palabraClave: "reiterativa",
    fundamento: "Artículo 192 CPC: No se permite la reiteración de preguntas ya respondidas.",
    ejemplo: "Objeción, la pregunta es reiterativa.",
    fraseModelo: "Objeción, la pregunta ya fue respondida previamente."
  },
  {
    tipo: "Pregunta confusa o ambigua",
    palabraClave: "confusa",
    fundamento: "Artículo 192 CPC: Las preguntas deben ser claras y precisas.",
    ejemplo: "Objeción, la pregunta es confusa y podría inducir a error.",
    fraseModelo: "Objeción, solicito se precise la pregunta por ambigüedad."
  }
];

const palabrasObjecion = [
  "objeción", "objección", "objeto", "me opongo", "protesto", "impugno", "impertinente", "capciosa", "sugestiva", "defensa", "reiterativa", "confusa"
];

const generarPromptJuicio = (area) => `
Eres LitisBot, asistente jurídico peruano experto en audiencias reales. Contexto: área de Derecho ${area}.
Tu función: 
- Responde como coach jurídico de litigio en audiencias reales.
- Cita artículos de ley, doctrina y jurisprudencia relevante (del Perú y derecho comparado) relacionadas al caso. 
- Incluye referencias verificables y breves explicaciones del fundamento normativo o jurisprudencial.
- Responde con técnica, claridad, frases procesales y estructura profesional.
Si el usuario formula una objeción, responde primero con la frase modelo, luego cita y explica el fundamento legal y, de ser posible, doctrina o jurisprudencia relacionada.
Si el usuario solicita alegatos, estrategias o tips, hazlo en el mismo formato: cita, explica y sugiere.
Nunca inventes fuentes: solo responde con referencias reales o bien identifica si el área tiene poca jurisprudencia aplicable.
`;

function resaltarNormas(texto) {
  return texto
    .replace(/(artículo\s?\d+[^.,;)]*)/gi, "<mark style='background:#ffeebb;color:#9e1e00;font-weight:bold'>$1</mark>")
    .replace(/(casación\s?n[°º]?\s?\d+[^.,;)]*)/gi, "<mark style='background:#ffeebb;color:#1e1e9e;font-weight:bold'>$1</mark>")
    .replace(/(STS\s?\d+\/\d+)/gi, "<mark style='background:#cbe1ff;color:#1854a6'>$1</mark>")
    .replace(/(constitución política del perú)/gi, "<mark style='background:#e9c3f8;color:#6d1591;font-weight:bold'>$1</mark>")
    .replace(/(código procesal civil|código penal|código procesal penal|código laboral|código de comercio)/gi, "<mark style='background:#e7f8c3;color:#265c1a;font-weight:bold'>$1</mark>");
}

const LitisBotConVoz = () => {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [estado, setEstado] = useState(estados.INICIO);
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [vozActiva, setVozActiva] = useState(true);
  const [consultasGratis, setConsultasGratis] = useState(
    parseInt(localStorage.getItem("consultasGratis") || LIMITE_CONSULTAS_GRATIS)
  );
  const [procesando, setProcesando] = useState(false);
  const [modoJuicio, setModoJuicio] = useState(false);
  const [esObjecion, setEsObjecion] = useState(false);
  const [modalObjecion, setModalObjecion] = useState(null);
  const [areaDerecho, setAreaDerecho] = useState("General");
  // Estados para archivos, audio/video, OCR
  const [archivo, setArchivo] = useState(null);
  const [archivoURL, setArchivoURL] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [transcripcion, setTranscripcion] = useState("");
  const [resumenAudio, setResumenAudio] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [ocrTexto, setOcrTexto] = useState("");
  const [ocrResumen, setOcrResumen] = useState("");
  const [ocrProcesando, setOcrProcesando] = useState(false);

  const inputRef = useRef(null);

  const toggleMicrofono = () => setMicrofonoActivo((v) => !v);
  const toggleVoz = () => setVozActiva((v) => !v);
  const toggleModoJuicio = () => setModoJuicio((v) => !v);

  // --- Reconocimiento de voz y voz masculina ---
  const handleEscuchar = () => {
    if (!recognition) {
      alert("El reconocimiento de voz no está disponible.");
      return;
    }
    setEscuchando(true);
    setEstado(estados.ESCUCHANDO);
    recognition.lang = "es-PE";
    recognition.start();

    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      setInput(texto);
      setEscuchando(false);
      setEstado(estados.PROCESANDO);
      handleEnviar(texto);
    };
    recognition.onerror = () => {
      setEscuchando(false);
      setEstado(estados.INICIO);
    };
    recognition.onend = () => setEscuchando(false);
  };

  // --- Voz masculina ---
  const handleHablar = (texto) => {
    if (vozActiva && "speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(texto);
      utter.lang = "es-PE";
      const voces = window.speechSynthesis.getVoices();
      const vozVaronil = voces.find(v =>
        (v.lang.startsWith("es") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("juan") || v.name.toLowerCase().includes("diego") || v.name.toLowerCase().includes("miguel")))
      );
      if (vozVaronil) utter.voice = vozVaronil;
      utter.pitch = 0.85;
      utter.rate = 0.97;
      synth.cancel();
      synth.speak(utter);
    }
  };

  // --- Subida de archivos ---
  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setArchivoURL(URL.createObjectURL(file));
    setTranscripcion("");
    setResumenAudio("");
    setOcrTexto("");
    setOcrResumen("");
  };

  const subirArchivoAFirebase = async () => {
    if (!archivo) return null;
    setSubiendo(true);
    try {
      const extension = archivo.name.split('.').pop();
      const storageRef = ref(storage, `audiencias/${Date.now()}_${archivo.name}`);
      await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(storageRef);
      setSubiendo(false);
      return { url, nombre: archivo.name, tipo: archivo.type, extension };
    } catch (err) {
      setSubiendo(false);
      alert("Error subiendo archivo: " + err.message);
      return null;
    }
  };

  // --- Análisis IA de audio/video ---
  const analizarArchivoConIA = async (archivoInfo) => {
    setAnalizando(true);
    setTranscripcion("");
    setResumenAudio("");
    try {
      const resp = await fetch(`${API_URL}/api/analizar-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: archivoInfo.url, nombre: archivoInfo.nombre })
      });
      if (!resp.ok) throw new Error("No se pudo analizar el archivo.");
      const data = await resp.json();
      setTranscripcion(data.transcripcion || "No se obtuvo transcripción.");
      setResumenAudio(data.resumen || "No se obtuvo resumen.");
    } catch (err) {
      setTranscripcion("Error al analizar: " + err.message);
      setResumenAudio("");
    }
    setAnalizando(false);
  };

  // --- Análisis IA de PDF/imagen (OCR) ---
  const analizarArchivoOCR = async (archivoInfo) => {
    setOcrProcesando(true);
    setOcrTexto("");
    setOcrResumen("");
    try {
      const resp = await fetch(`${API_URL}/api/analizar-ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: archivoInfo.url, nombre: archivoInfo.nombre, tipo: archivoInfo.tipo })
      });
      if (!resp.ok) throw new Error("No se pudo analizar el archivo.");
      const data = await resp.json();
      setOcrTexto(data.texto || "No se obtuvo texto OCR.");
      setOcrResumen(data.resumen || "No se obtuvo resumen.");
    } catch (err) {
      setOcrTexto("Error al analizar: " + err.message);
      setOcrResumen("");
    }
    setOcrProcesando(false);
  };

  // --- Streaming respuesta GPT ---
  const obtenerRespuestaStreaming = async (pregunta, esModoJuicio = false) => {
    try {
      setProcesando(true);
      setRespuesta("");
      setEstado(estados.PROCESANDO);

      const texto = esModoJuicio
        ? generarPromptJuicio(areaDerecho) + "\nUsuario: " + pregunta
        : pregunta;

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto })
      });
      if (!response.ok) throw new Error("Error en el backend legal");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let full = "";
      setEstado(esModoJuicio ? "Modo Juicio: respondiendo en tiempo real..." : "Respondiendo en tiempo real...");

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setRespuesta(full);
        }
        done = readerDone;
      }
      setProcesando(false);
      setEstado(estados.RESPONDIENDO);
      return full;
    } catch (error) {
      setProcesando(false);
      setEstado("Error al consultar. Intenta de nuevo.");
      setRespuesta("Error al obtener respuesta: " + error.message);
      return "";
    }
  };

  // --- Enviar consulta ---
  const handleEnviar = async (texto = null) => {
    if (consultasGratis <= 0) {
      setRespuesta("Has alcanzado el límite de consultas gratuitas. ¿Deseas pasar a la versión premium?");
      setEstado("Límite alcanzado");
      handleHablar("Has alcanzado el límite gratuito. Por favor, colabora para seguir usando LitisBot.");
      return;
    }

    let pregunta = texto !== null ? texto : input;
    if (!pregunta && !archivo) {
      setEstado("Por favor, escribe, dicta una consulta o adjunta un archivo.");
      return;
    }

    const contieneObjecion = palabrasObjecion.some(palabra =>
      (pregunta || "").toLowerCase().includes(palabra)
    );
    setEsObjecion(contieneObjecion);

    if (contieneObjecion && window.navigator.vibrate) {
      window.navigator.vibrate([300, 100, 300]);
    }

    setRespuesta("");
    setEstado(estados.PROCESANDO);

    let adjuntoInfo = null;
    if (archivo) adjuntoInfo = await subirArchivoAFirebase();

    // Análisis IA según tipo de archivo
    if (adjuntoInfo && (adjuntoInfo.tipo.startsWith("audio") || adjuntoInfo.tipo.startsWith("video"))) {
      await analizarArchivoConIA(adjuntoInfo);
    }
    if (
      adjuntoInfo && 
      (adjuntoInfo.tipo.startsWith("image") || adjuntoInfo.extension === "pdf" || adjuntoInfo.tipo === "application/pdf")
    ) {
      await analizarArchivoOCR(adjuntoInfo);
    }

    let respuestaBot = "";
    if (pregunta) {
      respuestaBot = await obtenerRespuestaStreaming(pregunta, modoJuicio);
      let intentos = 0;
      while (
        (respuestaBot.toLowerCase().includes("precisa más") ||
          respuestaBot.toLowerCase().includes("no se obtuvo respuesta") ||
          respuestaBot.trim().length < 10) &&
        intentos < 1
      ) {
        respuestaBot = await obtenerRespuestaStreaming(pregunta, modoJuicio);
        intentos++;
      }
      setRespuesta(respuestaBot);
    } else {
      setRespuesta("Archivo subido y analizado correctamente. Si deseas análisis IA adicional, escribe una instrucción sobre el archivo.");
    }

    setEstado(estados.RESPONDIENDO);

    setConsultasGratis(prev => {
      const nuevo = prev - 1;
      localStorage.setItem("consultasGratis", nuevo);
      return nuevo;
    });

    if (user && (respuestaBot || adjuntoInfo)) {
      await addDoc(collection(db, "conversaciones"), {
        pregunta,
        respuesta: respuestaBot,
        uid: user.uid,
        nombre: user.displayName || user.email,
        fecha: serverTimestamp(),
        modoJuicio,
        esObjecion: contieneObjecion,
        areaDerecho,
        adjunto: adjuntoInfo || null,
        transcripcion,
        resumenAudio,
        ocrTexto,
        ocrResumen
      });
    }

    handleHablar(respuestaBot);
    setInput("");
    setArchivo(null);
    setArchivoURL("");
  };

  return (
    <div className="litisbotvoz-container" style={{ maxWidth: 540, margin: "0 auto", padding: 24 }}>
      {/* Sección subida y previews */}
      <div style={{ margin: "12px 0 0 0" }}>
        <input
          type="file"
          accept="audio/*,video/*,image/*,application/pdf"
          onChange={handleArchivoChange}
          disabled={procesando || analizando || ocrProcesando}
          style={{ marginRight: 10 }}
        />
        {/* Preview Imagen */}
        {archivoURL && archivo && archivo.type.startsWith("image") && (
          <img src={archivoURL} alt="preview" style={{ maxWidth: "90%", maxHeight: 200, borderRadius: 8, margin: "7px 0" }} />
        )}
        {/* Preview PDF */}
        {archivoURL && archivo && archivo.type === "application/pdf" && (
          <iframe src={archivoURL} title="pdf-preview" style={{ width: "98%", height: 200, borderRadius: 8, border: "1px solid #ccc", margin: "7px 0" }}></iframe>
        )}
        {/* Preview Audio/Video */}
        {archivoURL && archivo && archivo.type.startsWith("audio") && (
          <audio controls src={archivoURL} style={{ width: "90%" }} />
        )}
        {archivoURL && archivo && archivo.type.startsWith("video") && (
          <video controls src={archivoURL} style={{ width: "90%", maxHeight: 200 }} />
        )}
        {subiendo && <span style={{ marginLeft: 8, color: "#b4162c" }}>Subiendo...</span>}
        {analizando && <div style={{ color: "#1662C4", marginTop: 7 }}>Analizando audio/video con IA...</div>}
        {transcripcion && (
          <div style={{ marginTop: 8, background: "#f7f7fd", borderRadius: 8, padding: 10 }}>
            <b>📝 Transcripción IA:</b><br />
            <div style={{ whiteSpace: "pre-line", fontSize: 14 }}>{transcripcion}</div>
          </div>
        )}
        {resumenAudio && (
          <div style={{ marginTop: 7, background: "#eef9ec", borderRadius: 8, padding: 10 }}>
            <b>⚖️ Resumen jurídico audio/video:</b><br />
            <div style={{ whiteSpace: "pre-line", fontSize: 15 }}>{resumenAudio}</div>
          </div>
        )}
        {/* OCR PDF/imagen */}
        {ocrProcesando && <div style={{ color: "#1662C4", marginTop: 7 }}>Procesando PDF o imagen con OCR IA...</div>}
        {ocrTexto && (
          <div style={{ marginTop: 8, background: "#f7f7fd", borderRadius: 8, padding: 10 }}>
            <b>📄 Texto OCR IA:</b><br />
            <div style={{ whiteSpace: "pre-line", fontSize: 14 }}>{ocrTexto}</div>
          </div>
        )}
        {ocrResumen && (
          <div style={{ marginTop: 7, background: "#eef9ec", borderRadius: 8, padding: 10 }}>
            <b>⚖️ Resumen jurídico OCR:</b><br />
            <div style={{ whiteSpace: "pre-line", fontSize: 15 }}>{ocrResumen}</div>
          </div>
        )}
      </div>

      {/* Controles y chat principal */}
      <h2 style={{ color: "#1662C4", textAlign: "center", display: "flex", justifyContent: "center", gap: 8 }}>
        <span role="img" aria-label="chat">💬</span> Litis Chat General
      </h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={microfonoActivo} onChange={toggleMicrofono} />
          <span style={{ color: microfonoActivo ? "#1662C4" : "#888" }}>🎙 Activar micrófono</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={vozActiva} onChange={toggleVoz} />
          <span style={{ color: vozActiva ? "#1662C4" : "#888" }}>🤫 Silenciar voz</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={modoJuicio} onChange={toggleModoJuicio} />
          <span style={{ color: modoJuicio ? "#b4162c" : "#888" }}>⚖️ Modo Juicio</span>
        </label>
      </div>
      {modoJuicio && (
        <div style={{ margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#b4162c", fontWeight: "bold" }}>Área:</span>
          <select
            value={areaDerecho}
            onChange={e => setAreaDerecho(e.target.value)}
            style={{ fontSize: 16, borderRadius: 6, padding: "4px 10px", border: "1.5px solid #b4162c", outline: "none" }}
          >
            {AREAS_DERECHO.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <span style={{ color: "#666", fontSize: 13 }}>
            (Las citas legales serán acordes a esta especialidad)
          </span>
        </div>
      )}
      <div style={{ textAlign: "center", margin: "12px 0", fontWeight: "bold", color: escuchando ? "#ffbd2f" : (modoJuicio ? "#b4162c" : "#1662C4") }}>
        {modoJuicio ? "⚖️ MODO JUICIO ACTIVADO – Asistencia de audiencia en tiempo real" : estado}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          disabled={escuchando || procesando}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEnviar()}
          placeholder={modoJuicio ? "Describe la situación de tu audiencia..." : "Escribe tu consulta legal aquí…"}
          style={{ flex: 1, fontSize: 17, padding: 9, borderRadius: 8, border: "1px solid #1662C4" }}
        />
        <button
          onClick={handleEscuchar}
          disabled={!microfonoActivo || escuchando || procesando}
          title="Dictar por voz"
          style={{
            background: escuchando ? "#ffbd2f" : "#1662C4",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: escuchando ? "not-allowed" : "pointer"
          }}>
          🎤
        </button>
      </div>
      <button
        onClick={() => handleEnviar()}
        style={{
          background: modoJuicio ? "#b4162c" : "#1662C4", color: "#fff", padding: "8px 18px",
          border: "none", borderRadius: 8, marginTop: 8,
          fontWeight: "bold", fontSize: 17
        }}
        disabled={escuchando || procesando}
      >
        {modoJuicio ? "Asistir en audiencia" : "Consultar"}
      </button>
      <div style={{
        marginTop: 22, padding: 14, background: esObjecion ? "linear-gradient(90deg,#fffbe5 60%,#ffeaea 100%)" : "#f8faff",
        borderRadius: 12, border: `3px solid ${esObjecion ? "#e53935" : (modoJuicio ? "#b4162c" : "#1662C4")}`,
        color: "#222", fontSize: 16,
        boxShadow: esObjecion ? "0 0 16px #e53935cc" : "0 2px 8px #ccc"
      }}>
        <b>📘 Respuesta jurídica:</b><br />
        {respuesta ? (
          <div style={{ whiteSpace: "pre-line" }}
            dangerouslySetInnerHTML={{ __html: resaltarNormas(respuesta) }} />
        ) : (
          <span style={{ color: "#999" }}>Aquí aparecerá la respuesta legal.</span>
        )}
        <div style={{ marginTop: 12, fontSize: 13, color: "#777" }}>
          Consultas gratis restantes: <b>{consultasGratis}</b>
        </div>
        {consultasGratis <= 0 && (
          <div style={{ color: "#c62828", marginTop: 8 }}>
            Colabora o suscríbete para acceso ilimitado y funciones premium.
          </div>
        )}
      </div>
    </div>
  );
};

export default LitisBotConVoz;
