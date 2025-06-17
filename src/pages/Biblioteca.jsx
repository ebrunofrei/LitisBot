// src/pages/Biblioteca.jsx
import React, { useEffect, useState } from 'react';
import { db, storage, auth } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  setDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel
} from 'docx';
import { saveAs } from 'file-saver';

const materiasDisponibles = [
  "civil", "penal", "constitucional", "administrativo", "laboral", "familia",
  "comercial", "procesal", "tributario", "ambiental", "internacional", "registral",
  "notarial", "propiedad", "marítimo", "minero", "agrario", "financiero", "bancario"
];

const Biblioteca = () => {
  const [user, setUser] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [fuentesTop, setFuentesTop] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState('');
  const [nuevaFuente, setNuevaFuente] = useState({ materia: '', tipo: '', cita: '' });
  const [carpetas, setCarpetas] = useState([]);
  const [nuevaCarpeta, setNuevaCarpeta] = useState({ nombre: '', materia: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qArchivos = query(collection(db, 'biblioteca'), orderBy('createdAt', 'desc'));
    const unsubArchivos = onSnapshot(qArchivos, snapshot => {
      setArchivos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const obtenerFuentesTop = async () => {
      const q = query(collection(db, 'fuentesLegal'), orderBy('citas', 'desc'));
      const snapshot = await getDocs(q);
      const top = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFuentesTop(top);
    };

    const obtenerCarpetas = async () => {
      const q = query(collection(db, `usuarios/${user.uid}/carpetas`), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const todas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarpetas(todas);
    };

    obtenerFuentesTop();
    obtenerCarpetas();
    return () => {
      unsubArchivos();
    };
  }, [user]);

  const exportarWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Materia')], width: { size: 25, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph('Tipo')], width: { size: 25, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph('Cita')], width: { size: 30, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph('Veces Citada')], width: { size: 20, type: WidthType.PERCENTAGE } })
        ]
      }),
      ...fuentesTop
        .filter(f => !filtroMateria || f.materia === filtroMateria)
        .map(fuente => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(fuente.materia || 'General')] }),
            new TableCell({ children: [new Paragraph(fuente.tipo)] }),
            new TableCell({ children: [new Paragraph(fuente.cita)] }),
            new TableCell({ children: [new Paragraph(fuente.citas.toString())] })
          ]
        }))
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: 'Fuentes Jurídicas más Citadas', heading: HeadingLevel.TITLE }),
          new Table({ rows: tableRows })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'FuentesMasCitadas.docx');
  };

  const guardarNuevaFuente = async () => {
    if (!nuevaFuente.materia || !nuevaFuente.tipo || !nuevaFuente.cita) return;
    try {
      await addDoc(collection(db, 'fuentesLegal'), {
        ...nuevaFuente,
        citas: 1,
        creadoPor: user.email,
        createdAt: Timestamp.now()
      });
      setNuevaFuente({ materia: '', tipo: '', cita: '' });
      alert('Fuente agregada exitosamente');
    } catch (error) {
      console.error('Error al guardar la fuente:', error);
      alert('Hubo un error al guardar. Intenta de nuevo.');
    }
  };

  const guardarCarpeta = async () => {
    if (!nuevaCarpeta.nombre || !nuevaCarpeta.materia) return;
    try {
      await addDoc(collection(db, `usuarios/${user.uid}/carpetas`), {
        ...nuevaCarpeta,
        createdAt: Timestamp.now()
      });
      setNuevaCarpeta({ nombre: '', materia: '' });
      alert('Carpeta creada correctamente.');
    } catch (err) {
      console.error('Error creando carpeta:', err);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Debes iniciar sesión para ver la biblioteca.</p>
        <button onClick={() => navigate('/login')} style={{ marginTop: 10 }}>
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Biblioteca Jurídica</h2>

      <button
        onClick={() => navigate('/jurisprudencia')}
        style={{
          marginBottom: 20,
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 4,
        }}
      >
        Ir a Jurisprudencia
      </button>

      <h3>Mis Carpetas / Casos / Expedientes</h3>
      <ul>
        {carpetas.map(c => (
          <li key={c.id}>
            <b>{c.nombre}</b> – {c.materia}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20, maxWidth: 400 }}>
        <h4>Crear nueva carpeta</h4>
        <input
          placeholder="Nombre del caso o expediente"
          value={nuevaCarpeta.nombre}
          onChange={e => setNuevaCarpeta({ ...nuevaCarpeta, nombre: e.target.value })}
          style={{ marginBottom: 10, width: '100%' }}
        />
        <select
          value={nuevaCarpeta.materia}
          onChange={e => setNuevaCarpeta({ ...nuevaCarpeta, materia: e.target.value })}
          style={{ width: '100%', marginBottom: 10 }}
        >
          <option value="">Seleccione materia</option>
          {materiasDisponibles.map(m => (
            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
          ))}
        </select>
        <button onClick={guardarCarpeta}>Guardar carpeta</button>
      </div>

      <hr style={{ margin: '40px 0' }} />
      <h3>Fuentes Jurídicas más Citadas</h3>

      <label>
        Filtrar por materia:&nbsp;
        <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)}>
          <option value="">Todas</option>
          {materiasDisponibles.map(m => (
            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
          ))}
        </select>
      </label>

      <button onClick={exportarWord} style={{ marginLeft: 10 }}>
        Exportar a Word
      </button>

      {fuentesTop.length === 0 ? (
        <p>No hay fuentes registradas aún.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Materia</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Tipo</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Cita</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Veces Citada</th>
            </tr>
          </thead>
          <tbody>
            {fuentesTop
              .filter(f => !filtroMateria || f.materia === filtroMateria)
              .map((fuente, i) => (
                <tr key={i}>
                  <td>{fuente.materia || 'General'}</td>
                  <td>{fuente.tipo}</td>
                  <td>{fuente.cita}</td>
                  <td>{fuente.citas}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      <hr style={{ margin: '40px 0' }} />
      <h3>Registrar Nueva Fuente Jurídica</h3>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 500 }}>
        <select
          value={nuevaFuente.materia}
          onChange={e => setNuevaFuente({ ...nuevaFuente, materia: e.target.value })}
          style={{ marginBottom: 10 }}
        >
          <option value="">Seleccione materia</option>
          {materiasDisponibles.map(m => (
            <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
          ))}
        </select>
        <input
          placeholder="Tipo (ley, TC, CS, etc.)"
          value={nuevaFuente.tipo}
          onChange={e => setNuevaFuente({ ...nuevaFuente, tipo: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <input
          placeholder="Cita exacta"
          value={nuevaFuente.cita}
          onChange={e => setNuevaFuente({ ...nuevaFuente, cita: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <button onClick={guardarNuevaFuente}>Guardar Fuente</button>
      </div>
    </div>
  );
};

export default Biblioteca;
