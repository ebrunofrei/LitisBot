require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- CHAT STREAMING GPT ---
app.post('/api/chat', async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'Falta el campo texto.' });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: texto }],
      stream: true
    });

    let fullResponse = '';
    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(content);
      }
    }
    res.end();
  } catch (error) {
    console.error('Error en /api/chat:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error procesando la petición.' });
    } else {
      res.end();
    }
  }
});

// --- AUDIO/VIDEO IA: TRANSCRIPCIÓN Y RESUMEN ---
app.post("/api/analizar-audio", async (req, res) => {
  const { url, nombre } = req.body;
  try {
    const tempPath = path.join(__dirname, 'temp_' + Date.now() + '_' + nombre);
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-1",
      response_format: "text",
      language: "es"
    });

    const resumenResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un abogado experto. Resume en máximo 10 líneas esta audiencia en estilo legal: menciona hechos relevantes, pretensiones, estrategias procesales, incidencias y riesgos." },
        { role: "user", content: transcription }
      ],
      temperature: 0.1
    });

    fs.unlinkSync(tempPath);

    res.json({
      transcripcion: transcription,
      resumen: resumenResp.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo analizar el archivo: " + err.message });
  }
});

// --- PDF/IMAGEN OCR + RESUMEN ---
app.post("/api/analizar-ocr", async (req, res) => {
  const { url, nombre, tipo } = req.body;
  try {
    const tempPath = path.join(__dirname, 'temp_' + Date.now() + '_' + nombre);
    const response = await axios.get(url, { responseType: "stream" });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    let ocrTexto = "";
    if (tipo === "application/pdf" || nombre.toLowerCase().endsWith(".pdf")) {
      const convert = fromPath(tempPath, { density: 150, saveFilename: "pdfpage", format: "png", width: 1200, height: 1700 });
      const imgPath = tempPath + "_page1.png";
      await convert(1, true, imgPath);
      const ocrResult = await Tesseract.recognize(imgPath, "spa");
      ocrTexto = ocrResult.data.text;
      fs.unlinkSync(imgPath);
    } else if (tipo.startsWith("image")) {
      const ocrResult = await Tesseract.recognize(tempPath, "spa");
      ocrTexto = ocrResult.data.text;
    } else {
      fs.unlinkSync(tempPath);
      return res.status(400).json({ error: "Tipo de archivo no soportado para OCR." });
    }
    fs.unlinkSync(tempPath);

    let resumen = "";
    if (ocrTexto && ocrTexto.trim().length > 15) {
      const resumenResp = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un abogado experto. Resume en máximo 10 líneas este documento jurídico o acta. Si es una demanda, sentencia, contrato o acto judicial, indica los hechos relevantes, pretensiones, argumentos, fundamentos y riesgos." },
          { role: "user", content: ocrTexto }
        ],
        temperature: 0.1
      });
      resumen = resumenResp.choices[0].message.content;
    }

    res.json({ texto: ocrTexto, resumen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo analizar OCR: " + err.message });
  }
});

app.listen(port, () => {
  console.log(`LitisBot backend corriendo en http://localhost:${port}`);
});
