
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { publishGist } from './gist.js';


const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.COHERE_API_KEY;
if (!API_KEY) throw new Error('Set COHERE_API_KEY in your .env');

const MODEL = process.env.COHERE_MODEL || 'c4ai-aya-vision-32b';

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

    // Normalize model JSON to your strict shape
    const raw = JSON.parse(text);

    const toPanel = (p = {}) => ({
      title: typeof p?.title === 'string' ? p.title : '',
      description: typeof p?.description === 'string' ? p.description : '',
    });

    let normalizedStoryboard;
    if (Array.isArray(raw.panels)) {
      normalizedStoryboard = {
        iconCategory:
          raw.iconCategory || raw.globalIcon || raw.icon ||
          (raw.panels.find((p) => typeof p?.iconPrompt === 'string')?.iconPrompt) ||
          'memory-orb',
        p1: toPanel(raw.panels[0]),
        p2: toPanel(raw.panels[1]),
        p3: toPanel(raw.panels[2]),
        p4: toPanel(raw.panels[3]),
        p5: toPanel(raw.panels[4]),
      };
    } else {
      normalizedStoryboard = {
        iconCategory:
          raw.iconCategory || raw.globalIcon || raw.icon ||
          (raw?.p1?.iconPrompt ?? 'memory-orb'),
        p1: toPanel(raw.p1),
        p2: toPanel(raw.p2),
        p3: toPanel(raw.p3),
        p4: toPanel(raw.p4),
        p5: toPanel(raw.p5),
      };
    }

    const ok = ['p1', 'p2', 'p3', 'p4', 'p5'].every(
      (k) => normalizedStoryboard[k]?.title && normalizedStoryboard[k]?.description
    );
    if (!ok) {
      return res.status(502).json({
        error: 'incomplete_story',
        preview: text.slice(0, 400),
      });
    }

    console.log('Storyboard JSON (normalized):\n', JSON.stringify(normalizedStoryboard, null, 2));

    // Publish to the SAME Gist every time
    const FILENAME = 'story.json';
    const { gistId, stableRawUrl, htmlUrl } = await publishGist({
      gistId: process.env.STORY_GIST_ID, // IMPORTANT: keeps the link the same (PATCH)
      filename: FILENAME,                // constant filename → constant path
      content: normalizedStoryboard,
    });

    // Respond: stable public URL (optionally add a cache-buster query on the client)
    return res.json({
      ...normalizedStoryboard,
      publicUrl: stableRawUrl, // e.g., https://gist.githubusercontent.com/<user>/<id>/raw/story.json
      gistId,                  // same as STORY_GIST_ID
      gistPage: htmlUrl,       // pretty page
    });
  } catch (e) {
    console.error('Server error:', e?.message || e);
    // If the failure was parsing JSON from the model, surface that clearly
    if (String(e?.message || '').includes('Unexpected')) {
      return res.status(502).json({ error: 'invalid_json_from_model', message: e.message });
    }
    return res.status(500).json({ error: 'server_error', message: e?.message || 'unknown' });
  }
});

// Optional: proxy that always returns freshest JSON (busts CDN cache)
app.get('/public/story/latest', async (_req, res) => {
  try {
    const user = process.env.GITHUB_USER;
    const id = process.env.STORY_GIST_ID;
    if (!user || !id) return res.status(500).json({ error: 'Missing GITHUB_USER or STORY_GIST_ID' });

    const stable = `https://gist.githubusercontent.com/${user}/${id}/raw/story.json?t=${Date.now()}`;
    const r = await fetch(stable, { redirect: 'follow', cache: 'no-store' });
    if (!r.ok) return res.status(502).json({ error: 'gist_fetch_failed', status: r.status });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.type('application/json');
    res.send(await r.text());
  } catch (e) {
    res.status(500).json({ error: 'proxy_error', message: String(e) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Storyboard backend`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🧪 Health:  http://localhost:${PORT}/api/ping`);
  console.log(`🧷 Stable Gist raw: https://gist.githubusercontent.com/${process.env.GITHUB_USER}/${process.env.STORY_GIST_ID}/raw/story.json`);
});
