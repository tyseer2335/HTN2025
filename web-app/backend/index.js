// backend/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { saveMemory, getAllMemories, getUserMemories, getMemoryById, getMemoryStats } from './db.js';
import VAPIService from './services/VAPIService.js';

const app = express();
app.use(cors());
app.use(express.json());

// Serve generated audio files
app.use('/audio', express.static('generated-audio'));

const API_KEY = process.env.COHERE_API_KEY;
if (!API_KEY) throw new Error('Set COHERE_API_KEY in your .env');

const MODEL = process.env.COHERE_MODEL || 'c4ai-aya-vision-32b';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 4, fileSize: 5 * 1024 * 1024 }, // <-- exactly 4 images
});

// ONE message: text + 4 image blocks (panels have title + description)
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
      '- End p1–p4 with a forward hook. End p5 with a reflective line that ties back to the trip's theme.',
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

// Health check with MongoDB status
app.get('/api/ping', async (_req, res) => {
  try {
    const stats = await getMemoryStats();
    res.json({ ok: true, mongodb: stats });
  } catch (error) {
    res.json({ ok: true, mongodb: { status: 'disconnected', error: error.message } });
  }
});

// Get all memories (for Spectacles sync)
app.get('/api/memories', async (req, res) => {
  try {
    const { userId = 'anonymous', limit = 20 } = req.query;
    const memories = await getUserMemories(userId, parseInt(limit));

    // Format for Spectacles consumption
    const spectaclesFormat = memories.map(memory => ({
      id: memory.id || memory._id.toString(),
      title: memory.title || 'Untitled Memory',
      description: memory.description,
      theme: memory.theme || 'watercolor',
      storyboard: memory.storyboard,
      createdAt: memory.createdAt,
      thumbnailUrl: memory.storyboard?.panels?.[0]?.generatedImageUrl || null
    }));

    res.json(spectaclesFormat);
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Get specific memory
app.get('/api/memories/:id', async (req, res) => {
  try {
    const memory = await getMemoryById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    res.json(memory);
  } catch (error) {
    console.error('Get memory error:', error);
    res.status(500).json({ error: 'Failed to get memory' });
  }
});

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

    try {
      const raw = JSON.parse(text);

      const toPanel = (p = {}) => ({
        title: typeof p.title === 'string' ? p.title : '',
        description: typeof p.description === 'string' ? p.description : '',
      });

      let normalizedStoryboard;
      if (Array.isArray(raw.panels)) {
        normalizedStoryboard = {
          iconCategory:
            raw.iconCategory || raw.globalIcon || raw.icon ||
            (raw.panels.find((p) => typeof p.iconPrompt === 'string')?.iconPrompt) ||
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

      // Generate audio narration with VAPI
      console.log('🎤 Generating audio narration...');
      const storyboardWithAudio = await VAPIService.generateStoryboardNarration(normalizedStoryboard);

      // Save to MongoDB
      try {
        const memoryData = {
          id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'anonymous', // Can be updated when auth is added
          title: `Memory from ${new Date().toLocaleDateString()}`,
          description: blurb,
          theme: 'watercolor', // Default theme
          storyboard: storyboardWithAudio,
          originalImages: dataUrls.length, // Store count instead of actual URLs for size
          metadata: {
            aiModel: 'cohere-aya-vision',
            audioModel: 'vapi-tts',
            audioGenerated: storyboardWithAudio.audioNarrationComplete || false,
            totalAudioFiles: storyboardWithAudio.totalAudioFiles || 0,
            processingTime: Date.now(),
            version: '2.0'
          }
        };

        const savedMemory = await saveMemory(memoryData);
        console.log('💾 Memory saved to MongoDB:', savedMemory._id);
        console.log(`🎵 Audio files generated: ${memoryData.metadata.totalAudioFiles}`);

        // Return enhanced response with both team format AND our enhancements
        return res.json({
          ...normalizedStoryboard, // Your team's expected format
          memoryId: savedMemory._id,
          saved: true,
          audioGenerated: storyboardWithAudio.audioNarrationComplete || false,
          // Additional metadata for debugging
          _meta: {
            audioFiles: storyboardWithAudio.totalAudioFiles,
            mongodb: true,
            vapi: storyboardWithAudio.audioNarrationComplete
          }
        });

      } catch (dbError) {
        console.error('MongoDB save failed:', dbError);
        // Still return the normalized storyboard even if DB save fails
        return res.json({
          ...normalizedStoryboard,
          saved: false,
          saveError: 'Database unavailable'
        });
      }

    } catch {
      console.log('Model returned non-JSON (preview):', text.slice(0, 200));
      return res.status(502).json({ error: 'invalid_json_from_model', preview: text.slice(0, 400) });
    }
  } catch (e) {
    console.error('Server error:', e?.message || e);
    return res.status(500).json({ error: 'server_error', message: e?.message || 'unknown' });
  }
});

// Test endpoint for MongoDB
app.post('/api/test-memory', async (req, res) => {
  try {
    const testMemory = {
      id: `test_${Date.now()}`,
      userId: 'test-user',
      title: 'Test Memory',
      description: 'This is a test memory to verify MongoDB connection',
      theme: 'watercolor',
      storyboard: {
        storyId: 'test',
        theme: 'watercolor',
        panels: [
          {
            id: 'p1',
            title: 'Test Panel',
            description: 'Testing MongoDB integration',
            keywords: ['test', 'mongodb', 'hackathon']
          }
        ]
      }
    };

    const saved = await saveMemory(testMemory);
    res.json({ success: true, message: 'MongoDB working!', memoryId: saved._id });
  } catch (error) {
    res.status(500).json({ error: 'MongoDB connection failed', details: error.message });
  }
});

// VAPI health check endpoint
app.get('/api/audio/health', async (req, res) => {
  try {
    const health = await VAPIService.checkHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'VAPI health check failed', details: error.message });
  }
});

// Test VAPI audio generation
app.post('/api/audio/test', async (req, res) => {
  try {
    const { text = 'This is a test of the voice narration system for memory storyboards.' } = req.body;

    console.log('🎤 Testing VAPI audio generation...');
    const audioUrl = await VAPIService.generateSpeech(text, {
      voice: 'nova',
      speed: 1.0
    });

    res.json({
      success: true,
      message: 'VAPI audio test completed',
      text: text,
      audioUrl: audioUrl,
      fullUrl: `http://localhost:${process.env.PORT || 8787}${audioUrl}`
    });

  } catch (error) {
    res.status(500).json({ error: 'VAPI test failed', details: error.message });
  }
});

// Get available voices
app.get('/api/audio/voices', async (req, res) => {
  try {
    const voices = await VAPIService.getAvailableVoices();
    res.json({ voices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get voices', details: error.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Memory Backend with MongoDB Atlas`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/ping`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});