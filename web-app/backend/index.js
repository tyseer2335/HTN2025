// backend/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { saveMemory, getAllMemories, getUserMemories, getMemoryById, getMemoryStats } from './db.js';
import { GeminiService } from './services/GeminiService.js';

const app = express();
app.use(cors());
app.use(express.json());


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
      '- End p1–p4 with a forward hook. End p5 with a reflective line that ties back to the trip theme.',
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

// Health check with MongoDB and Gemini status
app.get('/api/ping', async (_req, res) => {
  try {
    const stats = await getMemoryStats();
    const geminiHealth = await GeminiService.checkHealth();
    res.json({
      ok: true,
      mongodb: stats,
      gemini: geminiHealth
    });
  } catch (error) {
    const geminiHealth = await GeminiService.checkHealth();
    res.json({
      ok: true,
      mongodb: { status: 'disconnected', error: error.message },
      gemini: geminiHealth
    });
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

      // Generate images for each panel using Gemini
      let enhancedStoryboard = { ...normalizedStoryboard };
      let generatedTitle = null;

      try {
        console.log('🎨 Starting Gemini image generation pipeline...');

        // Generate enhanced title
        generatedTitle = await GeminiService.enhanceMemoryTitle(blurb);

        // Generate icon for the memory orb
        try {
          const memoryIcon = await GeminiService.generateMemoryIcon(enhancedStoryboard.iconCategory);
          enhancedStoryboard.generatedIconUrl = memoryIcon;
          console.log(`✅ Memory icon generated for "${enhancedStoryboard.iconCategory}"`);
        } catch (iconError) {
          console.error('❌ Icon generation failed:', iconError.message);
        }

        // Generate images for each panel
        const panelKeys = ['p1', 'p2', 'p3', 'p4', 'p5'];
        for (let i = 0; i < panelKeys.length; i++) {
          const panelKey = panelKeys[i];
          const panel = enhancedStoryboard[panelKey];

          if (panel?.description) {
            try {
              const generatedImage = await GeminiService.generateStoryboardImage(
                panel.description,
                i,
                enhancedStoryboard.iconCategory
              );

              panel.generatedImageUrl = generatedImage;
              console.log(`✅ Panel ${i + 1} image generated`);
            } catch (imageError) {
              console.error(`❌ Failed to generate image for panel ${i + 1}:`, imageError.message);
              // Continue with other panels even if one fails
            }
          }
        }

        console.log('🎨 Gemini enhancement complete!');
      } catch (geminiError) {
        console.error('⚠️ Gemini enhancement failed, continuing with text-only:', geminiError.message);
      }

      // Save to MongoDB
      try {
        const memoryData = {
          id: `memory_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          userId: 'anonymous', // Can be updated when auth is added
          title: generatedTitle || `Memory from ${new Date().toLocaleDateString()}`,
          description: blurb,
          theme: 'watercolor', // Default theme
          storyboard: enhancedStoryboard,
          originalImages: dataUrls.length,
          metadata: {
            aiModels: ['cohere-aya-vision', 'gemini-2.5-flash-image'],
            processingTime: Date.now(),
            version: '3.0',
            hasGeneratedImages: enhancedStoryboard.p1?.generatedImageUrl ? true : false
          }
        };

        const savedMemory = await saveMemory(memoryData);
        console.log('💾 Memory saved to MongoDB:', savedMemory._id);

        // Return enhanced response with both team format AND our enhancements
        return res.json({
          ...enhancedStoryboard, // Enhanced format with generated images
          memoryId: savedMemory._id,
          saved: true,
          _meta: {
            mongodb: true
          }
        });

      } catch (dbError) {
        console.error('MongoDB save failed:', dbError);
        // Still return the enhanced storyboard even if DB save fails
        return res.json({
          ...enhancedStoryboard,
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

// Test icon generation
app.post('/api/generate-icon', async (req, res) => {
  try {
    const { iconCategory, theme = 'low-poly' } = req.body;

    if (!iconCategory) {
      return res.status(400).json({ error: 'iconCategory required' });
    }

    console.log(`🎨 Testing icon generation for "${iconCategory}"...`);
    const iconUrl = await GeminiService.generateMemoryIcon(iconCategory, theme);

    res.json({
      success: true,
      iconCategory,
      theme,
      iconUrl,
      message: 'Icon generated successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Icon generation failed',
      details: error.message,
      iconCategory: req.body?.iconCategory
    });
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




const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Memory Backend with MongoDB Atlas`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/ping`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});