// src/pages/LitisBotOCR.jsx
import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

const forbiddenWords = ['nombre', 'dni', 'documento', 'telefono', 'direccion'];

function anonymizeText(text) {
  // Reemplaza palabras que empiecen con mayúscula (nombres propios) por XXX
  return text.replace(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/g, 'XXX');
}

function containsSensitiveData(text) {
  const lowerText = text.toLowerCase();
  return forbiddenWords.some(word => lowerText.includes(word));
}

const LitisBotOCR = () => {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [anonymizedText, setAnonymizedText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState('');
  const inputFileRef = useRef();

  const handleImageChange = e => {
    setErrorMsg('');
    setResponse('');
    setAnonymizedText('');
    setOcrText('');
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  const handleOCR = () => {
    if (!image) {
      setErrorMsg('Por favor, selecciona una imagen primero.');
      return;
    }
    setLoadingOCR(true);
    setErrorMsg('');
    setOcrText('');
    setAnonymizedText('');
    setResponse('');

    Tesseract.recognize(image, 'spa', {
      logger: m => console.log(m),
    })
      .then(({ data: { text } }) => {
        setLoadingOCR(false);
        setOcrText(text);
        const anon = anonymizeText(text);
        setAnonymizedText(anon);

        if (containsSensitiveData(text)) {
          setErrorMsg('¡Advertencia! El texto contiene posibles datos sensibles. Asegúrate de anonimizarlo.');
        }
      })
      .catch(err => {
        setLoadingOCR(false);
        setErrorMsg('Error leyendo la imagen: ' + err.message);
      });
  };

  const handleSend = async () => {
    if (!anonymizedText.trim()) {
      setErrorMsg('No hay texto para enviar.');
      return;
    }
    if (errorMsg) {
      alert('Por favor, elimina los datos sensibles antes de continuar.');
      return;
    }
    setSending(true);
    setResponse('');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: anonymizedText }),
      });
      if (!res.ok) throw new Error('Error en servidor');
      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      setErrorMsg('Error enviando mensaje: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setImage(null);
    setOcrText('');
    setAnonymizedText('');
    setErrorMsg('');
    setResponse('');
    if (inputFileRef.current) inputFileRef.current.value = '';
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h1>LitisBot OCR con Anonimización y Validación</h1>

      <input type="file" accept="image/*" onChange={handleImageChange} ref={inputFileRef} />

      {image && (
        <div style={{ marginTop: 20 }}>
          <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={handleOCR} disabled={loadingOCR || !image}>
          {loadingOCR ? 'Leyendo imagen...' : 'Leer texto de imagen'}
        </button>
        <button onClick={reset} style={{ marginLeft: 10 }}>
          Resetear
        </button>
      </div>

      {ocrText && (
        <div style={{ marginTop: 20 }}>
          <h3>Texto extraído:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0', padding: 10 }}>{ocrText}</pre>
        </div>
      )}

      {anonymizedText && (
        <div style={{ marginTop: 20 }}>
          <h3>Texto anonimizado:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#e0ffe0', padding: 10 }}>{anonymizedText}</pre>
        </div>
      )}

      {errorMsg && (
        <p style={{ color: 'red', marginTop: 20 }}>{errorMsg}</p>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={handleSend} disabled={sending || !anonymizedText || !!errorMsg}>
          {sending ? 'Enviando...' : 'Enviar a LitisBot'}
        </button>
      </div>

      {response && (
        <div style={{ marginTop: 30 }}>
          <h3>Respuesta de LitisBot:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default LitisBotOCR;
