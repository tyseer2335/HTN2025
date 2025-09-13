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

      // Generate audio narration with VAPI
      console.log('🎤 Generating audio narration...');
      const storyboardWithAudio = await VAPIService.generateStoryboardNarration(storyboard);

      // Save to MongoDB
      try {
        const memoryData = {
          id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'anonymous', // Can be updated when auth is added
          title: storyboardWithAudio.title || `Memory from ${new Date().toLocaleDateString()}`,
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
            version: '1.1'
          }
        };

        const savedMemory = await saveMemory(memoryData);
        console.log('💾 Memory saved to MongoDB:', savedMemory._id);
        console.log(`🎵 Audio files generated: ${memoryData.metadata.totalAudioFiles}`);

        // Return enhanced response
        return res.json({
          ...storyboardWithAudio,
          memoryId: savedMemory._id,
          saved: true,
          audioGenerated: storyboardWithAudio.audioNarrationComplete || false
        });

      } catch (dbError) {
        console.error('MongoDB save failed:', dbError);
        // Still return the storyboard even if DB save fails
        return res.json({
          ...storyboardWithAudio,
          saved: false,
          saveError: 'Database unavailable',
          audioGenerated: storyboardWithAudio.audioNarrationComplete || false
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
