import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// AI Assistant endpoint for Charvi mascot
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, notesContext, mood } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      // Graceful fallback if API key is not configured yet
      return res.json({
        reply: `Halo sahabat kecilku! Aku Cincau! Senang sekali bisa belajar dan bermain bersamamu hari ini! Mau belajar apa kita sekarang?`,
        emotion: 'happy',
      });
    }

    const systemInstruction = `You are "Cincau", a friendly, warm, playful, and encouraging 2D jelly educational companion for elementary school children (Grade 1-6 / SD di Indonesia) following Kurikulum Merdeka.
Your personality:
- Warm, cheerful, curious, and patient like a lovable living companion.
- You speak naturally in friendly Indonesian (bahasa Indonesia yang hangat dan santun).
- Keep answers concise (1-3 short sentences), conversational, and age-appropriate for kids.
- You love encouraging children to learn, solve problems, stay curious, and eat healthy snacks!
- You also react to their care (feeding, learning achievements).
- Never insult, shame, or lecture.
- Never ask for private personal info.

Child profile and learning context:
${notesContext ? JSON.stringify(notesContext) : 'Pengguna anak baru.'}

Respond with a JSON object containing:
- "reply": your spoken message
- "emotion": one of "happy", "excited", "thinking", "encouraging", or "idle"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    let parsed = { reply: text, emotion: 'happy' };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { reply: text, emotion: 'happy' };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.json({
      reply: 'Wah, Charvi sedang berpikir keras! Ceritakan lagi idemu yang keren itu!',
      emotion: 'thinking',
    });
  }
});

// Mount Vite middleware in development
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Charvi server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
