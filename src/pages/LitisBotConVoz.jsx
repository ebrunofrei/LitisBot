// src/pages/LitisBotConVoz.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

import VisualResponse from '../components/LitisBotConVoz/VisualResponse';

import { useUser } from '../hooks/useUser';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguageDetection } from '../hooks/useLanguageDetection';

import { handleLegalResponse } from '../components/LitisBotConVoz/LegalResponseEngine';
import { saveLegalSource } from '../components/LitisBotConVoz/LegalSourcesDatabase';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const VOICES = {
  es: {
    male: 'Google Español Male',
    female: 'Google Español Female',
  },
  en: {
    male: 'Google US English Male',
    female: 'Google US English Female',
  },
};

const LitisBotConVoz = () => {
  const { userId, userName, hasName, saveName } = useUser();
  const [nameInput, setNameInput] = useState('');
  const [input, setInput] = useState('');
  const [responses, setResponses] = useState([]);
  const [structuredResponses, setStructuredResponses] = useState([]);

  const [modoJuicio, setModoJuicio] = useState(true);
  const [encabezado, setEncabezado] = useState({ abogado: '', expediente: '', juzgado: '' });
  const [materia, setMateria] = useState('general');

  const language = useLanguageDetection(input);

  const [voiceGender, setVoiceGender] = useState('male');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);

  const responsesEndRef = useRef(null);

  const { listening, startListening } = useSpeechRecognition(
    language === 'es' ? 'es-PE' : 'en-US',
    (transcript) => {
      setInput(transcript);
      handleSubmit(transcript);
    },
    (error) => {
      console.error(error);
    }
  );

  const { isSpeaking, speak, pause, resume } = useSpeechSynthesis(language, voiceGender, speechRate, speechVolume);

  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [responses]);

  useEffect(() => {
    if (hasName && responses.length === 0) {
      const saludo = '¿Cómo te fue en este caso? ¿Hay algo más en lo que pueda ayudarte?';
      setResponses([{ question: '', answer: saludo }]);
      setStructuredResponses([{ texto: saludo }]);
      if (voiceEnabled) speak(saludo);
    }
  }, [hasName]);

  const handleSaveName = () => {
    if (nameInput.trim() === '') return;
    saveName(nameInput);
  };

  const handleSubmit = async (text) => {
    if (!text.trim()) return;
    setInput('');

    const pregunta = { question: text, answer: '' };
    setResponses((prev) => [...prev, pregunta]);
    setStructuredResponses((prev) => [...prev, null]);

    const structuredRespuesta = await handleLegalResponse(text, {
      tipoJuicio: modoJuicio ? 'penal' : 'consulta',
      materia: materia,
      registrarFuente: async (fuente) => {
        await saveLegalSource(fuente);
        await setDoc(doc(db, 'usuarios', userId, 'historialFuentes', fuente.cita), fuente);
      },
      userId: userId
    });

    if (structuredRespuesta.texto) speak(structuredRespuesta.texto, voiceEnabled);

    setResponses((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { question: text, answer: structuredRespuesta.texto || '...' };
      return updated;
    });

    setStructuredResponses((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = structuredRespuesta;
      return updated;
    });
  };

  const downloadWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: 'Conversación con LitisBot', heading: HeadingLevel.TITLE }),
          new Paragraph({ text: `Abogado: ${encabezado.abogado || '-'}` }),
          new Paragraph({ text: `Expediente: ${encabezado.expediente || '-'}` }),
          new Paragraph({ text: `Juzgado: ${encabezado.juzgado || '-'}` }),
          new Paragraph({ text: `Materia: ${materia}` }),
          new Paragraph({ text: '' }),
          ...responses.flatMap((resp, i) => [
            new Paragraph({ text: `Pregunta ${i + 1}:`, heading: HeadingLevel.HEADING_2 }),
            new Paragraph({ children: [new TextRun({ text: resp.question, bold: true })] }),
            new Paragraph({ text: `Respuesta:`, heading: HeadingLevel.HEADING_3 }),
            new Paragraph({ children: [new TextRun({ text: resp.answer })] }),
            new Paragraph({ text: '' }),
          ]),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'ConversacionLitisBot.docx');
  };

  if (!hasName) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
        <h2>Bienvenido a LitisBot</h2>
        <p>Por favor, ingresa tu nombre para que pueda dirigirme a ti personalmente.</p>
        <input
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          placeholder="Tu nombre"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button
          onClick={handleSaveName}
          disabled={nameInput.trim() === ''}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Guardar nombre
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h1>LitisBot con Voz ({modoJuicio ? 'Modo Juicio' : 'Modo Consulta'})</h1>

      <div>
        <label>
          <input type="checkbox" checked={modoJuicio} onChange={() => setModoJuicio(!modoJuicio)} />
          &nbsp;Modo juicio activado
        </label>

        <label style={{ marginLeft: 20 }}>
          Idioma detectado:&nbsp;<b>{language === 'es' ? 'Español' : 'Inglés'}</b>
        </label>

        <label style={{ marginLeft: 20 }}>
          Voz:&nbsp;
          <select value={voiceGender} onChange={e => setVoiceGender(e.target.value)}>
            <option value="male">Masculina</option>
            <option value="female">Femenina</option>
          </select>
        </label>

        <label style={{ marginLeft: 20 }}>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={e => setVoiceEnabled(e.target.checked)}
          />
          Voz Activada
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>
          Velocidad de voz:&nbsp;
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={e => setSpeechRate(parseFloat(e.target.value))}
          />
          {speechRate}
        </label>

        <label style={{ marginLeft: 20 }}>
          Volumen:&nbsp;
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={speechVolume}
            onChange={e => setSpeechVolume(parseFloat(e.target.value))}
          />
          {speechVolume}
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Abogado:&nbsp;<input value={encabezado.abogado} onChange={e => setEncabezado({ ...encabezado, abogado: e.target.value })} /></label>
        <label style={{ marginLeft: 10 }}>Expediente:&nbsp;<input value={encabezado.expediente} onChange={e => setEncabezado({ ...encabezado, expediente: e.target.value })} /></label>
        <label style={{ marginLeft: 10 }}>Juzgado:&nbsp;<input value={encabezado.juzgado} onChange={e => setEncabezado({ ...encabezado, juzgado: e.target.value })} /></label>
        <label style={{ marginLeft: 10 }}>Materia:&nbsp;
          <select value={materia} onChange={e => setMateria(e.target.value)}>
            <option value="general">General</option>
            <option value="civil">Civil</option>
            <option value="penal">Penal</option>
            <option value="constitucional">Constitucional</option>
            <option value="administrativo">Administrativo</option>
            <option value="laboral">Laboral</option>
            <option value="familia">Familia</option>
          </select>
        </label>
      </div>

      <button onClick={startListening} disabled={listening} style={{ marginTop: 10 }}>
        {listening ? 'Escuchando...' : 'Iniciar grabación'}
      </button>

      <br />

      <input
        type="text"
        placeholder="Escribe o usa voz para preguntar"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && input.trim() !== '') {
            handleSubmit(input);
          }
        }}
        style={{ width: '80%', padding: '8px', marginTop: '10px' }}
      />
      <button
        onClick={() => handleSubmit(input)}
        disabled={input.trim() === ''}
        style={{ marginLeft: 10 }}
      >
        Enviar
      </button>

      <div
        style={{
          marginTop: 20,
          maxHeight: 300,
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 10,
          borderRadius: 4,
        }}
      >
        {responses.map((resp, idx) => (
          <div key={idx} style={{ marginBottom: 15 }}>
            <strong>Pregunta:</strong> {resp.question}<br />
            <strong>Respuesta:</strong>
            <VisualResponse respuesta={structuredResponses[idx]} />
            <hr />
          </div>
        ))}
        <div ref={responsesEndRef} />
      </div>

      {isSpeaking ? (
        <button onClick={pause} style={{ marginTop: 10 }}>
          Pausar lectura
        </button>
      ) : (
        <button onClick={resume} style={{ marginTop: 10 }} disabled={!isSpeaking}>
          Reanudar lectura
        </button>
      )}

      <hr style={{ marginTop: 20, marginBottom: 20 }} />

      <button onClick={downloadWord}>Descargar conversación en Word</button>
    </div>
  );
};

export default LitisBotConVoz;
