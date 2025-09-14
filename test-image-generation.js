#!/usr/bin/env node

/**
 * Image Generation Test
 * Test Gemini image generation specifically
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM',
  GEMINI_IMAGE_MODEL: 'gemini-2.0-flash-preview-image-generation',
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta'
};

async function testImageGeneration() {
  console.log('🖼️ Testing Gemini Image Generation...\n');
  
  try {
    const url = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_IMAGE_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const prompts = [
      "A magical forest with glowing trees and floating islands",
      "A futuristic city with flying cars and neon lights",
      "A cozy cabin in the mountains during winter"
    ];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`Generating image ${i + 1}/3: "${prompt}"`);
      
      const request = {
        contents: [{
          parts: [{ text: prompt }],
          role: "user"
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          temperature: 0.7
        }
      };
      
      const response = await axios.post(url, request, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      if (response.status === 200 && response.data.candidates[0].content.parts) {
        const imagePart = response.data.candidates[0].content.parts.find(part => part.inlineData);
        
        if (imagePart && imagePart.inlineData) {
          const imageData = imagePart.inlineData.data;
          const imageBuffer = Buffer.from(imageData, 'base64');
          const imagePath = path.join(__dirname, `generated-image-${i + 1}.jpg`);
          
          fs.writeFileSync(imagePath, imageBuffer);
          console.log(`✅ Image ${i + 1} saved: ${imagePath} (${imageBuffer.length} bytes)`);
        } else {
          console.log(`❌ No image data found for image ${i + 1}`);
        }
      } else {
        console.log(`❌ Failed to generate image ${i + 1}`);
      }
      
      // Wait between requests
      if (i < prompts.length - 1) {
        console.log('Waiting 2 seconds before next image...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 Image generation test completed!');
    
  } catch (error) {
    console.log('❌ Image generation test failed');
    if (error.response) {
      console.log(`Error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

testImageGeneration();
