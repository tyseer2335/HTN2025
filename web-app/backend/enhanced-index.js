import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Import our enhanced services
import AIService from './services/AIService.js';
import { saveMemory, getUserMemories, getMemoryById } from './models/Memory.js';

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Multer configuration with better validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 3,
    fileSize: 10 * 1024 * 1024, // 10MB per file
    fieldSize: 1024 * 1024 // 1MB for text fields
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Environment validation
const requiredEnvVars = ['COHERE_API_KEY', 'MONGODB_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

/**
 * Enhanced memory creation endpoint with full AI pipeline
 */
app.post('/api/memories', upload.array('images', 3), async (req, res) => {
  try {
    const { blurb, theme = 'auto', userId = 'anonymous' } = req.body;
    const files = req.files || [];

    // Validation
    if (!blurb?.trim()) {
      return res.status(400).json({ error: 'Missing memory description' });
    }
    if (files.length !== 3) {
      return res.status(400).json({ error: 'Please upload exactly 3 images' });
    }

    // Convert files to data URLs
    const dataUrls = files.map(file => {
      const mime = file.mimetype || 'image/png';
      const b64 = file.buffer.toString('base64');
      return `data:${mime};base64,${b64}`;
    });

    // Step 1: Auto-detect theme if requested
    let selectedTheme = theme;
    if (theme === 'auto') {
      selectedTheme = await AIService.detectTheme(blurb, dataUrls);
      console.log('Auto-detected theme:', selectedTheme);
    }

    // Step 2: Generate enhanced storyboard
    console.log('Generating storyboard with Cohere + Gemini...');
    const storyboard = await AIService.generateStoryboard(blurb, dataUrls, selectedTheme);

    // Step 3: Generate panel images (if enabled)
    console.log('Generating AI images for panels...');
    const storyboardWithImages = await AIService.generatePanelImages(storyboard);

    // Step 4: Generate audio narration
    console.log('Generating audio narration...');
    const finalStoryboard = await AIService.generateAudioNarration(storyboardWithImages);

    // Step 5: Save to MongoDB
    const memoryData = {
      id: uuidv4(),
      userId,
      title: finalStoryboard.title || `Memory from ${new Date().toLocaleDateString()}`,
      description: blurb,
      theme: selectedTheme,
      storyboard: finalStoryboard,
      originalImages: dataUrls,
      metadata: {
        aiModel: 'cohere-gemini-enhanced',
        processingTime: Date.now(),
        version: '2.0'
      }
    };

    const savedMemory = await saveMemory(memoryData);

    res.json({
      success: true,
      memory: savedMemory,
      stats: {
        panels: finalStoryboard.panels?.length || 0,
        theme: selectedTheme,
        processingSteps: ['theme-detection', 'storyboard', 'images', 'audio', 'saved']
      }
    });

  } catch (error) {
    console.error('Memory creation error:', error);
    res.status(500).json({
      error: 'Memory creation failed',
      message: error.message,
      type: error.name
    });
  }
});

/**
 * Get user's memories for Spectacles sync
 */
app.get('/api/memories', async (req, res) => {
  try {
    const { userId = 'anonymous', limit = 20 } = req.query;

    const memories = await getUserMemories(userId);

    // Format for Spectacles consumption
    const spectaclesFormat = memories.slice(0, parseInt(limit)).map(memory => ({
      id: memory.id,
      title: memory.title,
      description: memory.description,
      theme: memory.theme,
      storyboard: memory.storyboard,
      createdAt: memory.createdAt,
      thumbnailUrl: memory.storyboard?.panels?.[0]?.generatedImageUrl || null
    }));

    res.json(spectaclesFormat);

  } catch (error) {
    console.error('Fetch memories error:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

/**
 * Get specific memory by ID
 */
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
 * Legacy storyboard endpoint for backward compatibility
 */
app.post('/api/storyboard', upload.array('images', 3), async (req, res) => {
  try {
    const blurb = String(req.body?.blurb || '').trim();
    const files = req.files || [];

    if (!blurb) return res.status(400).json({ error: 'Missing blurb' });
    if (files.length !== 3) return res.status(400).json({ error: 'Please upload exactly 3 images' });

    const dataUrls = files.map(file => {
      const mime = file.mimetype || 'image/png';
      const b64 = file.buffer.toString('base64');
      return `data:${mime};base64,${b64}`;
    });

    const storyboard = await AIService.generateStoryboard(blurb, dataUrls, 'watercolor');
    res.json(storyboard);

  } catch (error) {
    console.error('Legacy storyboard error:', error);
    res.status(500).json({ error: 'Storyboard generation failed' });
  }
});

/**
 * AI capabilities endpoint for frontend
 */
app.get('/api/ai/capabilities', (req, res) => {
  res.json({
    features: {
      themeDetection: !!process.env.GEMINI_API_KEY,
      imageGeneration: true, // placeholder
      audioNarration: true, // placeholder
      enhancedStoryboards: true
    },
    models: {
      storyboard: 'c4ai-aya-vision-32b',
      enhancement: 'gemini-1.5-pro',
      themeDetection: 'gemini-1.5-pro-vision'
    },
    themes: ['watercolor', 'sketch', 'comic', 'vintage', 'modern', 'artistic']
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Memory Backend v2.0 running on http://localhost:${PORT}`);
  console.log(`🤖 AI Features: Cohere + Gemini + MongoDB Atlas`);
  console.log(`🥽 Spectacles API: Ready for AR sync`);
});