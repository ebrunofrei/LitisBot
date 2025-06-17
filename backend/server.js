import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';

import Conversation from './models/Conversation.js';
import Agenda from './models/Agenda.js';

dotenv.config();

const app = express();
// Permite solo tu frontend (ajusta dominio en producción)
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Limita solicitudes para evitar abuso
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20,             // máximo 20 solicitudes por IP por minuto
  message: 'Demasiadas solicitudes, intenta más tarde.',
});
app.use('/api/chat', limiter);

// Conexión a MongoDB (sin opciones obsoletas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error MongoDB:', err));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ruta principal para chat + guardar conversación
app.post('/api/chat', async (req, res) => {
  const { message, userId, userName, language } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Mensaje inválido' });
  }

  try {
    // Consulta a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices[0].message.content;

    // Guardar solo si userId está definido
    if (userId) {
      const conv = new Conversation({
        userId,
        userName: userName || 'Anónimo',
        language: language || 'es',
        question: message,
        answer: reply,
        timestamp: new Date(),
      });
      await conv.save();
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error en OpenAI:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Ruta para guardar conversación directamente (opcional)
app.post('/api/conversation', async (req, res) => {
  try {
    const conv = new Conversation(req.body);
    await conv.save();
    res.status(201).json({ message: 'Conversación guardada' });
  } catch (error) {
    res.status(500).json({ error: 'Error guardando conversación' });
  }
});

// Ruta para obtener conversaciones de un usuario
app.get('/api/conversation/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo conversaciones' });
  }
});

/* --- NUEVAS RUTAS PARA AGENDA --- */

// Listar eventos de un usuario
app.get('/api/agenda/:userId', async (req, res) => {
  try {
    const eventos = await Agenda.find({ userId: req.params.userId }).sort({ fecha: 1, hora: 1 });
    res.json(eventos);
  } catch (err) {
    console.error('Error al obtener agenda:', err);
    res.status(500).json({ error: 'Error al obtener agenda' });
  }
});

// Crear evento
app.post('/api/agenda', async (req, res) => {
  const { userId, titulo, descripcion, fecha, hora, alertaMinutosAntes } = req.body;
  if (!userId || !titulo || !fecha) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    // Convertir fecha a tipo Date para MongoDB
    const fechaDate = new Date(fecha);

    const nuevoEvento = new Agenda({
      userId,
      titulo,
      descripcion,
      fecha: fechaDate,
      hora,
      alertaMinutosAntes,
    });

    await nuevoEvento.save();
    res.status(201).json({ message: 'Evento creado', evento: nuevoEvento });
  } catch (err) {
    console.error('Error al crear evento:', err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Eliminar evento
app.delete('/api/agenda/:id', async (req, res) => {
  try {
    await Agenda.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

