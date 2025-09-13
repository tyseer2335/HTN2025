import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.COHERE_API_KEY;
if (!API_KEY) throw new Error('Set COHERE_API_KEY in .env');

const MODEL = process.env.COHERE_MODEL || 'c4ai-aya-vision-32b';

// Multer in-memory (we need file.buffer to build data URLs)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 3, fileSize: 5 * 1024 * 1024 }, // 5MB/file cap
});

// === same builder as your working script (one message: [ text, img, img, img ]) ===
function buildMessage(blurb, dataUrls) {
  const textBlock = {
    type: 'text',
    text: [
      'You are an expert visual storyteller.',
      'Using the 3 photos and the trip blurb, create a sequential 5-panel storyboard.',
      '',
      'Each panel fields:',
      '- id: p1..p5',
      '- title: 2–6 words',
      '- description: 60–120 words (subject, setting, POV/shot, lighting, color mood, time of day, notable props).',
      '- keywords: 4–8 nouns/adjectives',
      '- iconPrompt: short low-poly 3D icon idea',
      '',
      'Return ONLY raw JSON (no markdown).',
      '',
      `TRIP BLURB: """${blurb}"""`,
    ].join('\n'),
  };

  const imageBlocks = dataUrls.map((d) => ({
    type: 'image_url',
    image_url: { url: d }, // <— EXACT nested shape from the docs
  }));

  return [{ role: 'user', content: [textBlock, ...imageBlocks] }];
}

// Health
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

/**
 * POST /api/storyboard
 * form-data:
 *  - blurb: string
 *  - images: exactly 3 files (field name "images")
 */
app.post('/api/storyboard', upload.array('images', 3), async (req, res) => {
  try {
    const blurb = String(req.body?.blurb || '').trim();
    const files = req.files || [];

    if (!blurb) return res.status(400).json({ error: 'Missing blurb' });
    if (files.length !== 3) return res.status(400).json({ error: 'Please upload exactly 3 images' });

    // Convert uploaded files -> base64 data URLs (same as your working script)
    const dataUrls = files.map((file) => {
      const mime = file.mimetype || 'image/png';
      const b64 = file.buffer.toString('base64');
      return `data:${mime};base64,${b64}`;
    });

    const body = {
      model: MODEL,
      messages: buildMessage(blurb, dataUrls),
      temperature: 0.2,
      max_tokens: 1500,
    };

    const resp = await fetch('https://api.cohere.ai/v2/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Cohere HTTP', resp.status, resp.statusText, '| body:', errText.slice(0, 300));
      return res.status(resp.status).json({
        error: 'cohere_error',
        status: resp.status,
        statusText: resp.statusText,
        bodyPreview: errText.slice(0, 800),
      });
    }

    const data = await resp.json();
    const text = (data?.message?.content || []).find((b) => b.type === 'text')?.text || '';

    try {
      const storyboard = JSON.parse(text);
      console.log('Storyboard JSON:\n', JSON.stringify(storyboard, null, 2)); // prints on server
      return res.json(storyboard); // returns to frontend
    } catch {
      console.log('Model returned non-JSON (preview):', text.slice(0, 200));
      return res.status(502).json({ error: 'invalid_json_from_model', preview: text.slice(0, 400) });
    }
  } catch (e) {
    console.error('Server error:', e?.message || e);
    return res.status(500).json({ error: 'server_error', message: e?.message || 'unknown' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
