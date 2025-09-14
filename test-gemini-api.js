#!/usr/bin/env node

/**
 * Quick Gemini API Test
 * Simple test to verify your API key works
 */

const axios = require('axios');

const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM',
  GEMINI_TEXT_MODEL: 'gemini-1.5-flash',
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta'
};

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...\n');
  
  try {
    const url = `${CONFIG.GEMINI_API_BASE_URL}/models/${CONFIG.GEMINI_TEXT_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const request = {
      contents: [{
        parts: [{ text: "Say hello and confirm the API is working" }],
        role: "user"
      }],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.1
      }
    };
    
    console.log('Making request to Gemini API...');
    const response = await axios.post(url, request, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.status === 200) {
      const text = response.data.candidates[0].content.parts[0].text;
      console.log('✅ API Test SUCCESS!');
      console.log(`Response: "${text}"`);
    } else {
      console.log('❌ API Test FAILED');
      console.log(`Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ API Test FAILED');
    if (error.response) {
      console.log(`Error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

testGeminiAPI();
