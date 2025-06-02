// backend/ia.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint de IA jurídica
app.post('/api/ia', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o", // Cambia a "gpt-3.5-turbo" si tu cuenta no soporta 4o
        messages: [
          {
            role: "system",
            content:
              "Eres un abogado experto en Derecho peruano. Responde profesionalmente, con objetividad, sin inventar normas, y nunca des consejos peligrosos. Si la pregunta es legal, responde con doctrina y artículos reales; si es muy general, pide más datos."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.2
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ respuesta: response.data.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Servidor IA corriendo en puerto", PORT));
