import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.COHERE_API_KEY;
if (!API_KEY) throw new Error('Set COHERE_API_KEY in your .env');

const MODEL = process.env.COHERE_MODEL || 'c4ai-aya-vision-32b';

// jsonbin constants
const BIN_ID = process.env.JSONBIN_ID || '68c663ff43b1c97be94262fa'; // fixed bin id
const BIN_KEY = process.env.JSONBIN_KEY; // your X-Master-Key

// exactly 4 images, up to 5MB each
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 4, fileSize: 5 * 1024 * 1024 },
});

// Build the prompt for Aya Vision (text + 4 image blocks)
function buildMessage(blurb, dataUrls) {
  const textBlock = {
    type: 'text',
    text: [
      'You are an expert visual storyteller.',
      'Using the 4 photos and the trip blurb, create a sequential 5-panel storyboard that reads like a mini travel narrative.',
      '',
      'Return ONLY raw JSON (no markdown, no prose, no code fences).',
      'Output EXACTLY in this shape (no extra fields):',
      '{',
      '  "iconCategory": "short low-poly 3D icon idea for the WHOLE story (e.g., \\"torii gate\\", \\"ramen bowl\\")",',
      '  "p1": { "title": "...", "description": "..." },',
      '  "p2": { "title": "...", "description": "..." },',
      '  "p3": { "title": "...", "description": "..." },',
      '  "p4": { "title": "...", "description": "..." },',
      '  "p5": { "title": "...", "description": "..." }',
      '}',
      '',
      'Narrative rules (very important):',
      '- Write a coherent, chronological story that progresses from p1 → p5.',
      '- Use a 5-beat arc: (p1) setup & arrival, (p2) inciting moment, (p3) development, (p4) peak/climax, (p5) resolution/reflection.',
      '- Keep a consistent voice (first-person past tense unless the blurb clearly uses third person).',
      '- Each panel MUST explicitly connect to the previous one with a brief transition (e.g., "After leaving Shibuya...", "The next morning in Kyoto...", "Later that day...").',
      '- Keep characters, time of day, and locations consistent across panels when implied by the photos/blurb.',
      '',
      'Description quality (each panel):',
      '- 90–140 words with concrete visual details grounded in the photos.',
      '- Include: who is present, where (specific place/setting), when (time of day/season), objective/emotion, a small conflict/surprise/decision, sensory details, and composition cues (POV/shot, framing, motion).',
      "- End p1–p4 with a forward hook. End p5 with a reflective line that ties back to the trip's theme.",
      '',
      `TRIP BLURB: """${blurb}"""`,
    ].join('\n'),
  };

  const imageBlocks = dataUrls.map((d) => ({
    type: 'image_url',
    image_url: { url: d },
  }));

  return [{ role: 'user', content: [textBlock, ...imageBlocks] }];
}

// Simple health
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// POST /api/storyboard  (form-data: blurb, images[4])
app.post('/api/storyboard', upload.array('images', 4), async (req, res) => {
  try {
    const blurb = String(req.body?.blurb || '').trim();
    const files = req.files || [];

    if (!blurb) return res.status(400).json({ error: 'Missing blurb' });
    if (files.length !== 4) return res.status(400).json({ error: 'Please upload exactly 4 images' });

    // buffers -> base64 data URLs
    const dataUrls = files.map((file) => {
      const mime = file.mimetype || 'image/png';
      const b64 = file.buffer.toString('base64');
      return `data:${mime};base64,${b64}`;
    });

    // Call Cohere
    const body = {
      model: MODEL,
      messages: buildMessage(blurb, dataUrls),
      temperature: 0.35,
      max_tokens: 1800,
    };

    const resp = await fetch('https://api.cohere.ai/v2/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
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

    const co = await resp.json();
    const text = (co?.message?.content || []).find((b) => b.type === 'text')?.text || '';

    let raw;
    try {
      raw = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: 'invalid_json_from_model', preview: text.slice(0, 400) });
    }

    // Normalize model JSON
    const toPanel = (p = {}) => ({
      title: typeof p?.title === 'string' ? p.title : '',
      description: typeof p?.description === 'string' ? p.description : '',
    });

    const normalizedStoryboard = {
      iconCategory:
        raw.iconCategory || raw.globalIcon || raw.icon ||
        (raw?.p1?.iconPrompt ?? 'memory-orb'),
      p1: toPanel(raw.p1 || raw.panels?.[0]),
      p2: toPanel(raw.p2 || raw.panels?.[1]),
      p3: toPanel(raw.p3 || raw.panels?.[2]),
      p4: toPanel(raw.p4 || raw.panels?.[3]),
      p5: toPanel(raw.p5 || raw.panels?.[4]),
    };

    const ok = ['p1', 'p2', 'p3', 'p4', 'p5'].every(
      (k) => normalizedStoryboard[k]?.title && normalizedStoryboard[k]?.description
    );
    if (!ok) {
      return res.status(502).json({ error: 'incomplete_story', preview: text.slice(0, 400) });
    }

    // --- Publish to jsonbin ---
    const stringContent = JSON.stringify(normalizedStoryboard, null, 2);

    const jbResp = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': BIN_KEY,
        'X-Bin-Private': 'false'
      },
      body: stringContent
    });

    if (!jbResp.ok) {
      const txt = await jbResp.text();
      console.error('jsonbin update error:', jbResp.status, txt);
      return res.status(502).json({ error: 'jsonbin_update_failed', status: jbResp.status, body: txt });
    }

    const publicUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest?meta=false`;

    return res.json({
      ...normalizedStoryboard,
      publicUrl,
      previewUrl: `${publicUrl}&t=${Date.now()}`
    });
  } catch (e) {
    console.error('Server error:', e?.message || e);
    return res.status(500).json({ error: 'server_error', message: e?.message || 'unknown' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Storyboard backend`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🧪 Health:  http://localhost:${PORT}/api/ping`);
  console.log(`🧷 Public JSON: https://api.jsonbin.io/v3/b/${BIN_ID}/latest?meta=false`);
});
