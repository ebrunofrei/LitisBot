// src/pages/Agenda.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';

const Agenda = () => {
  const [userId, setUserId] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [alertaMinutosAntes, setAlertaMinutosAntes] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Escuchar estado de autenticación y actualizar userId
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar eventos desde backend cuando userId esté disponible
  useEffect(() => {
    if (!userId) return;
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/agenda/${userId}`);
        if (!res.ok) throw new Error('Error al cargar eventos');
        const data = await res.json();
        setEventos(data);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [userId]);

  // Crear nuevo evento
  const handleCrearEvento = async () => {
    if (!titulo.trim() || !fecha) {
      setErrorMsg('Por favor, completa los campos de título y fecha.');
      return;
    }
    try {
      setErrorMsg('');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          titulo,
          descripcion,
          fecha,
          hora,
          alertaMinutosAntes,
        }),
      });
      if (!res.ok) throw new Error('Error al crear evento');
      const data = await res.json();

      setEventos(prev => [...prev, data.evento]);
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setHora('');
      setAlertaMinutosAntes(10);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // Eliminar evento
  const handleEliminarEvento = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/agenda/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar evento');

      setEventos(prev => prev.filter(ev => ev._id !== id));
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  if (!userId) {
    return <p>Por favor inicia sesión para ver tu agenda.</p>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h2>Agenda Personal</h2>

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: 8 }}
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: 8 }}
        />
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          style={{ padding: '8px', marginRight: 8 }}
        />
        <input
          type="time"
          value={hora}
          onChange={e => setHora(e.target.value)}
          style={{ padding: '8px' }}
        />
        <br />
        <label>
          Alerta minutos antes:&nbsp;
          <input
            type="number"
            min="0"
            value={alertaMinutosAntes}
            onChange={e => setAlertaMinutosAntes(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </label>
        <br />
        <button onClick={handleCrearEvento} style={{ marginTop: 10, padding: '8px 16px' }}>
          Crear evento
        </button>
      </div>

      <h3>Eventos</h3>

      {loading ? (
        <p>Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p>No hay eventos en tu agenda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {eventos.map(ev => (
            <li key={ev._id} style={{ marginBottom: 12, border: '1px solid #ccc', padding: 10, borderRadius: 4 }}>
              <strong>{ev.titulo}</strong> — {ev.fecha} {ev.hora && `a las ${ev.hora}`}
              {ev.descripcion && <p>{ev.descripcion}</p>}
              <button onClick={() => handleEliminarEvento(ev._id)} style={{ color: 'red' }}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Agenda;
