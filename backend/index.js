import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY en .env');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); // Cambia al dominio frontend en producción
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máximo 20 solicitudes por IP por minuto
  message: 'Demasiadas solicitudes, intenta más tarde.',
});
app.use('/api/chat', limiter);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Mensaje inválido' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error en OpenAI:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
