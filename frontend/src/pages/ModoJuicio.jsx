import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

// --- Configuración SpeechRecognition ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
const synth = window.speechSynthesis;

const estados = {
  INICIO: "Haz clic en 'Activar modo juicio' y dicta tus argumentos o preguntas en audiencia.",
  ESCUCHANDO: "Modo juicio activado. Escuchando y transcribiendo...",
  ANALIZANDO: "Analizando el último segmento...",
  DETENIDO: "Modo juicio detenido."
};

// --- Petición premium al backend ---
const obtenerRespuestaPremium = async (texto) => {
  try {
    const response = await fetch("http://localhost:4000/api/juicio/juicio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto })
    });
    if (!response.ok) throw new Error("Error en el backend premium");
    const data = await response.json();
    return data.respuesta || "Sin observaciones jurídicas relevantes.";
  } catch (error) {
    return "Error al analizar el contenido legal: " + error.message;
  }
};

const ModoJuicio = () => {
  const [user] = useAuthState(auth);
  const [escuchando, setEscuchando] = useState(false);
  const [transcripcion, setTranscripcion] = useState("");
  const [analisis, setAnalisis] = useState("Esperando inicio de modo juicio...");
  const [segmentoActual, setSegmentoActual] = useState("");
  const [estado, setEstado] = useState(estados.INICIO);
  const [vozActiva, setVozActiva] = useState(true);

  const ultimaFraseRef = useRef(""); // Para evitar repeticiones

  // --- Manejo de reconocimiento de voz ---
  useEffect(() => {
    if (!recognition) {
      alert("El reconocimiento de voz no está disponible en este navegador.");
      return;
    }
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-PE";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // Solo agrega frases nuevas
          if (transcript.trim() && transcript.trim() !== ultimaFraseRef.current) {
            setTranscripcion((prev) => prev + transcript + ". ");
            setSegmentoActual((prev) => prev + " " + transcript);
            ultimaFraseRef.current = transcript.trim();
          }
        } else {
          interim += transcript;
        }
      }
    };

    recognition.onend = () => {
      if (escuchando) recognition.start();
    };
    // Limpia al desmontar
    return () => { recognition && recognition.stop(); };
    // eslint-disable-next-line
  }, [escuchando]);

  // --- Analiza legalmente cada segmento suficiente ---
  useEffect(() => {
    if (segmentoActual.trim().length > 15) {
      analizarSegmento(segmentoActual.trim());
      setSegmentoActual(""); // resetea para el siguiente
    }
    // eslint-disable-next-line
  }, [segmentoActual]);

  const analizarSegmento = async (texto) => {
    setEstado(estados.ANALIZANDO);
    const respuesta = await obtenerRespuestaPremium(texto);

    // --- Guarda la conversación premium en Firestore ---
    if (user) {
      await addDoc(collection(db, "conversaciones_juicio"), {
        texto,
        respuesta,
        uid: user.uid,
        nombre: user.displayName || user.email,
        fecha: serverTimestamp(),
      });
    }

    setAnalisis(respuesta);
    setEstado(estados.ESCUCHANDO);

    // Habla la respuesta si está activo
    if (vozActiva && "speechSynthesis" in window) {
      const utter = new window.SpeechSynthesisUtterance(respuesta);
      utter.lang = "es-PE";
      synth.cancel();
      synth.speak(utter);
    }
  };

  const iniciarEscucha = () => {
    if (!recognition) return;
    setEscuchando(true);
    setEstado(estados.ESCUCHANDO);
    setAnalisis("Transcribiendo y analizando. Puedes hablar normalmente en audiencia.");
    setTranscripcion("");
    recognition.start();
  };

  const detenerEscucha = () => {
    setEscuchando(false);
    setEstado(estados.DETENIDO);
    recognition.stop();
    setAnalisis("Modo juicio detenido.");
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: 32 }}>
      <h2 style={{ color: "#B22222", textAlign: "center", display: "flex", justifyContent: "center", gap: 8 }}>
        <span role="img" aria-label="juicio">⚖️</span> LitisBot – <b>Modo Juicio (Premium)</b>
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 15 }}>
        <button onClick={iniciarEscucha} disabled={escuchando} style={{ padding: "8px 20px", fontWeight: "bold", color: "#fff", background: "#B22222", border: "none", borderRadius: 8 }}>
          Activar modo juicio
        </button>
        <button onClick={detenerEscucha} disabled={!escuchando} style={{ padding: "8px 18px", color: "#fff", background: "#444", border: "none", borderRadius: 8 }}>
          Detener
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
          <input type="checkbox" checked={vozActiva} onChange={() => setVozActiva(v => !v)} />
          <span style={{ color: vozActiva ? "#B22222" : "#888" }}>🔊 Voz activa</span>
        </label>
      </div>

      <div style={{ textAlign: "center", margin: "12px 0", fontWeight: "bold", color: escuchando ? "#ffbd2f" : "#B22222" }}>
        {estado}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 22, flexWrap: "wrap" }}>
        {/* Transcripción */}
        <div style={{ flex: 1, minWidth: 330 }}>
          <h4>📝 Transcripción en vivo:</h4>
          <div style={{
            background: "#f8faff",
            border: "1px solid #cfd8dc",
            padding: 13,
            minHeight: 100,
            borderRadius: 9,
            fontSize: 16
          }}>
            {transcripcion || <span style={{ color: "#aaa" }}>Aquí aparecerá la transcripción de lo que se diga en audiencia...</span>}
          </div>
        </div>
        {/* Análisis Jurídico */}
        <div style={{ flex: 1, minWidth: 330 }}>
          <h4>⚖️ Análisis jurídico premium:</h4>
          <div style={{
            background: "#fff3e0",
            border: "1.5px solid #FF9800",
            padding: 13,
            minHeight: 100,
            borderRadius: 9,
            fontSize: 16,
            color: "#7e4d00"
          }}>
            {analisis || <span style={{ color: "#bbb" }}>Aquí se mostrará el análisis jurídico premium en tiempo real.</span>}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 30, fontSize: 13, color: "#888", textAlign: "center" }}>
        <b>Tip:</b> Puedes pausar la transcripción cuando lo necesites, o dejar activo durante la audiencia.
      </div>
    </div>
  );
};

export default ModoJuicio;
