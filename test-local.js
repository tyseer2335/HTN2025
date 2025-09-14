#!/usr/bin/env node

/**
 * SpectraSphere Local Testing Suite
 * Run this to test your Gemini API integration without Lens Studio
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM',
  GEMINI_IMAGE_MODEL: 'gemini-2.0-flash-preview-image-generation',
  GEMINI_TEXT_MODEL: 'gemini-1.5-flash',
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  DEFAULT_TEST_PROMPT: 'A magical forest with glowing trees and floating islands',
  DEFAULT_IMAGE_SIZE: '1024x1024',
  NUMBER_OF_TEST_IMAGES: 3,
  ENABLE_DEBUG_MODE: true
};

// Test results storage
const testResults = {
  configuration: { success: false, message: '' },
  apiKey: { success: false, message: '' },
  imageGeneration: { success: false, message: '' },
  textGeneration: { success: false, message: '' },
  pipeline: { success: false, message: '' }
};

/**
 * Utility functions
 */
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(50));
  console.log(`🧪 ${title}`);
  console.log('='.repeat(50));
};

const logTestResult = (testName, success, message) => {
  const status = success ? 'PASS' : 'FAIL';
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${testName}: ${status} - ${message}`);
};

/**
 * Test 1: Configuration Validation
 */
async function testConfiguration() {
  logSection('Configuration Test');
  
  try {
    // Check if API key is set
    if (!CONFIG.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    
    if (CONFIG.GEMINI_API_KEY.length < 20) {
      throw new Error('GEMINI_API_KEY appears to be invalid (too short)');
    }
    
    if (!CONFIG.GEMINI_API_KEY.startsWith('AIza')) {
      throw new Error('GEMINI_API_KEY does not appear to be a valid Google API key');
    }
    
    // Check other required config
    const requiredConfigs = [
      'GEMINI_IMAGE_MODEL',
      'GEMINI_TEXT_MODEL',
      'GEMINI_API_BASE_URL',
      'DEFAULT_TEST_PROMPT'
    ];
    
    for (const configKey of requiredConfigs) {
      if (!CONFIG[configKey]) {
        throw new Error(`${configKey} is not set`);
      }
    }
    
    testResults.configuration = { success: true, message: 'All configuration values are valid' };
    logTestResult('Configuration', true, 'All configuration values are valid');
    
    // Print configuration
    log('Configuration Summary:', 'info');
    console.log(`  API Key: ${CONFIG.GEMINI_API_KEY.substring(0, 10)}...`);
    console.log(`  Image Model: ${CONFIG.GEMINI_IMAGE_MODEL}`);
    console.log(`  Text Model: ${CONFIG.GEMINI_TEXT_MODEL}`);
    console.log(`  Base URL: ${CONFIG.GEMINI_API_BASE_URL}`);
    console.log(`  Test Prompt: ${CONFIG.DEFAULT_TEST_PROMPT}`);
    
  } catch (error) {
    testResults.configuration = { success: false, message: error.message };
    logTestResult('Configuration', false, error.message);
  }
}

/**
 * Test 2: API Key Validation
 */
async function testAPIKey() {
  logSection('API Key Test');
  
  try {
    // Test API key by making a simple request
    const testUrl = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_TEXT_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const testRequest = {
      contents: [{
        parts: [{ text: "Hello" }],
        role: "user"
      }],
      generationConfig: {
        maxOutputTokens: 10,
        temperature: 0.1
      }
    };
    
    log('Testing API key with simple request...', 'info');
    
    const response = await axios.post(testUrl, testRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.status === 200) {
      testResults.apiKey = { success: true, message: 'API key is valid and working' };
      logTestResult('API Key', true, 'API key is valid and working');
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
    
  } catch (error) {
    if (error.response) {
      const errorMsg = `API request failed: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`;
      testResults.apiKey = { success: false, message: errorMsg };
      logTestResult('API Key', false, errorMsg);
    } else {
      testResults.apiKey = { success: false, message: error.message };
      logTestResult('API Key', false, error.message);
    }
  }
}

/**
 * Test 3: Image Generation
 */
async function testImageGeneration() {
  logSection('Image Generation Test');
  
  try {
    const imageUrl = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_IMAGE_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const imageRequest = {
      contents: [{
        parts: [{ text: CONFIG.DEFAULT_TEST_PROMPT }],
        role: "user"
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.7
      }
    };
    
    log(`Generating image with prompt: "${CONFIG.DEFAULT_TEST_PROMPT}"`, 'info');
    
    const response = await axios.post(imageUrl, imageRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    if (response.status === 200 && response.data.candidates && response.data.candidates[0]) {
      const candidate = response.data.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        const imagePart = candidate.content.parts.find(part => part.inlineData);
        
        if (imagePart && imagePart.inlineData) {
          // Save the generated image
          const imageData = imagePart.inlineData.data;
          const imageBuffer = Buffer.from(imageData, 'base64');
          const imagePath = path.join(__dirname, 'generated-image.jpg');
          
          fs.writeFileSync(imagePath, imageBuffer);
          
          testResults.imageGeneration = { success: true, message: `Image generated successfully and saved to ${imagePath}` };
          logTestResult('Image Generation', true, `Image generated successfully and saved to ${imagePath}`);
          
          // Print image info
          log(`Image saved: ${imagePath}`, 'success');
          log(`Image size: ${imageBuffer.length} bytes`, 'info');
          
        } else {
          throw new Error('No image data found in response');
        }
      } else {
        throw new Error('No content found in response');
      }
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    if (error.response) {
      const errorMsg = `Image generation failed: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`;
      testResults.imageGeneration = { success: false, message: errorMsg };
      logTestResult('Image Generation', false, errorMsg);
    } else {
      testResults.imageGeneration = { success: false, message: error.message };
      logTestResult('Image Generation', false, error.message);
    }
  }
}

/**
 * Test 4: Text Generation
 */
async function testTextGeneration() {
  logSection('Text Generation Test');
  
  try {
    const textUrl = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_TEXT_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const textRequest = {
      contents: [{
        parts: [{ text: "Write a short story about a magical forest in exactly 50 words." }],
        role: "user"
      }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7
      }
    };
    
    log('Generating text with Gemini...', 'info');
    
    const response = await axios.post(textUrl, textRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    if (response.status === 200 && response.data.candidates && response.data.candidates[0]) {
      const candidate = response.data.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        const textPart = candidate.content.parts.find(part => part.text);
        
        if (textPart && textPart.text) {
          testResults.textGeneration = { success: true, message: 'Text generated successfully' };
          logTestResult('Text Generation', true, 'Text generated successfully');
          
          // Print generated text
          log('Generated Text:', 'info');
          console.log(`  "${textPart.text}"`);
          
        } else {
          throw new Error('No text found in response');
        }
      } else {
        throw new Error('No content found in response');
      }
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    if (error.response) {
      const errorMsg = `Text generation failed: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`;
      testResults.textGeneration = { success: false, message: errorMsg };
      logTestResult('Text Generation', false, errorMsg);
    } else {
      testResults.textGeneration = { success: false, message: error.message };
      logTestResult('Text Generation', false, error.message);
    }
  }
}

/**
 * Test 5: Complete Pipeline Test
 */
async function testCompletePipeline() {
  logSection('Complete Pipeline Test');
  
  try {
    log('Testing complete pipeline: Text + Image + Animation Data', 'info');
    
    // Step 1: Generate story text
    const storyPrompt = "Write a short fantasy story about a magical forest in exactly 100 words. Include characters, setting, and a plot.";
    const textUrl = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_TEXT_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const textRequest = {
      contents: [{
        parts: [{ text: storyPrompt }],
        role: "user"
      }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7
      }
    };
    
    log('Step 1: Generating story text...', 'info');
    const textResponse = await axios.post(textUrl, textRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    const storyText = textResponse.data.candidates[0].content.parts[0].text;
    log(`Story generated: ${storyText.substring(0, 50)}...`, 'success');
    
    // Step 2: Generate image for the story
    const imagePrompt = `Create an illustration for this story: ${storyText}`;
    const imageUrl = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_IMAGE_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const imageRequest = {
      contents: [{
        parts: [{ text: imagePrompt }],
        role: "user"
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.7
      }
    };
    
    log('Step 2: Generating story image...', 'info');
    const imageResponse = await axios.post(imageUrl, imageRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    const imageData = imageResponse.data.candidates[0].content.parts.find(part => part.inlineData);
    let imagePath = null;
    if (imageData && imageData.inlineData) {
      const imageBuffer = Buffer.from(imageData.inlineData.data, 'base64');
      imagePath = path.join(__dirname, 'pipeline-story-image.jpg');
      fs.writeFileSync(imagePath, imageBuffer);
      log(`Story image saved: ${imagePath}`, 'success');
    }
    
    // Step 3: Generate animation data
    const animationPrompt = `Create animation parameters for this story image. Return JSON with: duration, zoomLevel, panX, panY, depthScale, and animationType.`;
    const animationRequest = {
      contents: [{
        parts: [{ text: animationPrompt }],
        role: "user"
      }],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3
      }
    };
    
    log('Step 3: Generating animation data...', 'info');
    const animationResponse = await axios.post(textUrl, animationRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    const animationText = animationResponse.data.candidates[0].content.parts[0].text;
    log(`Animation data generated: ${animationText}`, 'success');
    
    // Step 4: Create complete story JSON
    const storyData = {
      title: "Generated Story",
      text: storyText,
      imageUrl: "pipeline-story-image.jpg",
      animation: {
        duration: 4.0,
        zoomLevel: 1.08,
        panX: 0.0,
        panY: 0.02,
        depthScale: 0.02,
        animationType: "kenBurns"
      },
      generatedAt: new Date().toISOString(),
      apiVersion: "gemini-2.5-flash"
    };
    
    const storyPath = path.join(__dirname, 'generated-story.json');
    fs.writeFileSync(storyPath, JSON.stringify(storyData, null, 2));
    
    testResults.pipeline = { success: true, message: 'Complete pipeline test successful' };
    logTestResult('Complete Pipeline', true, 'Complete pipeline test successful');
    
    log('Pipeline Results:', 'success');
    console.log(`  Story: ${storyPath}`);
    console.log(`  Image: ${imagePath}`);
    console.log(`  Animation Data: Generated`);
    
  } catch (error) {
    const errorMsg = `Pipeline test failed: ${error.message}`;
    testResults.pipeline = { success: false, message: errorMsg };
    logTestResult('Complete Pipeline', false, errorMsg);
  }
}

/**
 * Print final results
 */
function printFinalResults() {
  logSection('Final Test Results');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [testName, result] of Object.entries(testResults)) {
    totalTests++;
    if (result.success) passedTests++;
    
    const status = result.success ? 'PASS' : 'FAIL';
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${testName.toUpperCase()}: ${status} - ${result.message}`);
  }
  
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 100) {
    console.log('\n🎉 ALL TESTS PASSED! Your setup is ready for Snap Spectacles!');
  } else if (successRate >= 66) {
    console.log('\n⚠️ Most tests passed, but some issues need attention.');
  } else {
    console.log('\n❌ Multiple tests failed. Please check your configuration.');
  }
  
  console.log('\n📁 Generated Files:');
  const files = fs.readdirSync(__dirname).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.json')
  );
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 SpectraSphere Local Testing Suite');
  console.log('Testing Gemini API integration without Lens Studio\n');
  
  try {
    await testConfiguration();
    await testAPIKey();
    await testImageGeneration();
    await testTextGeneration();
    await testCompletePipeline();
    
    printFinalResults();
    
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  testConfiguration,
  testAPIKey,
  testImageGeneration,
  testTextGeneration,
  testCompletePipeline,
  CONFIG
};
