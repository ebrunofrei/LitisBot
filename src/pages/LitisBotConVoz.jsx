import React, { useState, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

// Utilidades para Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const synth = window.speechSynthesis;

const estados = {
  INICIO: "Haz tu pregunta legal o toca el micrófono para hablar...",
  ESCUCHANDO: "Escuchando... habla ahora.",
  PROCESANDO: "Procesando tu consulta...",
  RESPONDIENDO: "¡Aquí tienes la respuesta!"
};

const LitisBotConVoz = () => {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [estado, setEstado] = useState(estados.INICIO);
  const [archivo, setArchivo] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  const inputRef = useRef(null);

  // --- Función de reconocimiento de voz
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

  // --- Función para hablar la respuesta
  const handleHablar = (texto) => {
    if ("speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(texto);
      utter.lang = "es-PE";
      synth.cancel(); // Cancela cualquier reproducción previa
      synth.speak(utter);
    }
  };

  // --- Simulación de respuesta avanzada de IA (puedes conectar a tu backend)
  const obtenerRespuestaIA = async (pregunta, archivo = null) => {
    if (archivo && pregunta.toLowerCase().includes("resumir")) {
      return `Analicé el archivo y aquí tienes un resumen simulado. [Función real pendiente de backend]`;
    }
    if (pregunta.toLowerCase().includes("consejo")) {
      return `Consejo jurídico: Ante cualquier duda, revisa la normativa nacional vigente y consulta con un abogado colegiado.`;
    }
    if (pregunta.toLowerCase().includes("buscar")) {
      return `Funcionalidad de búsqueda avanzada disponible. Pronto se integrará consulta a la biblioteca legal y Google.`;
    }
    return `Tu consulta fue: "${pregunta}". [Respuesta generada por IA simulada].`;
  };

  // --- Enviar consulta
  const handleEnviar = async (texto = null) => {
    let pregunta = texto !== null ? texto : input;
    if (!pregunta && !archivo) {
      setEstado("Por favor, ingresa una pregunta o adjunta un archivo.");
      return;
    }
    setEstado(estados.PROCESANDO);
    setRespuesta("");

    // Procesar adjunto
    let resultadoArchivo = null;
    if (archivo) {
      setCargandoArchivo(true);
      resultadoArchivo = archivo.name;
      setCargandoArchivo(false);
    }

    // Llama a la "IA" (simulado aquí)
    const respuestaBot = await obtenerRespuestaIA(pregunta, archivo);
    setRespuesta(respuestaBot);
    setEstado(estados.RESPONDIENDO);

    // Guardar en Firebase (historial aprendizaje bot)
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

  // --- Adjuntar archivo
  const handleArchivo = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    setEstado(`Archivo "${file.name}" listo para analizar.`);
  };

  return (
    <div className="litisbotvoz-container" style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h2 style={{ color: "#1662C4", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span role="img" aria-label="chat">💬</span> Litis Chat
      </h2>
      <div style={{ textAlign: "center", margin: "12px 0" }}>
        <button
          onClick={handleEscuchar}
          disabled={escuchando}
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
            transition: "0.2s"
          }}
          title="Presiona y habla tu consulta"
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

