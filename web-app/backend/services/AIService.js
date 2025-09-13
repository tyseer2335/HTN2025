import { GoogleGenerativeAI } from '@google/generative-ai';

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  /**
   * Enhanced storyboard generation with improved prompting
   */
  async generateStoryboard(blurb, dataUrls, theme = 'default') {
    const enhancedPrompt = this.buildEnhancedPrompt(blurb, theme);

    const body = {
      model: 'c4ai-aya-vision-32b',
      messages: this.buildMessage(enhancedPrompt, dataUrls),
      temperature: 0.3, // Slightly more creative
      max_tokens: 2000, // More space for detailed descriptions
    };

    const response = await fetch('https://api.cohere.ai/v2/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.message?.content?.find(b => b.type === 'text')?.text || '';

    try {
      const storyboard = JSON.parse(text);

      // Post-process with Gemini for enhancement
      const enhancedStoryboard = await this.enhanceWithGemini(storyboard, theme);

      return enhancedStoryboard;
    } catch (error) {
      console.error('Failed to parse Cohere response:', text);
      throw new Error('Invalid JSON response from Cohere');
    }
  }

  /**
   * Use Gemini to enhance the storyboard with better descriptions and audio scripts
   */
  async enhanceWithGemini(storyboard, theme) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const enhancementPrompt = `
        Enhance this storyboard for a ${theme} themed memory:
        ${JSON.stringify(storyboard, null, 2)}

        For each panel, improve:
        1. Add more vivid, emotional descriptions
        2. Create natural audio narration text (60-100 words)
        3. Enhance keywords for better visual generation
        4. Add mood and emotion tags

        Return the enhanced storyboard as JSON with these additions:
        - audioScript: natural narration text for each panel
        - mood: emotional tone (happy/nostalgic/adventurous/peaceful)
        - visualStyle: specific visual style instructions
        - transitionType: how to transition to next panel

        Keep the original structure but enhance all content.
      `;

      const result = await model.generateContent(enhancementPrompt);
      const enhancedText = result.response.text();

      // Try to extract JSON from Gemini response
      const jsonMatch = enhancedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const enhanced = JSON.parse(jsonMatch[0]);
        return enhanced;
      }

      // Fallback: return original with basic audio scripts
      return this.addBasicAudioScripts(storyboard);

    } catch (error) {
      console.error('Gemini enhancement failed:', error);
      return this.addBasicAudioScripts(storyboard);
    }
  }

  /**
   * Generate images for storyboard panels using AI
   */
  async generatePanelImages(storyboard) {
    const enhancedPanels = [];

    for (const panel of storyboard.panels) {
      try {
        // Use panel description and keywords to generate image
        const imagePrompt = `${panel.description}. Style: ${panel.visualStyle || 'photorealistic'}. Keywords: ${panel.keywords.join(', ')}`;

        // This would integrate with an image generation API
        // For now, we'll create a placeholder
        const generatedImageUrl = await this.generateImage(imagePrompt);

        enhancedPanels.push({
          ...panel,
          generatedImageUrl,
          originalImagePrompt: imagePrompt
        });
      } catch (error) {
        console.error(`Failed to generate image for panel ${panel.id}:`, error);
        enhancedPanels.push(panel);
      }
    }

    return {
      ...storyboard,
      panels: enhancedPanels
    };
  }

  /**
   * Generate audio narration using text-to-speech
   */
  async generateAudioNarration(storyboard) {
    const enhancedPanels = [];

    for (const panel of storyboard.panels) {
      try {
        const audioScript = panel.audioScript || panel.description;

        // This would integrate with VAPI or another TTS service
        const audioUrl = await this.generateAudio(audioScript);

        enhancedPanels.push({
          ...panel,
          audioUrl,
          audioScript
        });
      } catch (error) {
        console.error(`Failed to generate audio for panel ${panel.id}:`, error);
        enhancedPanels.push(panel);
      }
    }

    return {
      ...storyboard,
      panels: enhancedPanels
    };
  }

  /**
   * Intelligent theme detection from images and text
   */
  async detectTheme(blurb, dataUrls) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });

      const themePrompt = `
        Analyze these images and text to determine the best visual theme:
        Text: "${blurb}"

        Choose from: watercolor, sketch, comic, vintage, modern, artistic

        Consider:
        - Setting (indoor/outdoor, urban/nature)
        - Mood (happy/nostalgic/adventurous)
        - Content type (family/travel/food/sports)

        Return only the theme name.
      `;

      // Convert first image for analysis
      const imageData = dataUrls[0].split(',')[1];

      const result = await model.generateContent([
        themePrompt,
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const theme = result.response.text().trim().toLowerCase();
      return ['watercolor', 'sketch', 'comic', 'vintage', 'modern', 'artistic'].includes(theme)
        ? theme
        : 'watercolor';

    } catch (error) {
      console.error('Theme detection failed:', error);
      return 'watercolor';
    }
  }

  buildEnhancedPrompt(blurb, theme) {
    const themeStyles = {
      watercolor: 'soft, flowing watercolor illustration with gentle colors',
      sketch: 'hand-drawn sketch style with pencil textures',
      comic: 'vibrant comic book style with bold colors and dynamic angles',
      vintage: 'nostalgic vintage photography with sepia tones',
      modern: 'clean, modern photography with crisp details',
      artistic: 'artistic interpretation with creative visual elements'
    };

    return `
You are an expert visual storyteller creating a ${theme} themed memory storyboard.

Using the photos and description, create a sequential 5-panel storyboard that tells a compelling story.

Visual Style: ${themeStyles[theme] || themeStyles.watercolor}

Each panel should include:
- id: p1 through p5
- title: Catchy 2-6 word title
- description: Rich 80-150 word visual description (subject, setting, camera angle, lighting, mood, colors, time of day, props, emotions)
- keywords: 6-10 descriptive words for visual generation
- iconPrompt: Simple 3D icon concept
- mood: Emotional tone (happy/nostalgic/adventurous/peaceful/exciting)

The story should:
1. Have a clear beginning, middle, and satisfying end
2. Show progression and emotional journey
3. Highlight the most memorable moments
4. Feel cinematic and engaging
5. Match the ${theme} aesthetic

Return ONLY valid JSON with no markdown formatting.

TRIP DESCRIPTION: """${blurb}"""
    `;
  }

  buildMessage(prompt, dataUrls) {
    const textBlock = { type: 'text', text: prompt };
    const imageBlocks = dataUrls.map(url => ({
      type: 'image_url',
      image_url: { url }
    }));

    return [{ role: 'user', content: [textBlock, ...imageBlocks] }];
  }

  addBasicAudioScripts(storyboard) {
    return {
      ...storyboard,
      panels: storyboard.panels.map(panel => ({
        ...panel,
        audioScript: `${panel.title}. ${panel.description}`,
        mood: 'nostalgic',
        visualStyle: 'photorealistic'
      }))
    };
  }

  async generateImage(prompt) {
    // Placeholder for image generation API integration
    // Could use DALL-E, Midjourney, or Stable Diffusion
    console.log('Generating image for:', prompt);
    return `https://api.placeholder.com/generated/${Date.now()}.jpg`;
  }

  async generateAudio(text) {
    // Placeholder for VAPI or other TTS integration
    console.log('Generating audio for:', text);
    return `https://api.placeholder.com/audio/${Date.now()}.mp3`;
  }
}

export default new AIService();