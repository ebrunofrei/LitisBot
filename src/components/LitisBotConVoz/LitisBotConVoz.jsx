import React, { useState, useRef } from "react";
import { db, auth } from "../../firebase"; // Asegúrate que esta ruta es correcta
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

const conceptosBase = {
  "derecho administrativo": "El Derecho Administrativo es la rama del Derecho Público que regula la organización, el funcionamiento y la actividad de la Administración Pública, así como las relaciones entre esta y los ciudadanos.",
  "derecho civil": "El Derecho Civil es la rama del Derecho que regula las relaciones privadas entre las personas, tales como contratos, familia, propiedad y sucesiones.",
  "nulidad de acto jurídico": "La nulidad de acto jurídico es la sanción que deja sin efecto un acto celebrado en contravención de normas imperativas o por falta de elementos esenciales, considerándolo inexistente o inválido desde su origen.",
};

function obtenerConcepto(pregunta) {
  const texto = pregunta ? pregunta.toLowerCase() : "";
  for (let clave in conceptosBase) {
    if (texto.includes(clave)) return conceptosBase[clave];
  }
  return null;
}

const obtenerRespuestaIA = async (pregunta, archivo = null) => {
  const concepto = obtenerConcepto(pregunta);
  if (concepto) return concepto;

  if (archivo) {
    return "La función de análisis de archivos estará disponible pronto.";
  }

  try {
    const response = await fetch('https://litisbot-backend.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: pregunta })
    });
    if (!response.ok) throw new Error('Error en la conexión con la IA');
    const data = await response.json();
    return data.response || "No se obtuvo respuesta de la IA.";
  } catch (error) {
    return "Ocurrió un error consultando a la IA: " + error.message;
  }
};

const LitisBotConVoz = () => {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [estado, setEstado] = useState(estados.INICIO);
  const [archivo, setArchivo] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [vozActiva, setVozActiva] = useState(true);

  const inputRef = useRef(null);

  const toggleMicrofono = () => setMicrofonoActivo((v) => !v);
  const toggleVoz = () => setVozActiva((v) => !v);

  const handleEscuchar = () => {
    if (!recognition) {
      alert("El reconocimiento de voz no está disponible en este navegador.");
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

  const handleHablar = (texto) => {
    if (vozActiva && "speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(texto);
      utter.lang = "es-PE";
      synth.cancel();
      synth.speak(utter);
    }
  };

  const handleEnviar = async (texto = null) => {
    let pregunta = texto !== null ? texto : input;
    if (!pregunta && !archivo) {
      setEstado("Por favor, ingresa una pregunta o adjunta un archivo.");
      return;
    }
    setEstado(estados.PROCESANDO);
    setRespuesta("");

    if (archivo) {
      setCargandoArchivo(true);
      // Procesamiento futuro del archivo
      setCargandoArchivo(false);
    }

    const respuestaBot = await obtenerRespuestaIA(pregunta, archivo);
    setRespuesta(respuestaBot);
    setEstado(estados.RESPONDIENDO);

    if (user) {
      await addDoc(collection(db, "conversaciones"), {
        pregunta,
        respuesta: respuestaBot,
        uid: user.uid,
        nombre: user.displayName || user.email,
        archivo: archivo ? archivo.name : null,
        fecha: serverTimestamp(),
      });
    }

    handleHablar(respuestaBot);
    setArchivo(null);
    setInput("");
  };

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    setEstado(`Archivo "${file.name}" listo para analizar.`);
  };

  return (
    <div className="litisbotvoz-container" style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h2 style={{
        color: "#1662C4",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }}>
        <span role="img" aria-label="chat">💬</span> Litis Chat
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={microfonoActivo} onChange={toggleMicrofono} />
          <span style={{ fontSize: 15, color: microfonoActivo ? "#1662C4" : "#888" }}>
            🎙 Activar micrófono (modo juicio)
          </span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={vozActiva} onChange={toggleVoz} />
          <span style={{ fontSize: 15, color: vozActiva ? "#1662C4" : "#888" }}>
            🤫 Silenciar voz (modo audiencia)
          </span>
        </label>
      </div>

      <div style={{ textAlign: "center", margin: "12px 0" }}>
        <button
          onClick={() => microfonoActivo && handleEscuchar()}
          disabled={escuchando || !microfonoActivo}
          style={{
            background: escuchando ? "#ffbd2f" : "#1662C4",
            border: "none",
            borderRadius: "50%",
            width: 64,
            height: 64,
            marginBottom: 8,
            color: "#fff",
            fontSize: 32,
            boxShadow: escuchando ? "0 0 12px #ffbd2f" : "0 2px 6px #aaa",
            opacity: microfonoActivo ? 1 : 0.4,
            transition: "0.2s"
          }}
          title={microfonoActivo ? "Presiona y habla tu consulta" : "Micrófono desactivado"}
        >
          <span role="img" aria-label="microfono">
            {escuchando ? "🎤" : "🗣️"}
          </span>
        </button>
        <div style={{ marginTop: 4, color: escuchando ? "#ffbd2f" : "#1662C4", fontWeight: "bold" }}>
          {estado}
        </div>
      </div>

      <div style={{ margin: "10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          disabled={escuchando}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEnviar()}
          placeholder="O escribe tu consulta legal aquí…"
          style={{
            width: "100%", fontSize: 17, padding: 9, borderRadius: 8,
            border: "1px solid #1662C4", outline: "none"
          }}
        />
        <div>
          <label style={{ cursor: "pointer", color: "#1662C4" }}>
            📎 Adjuntar archivo
            <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.png" style={{ display: "none" }} onChange={handleArchivo} />
          </label>
          {archivo && (
            <span style={{ marginLeft: 8, color: "#333" }}>Archivo: <b>{archivo.name}</b></span>
          )}
        </div>
        <button
          onClick={() => handleEnviar()}
          style={{
            background: "#1662C4", color: "#fff", padding: "8px 18px",
            border: "none", borderRadius: 8, marginTop: 4, fontWeight: "bold"
          }}
          disabled={escuchando || cargandoArchivo}
        >
          Consultar
        </button>
      </div>

      <div style={{
        margin: "22px 0", minHeight: 64, background: "#f8faff",
        borderRadius: 12, padding: 14, color: "#222", fontSize: 17
      }}>
        <b>Respuesta:</b><br />
        {respuesta || <span style={{ color: "#aaa" }}>La respuesta aparecerá aquí.</span>}
      </div>

      <div style={{ fontSize: 13, color: "#888", marginTop: 16, textAlign: "center" }}>
        <b>Litis Chat</b> nunca te dará consejos legales irresponsables ni inventará normas. Toda respuesta es orientativa.
      </div>
    </div>
  );
};

export default LitisBotConVoz;
