import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

class VAPIService {
  constructor() {
    if (!VAPI_API_KEY) {
      console.warn('⚠️  VAPI_API_KEY not found. Audio generation will be disabled.');
    }

    // Create audio storage directory
    this.audioDir = path.join(process.cwd(), 'generated-audio');
    this.ensureAudioDirectory();
  }

  async ensureAudioDirectory() {
    try {
      await fs.mkdir(this.audioDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create audio directory:', error);
    }
  }

  /**
   * Generate speech audio from text using VAPI
   */
  async generateSpeech(text, options = {}) {
    if (!VAPI_API_KEY) {
      console.log('VAPI not configured, returning placeholder audio URL');
      return `https://placeholder-audio.com/tts/${encodeURIComponent(text.substring(0, 50))}.mp3`;
    }

    try {
      const {
        voice = 'alloy',
        speed = 1.0,
        pitch = 1.0,
        format = 'mp3'
      } = options;

      console.log(`🎤 Generating speech for: "${text.substring(0, 50)}..."`);

      // VAPI Text-to-Speech API call
      const response = await axios.post(`${VAPI_BASE_URL}/tts`, {
        text: text,
        voice: voice,
        speed: speed,
        pitch: pitch,
        format: format
      }, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer', // For binary audio data
        timeout: 30000 // 30 second timeout
      });

      // Save audio file locally
      const filename = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${format}`;
      const filepath = path.join(this.audioDir, filename);

      await fs.writeFile(filepath, response.data);

      const audioUrl = `/audio/${filename}`;
      console.log(`✅ Audio generated: ${audioUrl}`);

      return audioUrl;

    } catch (error) {
      console.error('VAPI speech generation failed:', error.response?.data || error.message);

      // Return a fallback placeholder
      return `https://placeholder-audio.com/error/${Date.now()}.mp3`;
    }
  }

  /**
   * Generate narration for a complete storyboard
   */
  async generateStoryboardNarration(storyboard) {
    if (!storyboard?.panels || !Array.isArray(storyboard.panels)) {
      console.warn('Invalid storyboard structure for narration');
      return storyboard;
    }

    console.log(`🎬 Generating narration for ${storyboard.panels.length} panels...`);

    const enhancedPanels = [];

    for (const [index, panel] of storyboard.panels.entries()) {
      try {
        // Create natural narration text
        const narrationText = this.createNarrationText(panel, index, storyboard.panels.length);

        // Generate audio
        const audioUrl = await this.generateSpeech(narrationText, {
          voice: 'nova', // More natural voice for storytelling
          speed: 0.9,    // Slightly slower for dramatic effect
          pitch: 1.0
        });

        enhancedPanels.push({
          ...panel,
          audioUrl: audioUrl,
          narrationText: narrationText,
          audioGenerated: true
        });

        console.log(`✅ Panel ${index + 1}/${storyboard.panels.length} narration complete`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Failed to generate narration for panel ${index + 1}:`, error);

        enhancedPanels.push({
          ...panel,
          audioUrl: null,
          narrationText: this.createNarrationText(panel, index, storyboard.panels.length),
          audioGenerated: false
        });
      }
    }

    return {
      ...storyboard,
      panels: enhancedPanels,
      audioNarrationComplete: true,
      totalAudioFiles: enhancedPanels.filter(p => p.audioGenerated).length
    };
  }

  /**
   * Create natural narration text from panel data
   */
  createNarrationText(panel, index, totalPanels) {
    const { title, description } = panel;

    // Create different narrative styles based on panel position
    let prefix = '';
    if (index === 0) {
      prefix = 'Our story begins... ';
    } else if (index === totalPanels - 1) {
      prefix = 'Finally, ';
    } else if (index === Math.floor(totalPanels / 2)) {
      prefix = 'At the heart of our adventure, ';
    } else {
      const transitions = ['Next, ', 'Then, ', 'Meanwhile, ', 'As our story unfolds, '];
      prefix = transitions[index % transitions.length];
    }

    // Combine title and description into natural speech
    const narration = `${prefix}${title}. ${description}`;

    // Clean up the text for better speech
    return narration
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure proper spacing after sentences
      .trim();
  }

  /**
   * Generate a complete memory introduction
   */
  async generateMemoryIntro(memory) {
    if (!memory.title || !memory.description) {
      return null;
    }

    const introText = `Welcome to "${memory.title}". ${memory.description}. Let's explore this memory together.`;

    try {
      const audioUrl = await this.generateSpeech(introText, {
        voice: 'alloy',
        speed: 1.0,
        pitch: 1.1 // Slightly higher pitch for intro
      });

      return {
        audioUrl,
        introText,
        generated: true
      };
    } catch (error) {
      console.error('Failed to generate memory intro:', error);
      return {
        audioUrl: null,
        introText,
        generated: false
      };
    }
  }

  /**
   * Get available voices from VAPI
   */
  async getAvailableVoices() {
    if (!VAPI_API_KEY) {
      return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']; // OpenAI-style fallback
    }

    try {
      const response = await axios.get(`${VAPI_BASE_URL}/voices`, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`
        }
      });

      return response.data.voices || [];
    } catch (error) {
      console.error('Failed to get VAPI voices:', error);
      return ['alloy', 'nova']; // Fallback
    }
  }

  /**
   * Check VAPI service health
   */
  async checkHealth() {
    if (!VAPI_API_KEY) {
      return {
        status: 'disabled',
        message: 'VAPI_API_KEY not configured'
      };
    }

    try {
      const response = await axios.get(`${VAPI_BASE_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`
        },
        timeout: 5000
      });

      return {
        status: 'healthy',
        message: 'VAPI service is available',
        response: response.data
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message
      };
    }
  }
}

export default new VAPIService();