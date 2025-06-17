import React, { useState, useRef } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;

const estados = {
  INICIO: "Haz tu pregunta legal o usa el micrófono para hablar...",
  ESCUCHANDO: "🎤 Escuchando... habla ahora.",
  PROCESANDO: "Procesando tu consulta...",
  RESPONDIENDO: "¡Aquí tienes la respuesta!"
};

const obtenerRespuestaIA = async (pregunta, archivo = null) => {
  try {
    const response = await fetch("http://localhost:4000/api/juicio/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: pregunta })
    });
    if (!response.ok) throw new Error("Error en el backend legal");
    const data = await response.json();
    return data.respuesta || "No se obtuvo respuesta.";
  } catch (error) {
    return "Ocurrió un error consultando a la IA: " + error.message;
  }
};

const detectarEstado = (texto) => {
  if (texto.includes("✅")) return "vigente";
  if (texto.includes("❌")) return "derogada";
  if (texto.includes("⏳")) return "vacatio legis";
  if (texto.includes("📄")) return "pendiente reglamentación";
  return "no identificado";
};

const getEstadoColor = (texto) => {
  if (texto.includes("✅")) return "#2e7d32";
  if (texto.includes("❌")) return "#c62828";
  if (texto.includes("⏳")) return "#ef6c00";
  if (texto.includes("📄")) return "#1565c0";
  return "#424242";
};

const LitisBotConVoz = () => {
  const [user] = useAuthState(auth);
  const [input, setInput] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const [estado, setEstado] = useState(estados.INICIO);
  const [archivo, setArchivo] = useState(null);
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [vozActiva, setVozActiva] = useState(true);

  const inputRef = useRef(null);

  // -------- MANEJO DEL MICRÓFONO --------
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

  // -------- VOZ A TEXTO --------
  const handleHablar = (texto) => {
  if (vozActiva && "speechSynthesis" in window) {
    const utter = new window.SpeechSynthesisUtterance(texto);
    utter.lang = "es-PE";
    const voces = window.speechSynthesis.getVoices();
    // Elige exactamente el nombre masculino que aparezca en tu consola
    const vozVaronil = voces.find(v => 
      v.name.includes("Pablo") || 
      v.name.includes("Raul") ||
      v.name.includes("Miguel") ||
      v.name.includes("Diego")
    );
    if (vozVaronil) utter.voice = vozVaronil;
    utter.pitch = 0.85;
    utter.rate = 0.97;
    synth.cancel();
    synth.speak(utter);
  }
};

  // -------- ENVÍO DE PREGUNTA --------
  const handleEnviar = async (texto = null) => {
    let pregunta = texto !== null ? texto : input;
    if (!pregunta && !archivo) {
      setEstado("Por favor, escribe o dicta una consulta.");
      return;
    }
    setEstado(estados.PROCESANDO);
    setRespuesta("");

    const respuestaBot = await obtenerRespuestaIA(pregunta, archivo);
    const estadoNorma = detectarEstado(respuestaBot);
    setRespuesta(respuestaBot);
    setEstado(estados.RESPONDIENDO);

    if (user) {
      await addDoc(collection(db, "conversaciones"), {
        pregunta,
        respuesta: respuestaBot,
        estadoNorma: estadoNorma,
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
      <h2 style={{ color: "#1662C4", textAlign: "center", display: "flex", justifyContent: "center", gap: 8 }}>
        <img
          src="/litisbot-logo.png"
          alt="LitisBot Logo"
          style={{ width: 52, height: 52, borderRadius: 14, marginRight: 12, boxShadow: "0 2px 8px #ddd" }}
        />
        LitisBot Chat Legal
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={microfonoActivo} onChange={() => setMicrofonoActivo((v) => !v)} />
          <span style={{ color: microfonoActivo ? "#1662C4" : "#888" }}>🎙 Activar micrófono</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={vozActiva} onChange={() => setVozActiva((v) => !v)} />
          <span style={{ color: vozActiva ? "#1662C4" : "#888" }}>🤫 Silenciar voz</span>
        </label>
      </div>

      {/* INPUT Y MICRÓFONO EN UNA SOLA FILA */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          disabled={escuchando}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEnviar()}
          placeholder="Escribe o dicta tu consulta legal aquí…"
          style={{
            flex: 1,
            fontSize: 17,
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid #1662C4",
            outline: "none"
          }}
        />
        <button
          onClick={() => microfonoActivo && handleEscuchar()}
          disabled={escuchando || !microfonoActivo}
          title={microfonoActivo ? "Presiona para dictar tu consulta" : "Micrófono desactivado"}
          style={{
            marginLeft: 8,
            background: escuchando ? "#ffbd2f" : "#1662C4",
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            color: "#fff",
            fontSize: 22,
            boxShadow: escuchando ? "0 0 12px #ffbd2f" : "0 2px 6px #aaa",
            opacity: microfonoActivo ? 1 : 0.4,
            transition: "0.2s"
          }}
        >
          <span role="img" aria-label="mic">{escuchando ? "🎤" : "🎤"}</span>
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <label style={{ cursor: "pointer", color: "#1662C4" }}>
          📎 Adjuntar archivo
          <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.png" style={{ display: "none" }} onChange={handleArchivo} />
        </label>
        {archivo && <span style={{ marginLeft: 8 }}>Archivo: <b>{archivo.name}</b></span>}
      </div>

      <button
        onClick={() => handleEnviar()}
        style={{
          background: "#1662C4", color: "#fff", padding: "8px 18px",
          border: "none", borderRadius: 8, marginTop: 10, fontWeight: "bold"
        }}
        disabled={escuchando}
      >
        Consultar
      </button>

      <div style={{
        marginTop: 22, padding: 14, background: "#f8faff",
        borderRadius: 12, border: `2px solid ${getEstadoColor(respuesta)}`, color: "#222", fontSize: 16
      }}>
        <b>📘 Respuesta jurídica:</b><br />
        {respuesta ? (
          <div style={{ whiteSpace: "pre-line" }}>{respuesta}</div>
        ) : (
          <span style={{ color: "#999" }}>Aquí aparecerá la respuesta legal con su estado normativo.</span>
        )}
      </div>
    </div>
  );
};

export default LitisBotConVoz;
