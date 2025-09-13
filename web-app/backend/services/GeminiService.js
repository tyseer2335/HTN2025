import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn('GEMINI_API_KEY not found - image generation disabled');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export class GeminiService {
  // Removed icon generation - using Snap 3D API for icons instead
  static async generateStoryboardImage(panelDescription, panelIndex, theme = 'watercolor') {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Use Gemini 2.5 Flash Image (nano-banana) for image generation
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image-preview"
      });

      const themeStyles = {
        watercolor: 'soft watercolor painting style with flowing colors and gentle edges',
        sketch: 'hand-drawn sketch style with pencil strokes and crosshatching',
        comic: 'vibrant comic book style with bold outlines and pop art colors',
        vintage: 'vintage sepia-toned illustration with aged paper texture'
      };

      const styleDescription = themeStyles[theme] || themeStyles.watercolor;

      const prompt = `Create a ${styleDescription} illustration for panel ${panelIndex + 1} of a travel storyboard.
      Scene description: "${panelDescription}"

      Style requirements:
      - Comic panel composition with clear focal point
      - Travel photography aesthetic adapted to ${theme} art style
      - Cinematic lighting and composition
      - Rich visual storytelling details
      - Avoid any text or speech bubbles in the image
      - 16:9 aspect ratio suitable for storyboard display`;

      console.log(`🎨 Generating image for panel ${panelIndex + 1} with Gemini...`);

      const result = await model.generateContent([prompt]);
      const response = await result.response;

      // Gemini 2.5 Flash Image returns the image data directly
      if (response.candidates?.[0]?.content?.parts) {
        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (imagePart?.inlineData) {
          // Convert to data URL for immediate use
          const mimeType = imagePart.inlineData.mimeType || 'image/png';
          const imageData = imagePart.inlineData.data;
          const dataUrl = `data:${mimeType};base64,${imageData}`;

          console.log(`✅ Generated ${mimeType} image for panel ${panelIndex + 1}`);
          return dataUrl;
        }
      }

      throw new Error('No image data in Gemini response');

    } catch (error) {
      console.error(`❌ Gemini image generation failed for panel ${panelIndex + 1}:`, error.message);
      throw error;
    }
  }

  static async enhanceMemoryTitle(tripBlurb) {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Create a catchy, memorable 3-5 word title for this travel memory. Make it evocative and specific to the experience described.

Trip description: "${tripBlurb}"

Requirements:
- Maximum 5 words
- Capture the essence/mood of the trip
- Use vivid, descriptive language
- Avoid generic words like "trip", "vacation", "journey"
- Return ONLY the title, no quotes or extra text

Examples of good titles:
- "Sunrise Over Kyoto Temples"
- "Lost in Tuscan Vineyards"
- "Northern Lights Dancing"`;

      const result = await model.generateContent([prompt]);
      const title = result.response.text()?.trim() || null;

      console.log(`📝 Generated title: "${title}"`);
      return title;

    } catch (error) {
      console.error('❌ Title generation failed:', error.message);
      return null;
    }
  }

  static async extractTripMetadata(tripBlurb) {
    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Analyze this travel description and extract key metadata. Return ONLY valid JSON.

Trip description: "${tripBlurb}"

Extract:
{
  "primaryLocation": "main destination city/country",
  "activityType": "adventure|cultural|relaxation|food|nature|urban",
  "mood": "exciting|peaceful|romantic|adventurous|nostalgic",
  "season": "spring|summer|fall|winter|unknown",
  "keywords": ["3-5", "descriptive", "keywords"]
}`;

      const result = await model.generateContent([prompt]);
      const responseText = result.response.text()?.trim();

      if (responseText) {
        const metadata = JSON.parse(responseText);
        console.log('🏷️ Extracted trip metadata:', metadata);
        return metadata;
      }

      return null;

    } catch (error) {
      console.error('❌ Metadata extraction failed:', error.message);
      return null;
    }
  }

  static async checkHealth() {
    if (!genAI) {
      return { status: 'disabled', reason: 'API key not configured' };
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent(['Hello']);
      return { status: 'connected', model: 'gemini-2.5-flash' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}