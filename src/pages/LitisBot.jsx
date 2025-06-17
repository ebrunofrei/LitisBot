import React, { useState, useEffect, useRef } from 'react';

const LitisBotConVoz = () => {
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta Speech Recognition');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'es-PE'; // idioma español de Perú
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSubmit(transcript);
      setListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setListening(false);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };
  }, []);

  const handleStartListening = () => {
    setListening(true);
    recognitionRef.current.start();
  };

  const handleSubmit = async (text) => {
    if (!text || text.trim() === '') return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      setResponses((prev) => [...prev, { question: text, answer: data.reply }]);
      setInput('');
      speak(data.reply);
    } catch (error) {
      console.error('Error al llamar API:', error);
      setResponses((prev) => [...prev, { question: text, answer: 'Error al obtener respuesta.' }]);
    }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta Speech Synthesis');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-PE';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>LitisBot con Voz (Demo)</h1>
      <button onClick={handleStartListening} disabled={listening}>
        {listening ? 'Escuchando...' : 'Iniciar grabación'}
      </button>
      <br />
      <input
        type="text"
        placeholder="Escribe o usa voz para preguntar"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '80%', padding: '8px', marginTop: '10px' }}
      />
      <button onClick={() => handleSubmit(input)} disabled={input.trim() === ''}>
        Enviar
      </button>
      <div style={{ marginTop: 20 }}>
        {responses.map((resp, idx) => (
          <div key={idx}>
            <b>Pregunta:</b> {resp.question}
            <br />
            <b>Respuesta:</b> {resp.answer}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LitisBotConVoz;
