import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Basic health check
app.get('/api/ai/health', (req, res) => {
  const ok = Boolean(process.env.OPENAI_API_KEY);
  res.json({ ok, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' });
});

// Main AI endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt, messages } = req.body || {};
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY tidak terpasang di environment server.' });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    let chatMessages = messages;
    if (!chatMessages && prompt) {
      chatMessages = [
        { role: 'system', content: 'Anda adalah asisten untuk analitik kebiasaan. Jawab singkat, jelas, dalam bahasa Indonesia.' },
        { role: 'user', content: String(prompt).slice(0, 8000) }
      ];
    }

    if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
      return res.status(400).json({ error: 'Body harus memiliki "prompt" atau array "messages".' });
    }

    const completion = await client.chat.completions.create({
      model,
      messages: chatMessages,
      temperature: 0.3,
      max_tokens: 400
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || '';
    res.json({ text, raw: completion });
  } catch (err) {
    console.error('AI error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'Gagal menghasilkan respons AI.' });
  }
});

app.listen(port, () => {
  console.log(`OpenAI proxy listening on http://localhost:${port}`);
});
