#!/usr/bin/env node

/**
 * Test Available Gemini Models
 * Check which models are available for text and image generation
 */

const axios = require('axios');

const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM',
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta'
};

async function testAvailableModels() {
  console.log('🔍 Testing Available Gemini Models...\n');
  
  try {
    // List all available models
    const modelsUrl = `${CONFIG.GEMINI_API_BASE_URL}/models?key=${CONFIG.GEMINI_API_KEY}`;
    console.log('Fetching available models...');
    
    const response = await axios.get(modelsUrl, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.status === 200) {
      const models = response.data.models;
      console.log(`✅ Found ${models.length} available models:\n`);
      
      // Group models by type
      const textModels = models.filter(model => 
        model.name.includes('gemini') && 
        model.supportedGenerationMethods?.includes('generateContent')
      );
      
      const imageModels = models.filter(model => 
        model.name.includes('image') || 
        model.name.includes('imagen')
      );
      
      console.log('📝 Text Generation Models:');
      textModels.forEach(model => {
        console.log(`  - ${model.name}`);
        console.log(`    Display Name: ${model.displayName}`);
        console.log(`    Description: ${model.description || 'No description'}`);
        console.log('');
      });
      
      console.log('🖼️ Image Generation Models:');
      if (imageModels.length > 0) {
        imageModels.forEach(model => {
          console.log(`  - ${model.name}`);
          console.log(`    Display Name: ${model.displayName}`);
          console.log(`    Description: ${model.description || 'No description'}`);
          console.log('');
        });
      } else {
        console.log('  No dedicated image generation models found');
      }
      
      // Test a few models
      console.log('🧪 Testing Model Capabilities...\n');
      
      const testModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.0-pro'
      ];
      
      for (const modelName of testModels) {
        if (textModels.some(m => m.name.includes(modelName))) {
          await testModel(modelName);
        }
      }
      
    } else {
      console.log('❌ Failed to fetch models');
      console.log(`Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Error fetching models');
    if (error.response) {
      console.log(`Error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

async function testModel(modelName) {
  try {
    console.log(`Testing ${modelName}...`);
    
    const url = `${CONFIG.GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const request = {
      contents: [{
        parts: [{ text: "Say hello" }],
        role: "user"
      }],
      generationConfig: {
        maxOutputTokens: 20,
        temperature: 0.1
      }
    };
    
    const response = await axios.post(url, request, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.status === 200) {
      const text = response.data.candidates[0].content.parts[0].text;
      console.log(`  ✅ ${modelName}: Working - "${text.substring(0, 30)}..."`);
    } else {
      console.log(`  ❌ ${modelName}: Failed - Status ${response.status}`);
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`  ❌ ${modelName}: Failed - ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
    } else {
      console.log(`  ❌ ${modelName}: Failed - ${error.message}`);
    }
  }
}

testAvailableModels();
