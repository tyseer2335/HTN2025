# 🧪 Local Testing Guide
## Test Your SpectraSphere Setup Without Lens Studio

This guide shows you how to test your Gemini API integration and complete pipeline locally from your terminal, without needing Lens Studio or Snap Spectacles.

---

## 🚀 **Quick Start (2 minutes)**

### **Step 1: Install Dependencies**
```bash
cd /Users/Ani/dev/htn/HTN2025
npm install
```

### **Step 2: Run All Tests**
```bash
npm test
```

### **Step 3: Check Results**
You should see:
```
🎉 ALL TESTS PASSED! Your setup is ready for Snap Spectacles!
```

---

## 📋 **Available Commands**

### **Complete Test Suite:**
```bash
npm test                    # Run all tests
npm run test-api           # Test API key only
npm run test-image         # Test image generation only
npm run test-pipeline      # Test complete pipeline
npm run setup             # Install deps + run tests
```

### **Individual Test Files:**
```bash
node test-local.js         # Complete test suite
node test-gemini-api.js    # Quick API test
node test-image-generation.js  # Image generation test
node test-complete-pipeline.js # Full pipeline test
```

---

## 🔧 **What Each Test Does**

### **1. Configuration Test (`test-local.js`)**
- ✅ Validates your API key format
- ✅ Checks all required configuration values
- ✅ Verifies API endpoints are correct

### **2. API Key Test (`test-gemini-api.js`)**
- ✅ Makes a real API call to Google Gemini
- ✅ Verifies your API key works
- ✅ Tests basic text generation

### **3. Image Generation Test (`test-image-generation.js`)**
- ✅ Tests Gemini image generation
- ✅ Generates 3 sample images
- ✅ Saves images to your local directory

### **4. Complete Pipeline Test (`test-complete-pipeline.js`)**
- ✅ Generates a complete story
- ✅ Creates story illustration
- ✅ Generates animation parameters
- ✅ Creates Lens Studio compatible data

---

## 📁 **Generated Files**

After running tests, you'll find these files in your project directory:

```
HTN2025/
├── generated-image-1.jpg          # Sample image 1
├── generated-image-2.jpg          # Sample image 2
├── generated-image-3.jpg          # Sample image 3
├── pipeline-story-image.jpg       # Story illustration
├── complete-story.json            # Complete story data
├── animation-test-data.json       # Animation test data
└── generated-story.json           # Generated story
```

---

## 🎯 **Expected Results**

### **Successful Test Output:**
```
🚀 SpectraSphere Local Testing Suite
Testing Gemini API integration without Lens Studio

==================================================
🧪 Configuration Test
==================================================
✅ Configuration: PASS - All configuration values are valid
ℹ️ [timestamp] Configuration Summary:
  API Key: AIzaSyBJ34...
  Image Model: gemini-2.5-flash-image-generation
  Text Model: gemini-2.0-flash-preview
  Base URL: https://generativelanguage.googleapis.com/v1beta
  Test Prompt: A magical forest with glowing trees and floating islands

==================================================
🧪 API Key Test
==================================================
✅ API Key: PASS - API key is valid and working

==================================================
🧪 Image Generation Test
==================================================
✅ Image Generation: PASS - Image generated successfully and saved to generated-image-1.jpg

==================================================
🧪 Text Generation Test
==================================================
✅ Text Generation: PASS - Text generated successfully

==================================================
🧪 Complete Pipeline Test
==================================================
✅ Complete Pipeline: PASS - Complete pipeline test successful

==================================================
📊 SUMMARY
==================================================
Total Tests: 5
Passed: 5
Failed: 0
Success Rate: 100.0%

🎉 ALL TESTS PASSED! Your setup is ready for Snap Spectacles!

📁 Generated Files:
  - generated-image-1.jpg
  - generated-image-2.jpg
  - generated-image-3.jpg
  - pipeline-story-image.jpg
  - complete-story.json
  - animation-test-data.json
```

---

## 🚨 **Troubleshooting**

### **Issue 1: API Key Not Working**
```
❌ API Key: FAIL - API request failed: 401 - API key not valid
```
**Solution:**
1. Check your API key in `test-local.js` (line 15)
2. Verify the key has proper permissions
3. Check if billing is enabled on Google Cloud

### **Issue 2: Network Timeout**
```
❌ Image Generation: FAIL - timeout of 30000ms exceeded
```
**Solution:**
1. Check your internet connection
2. Try again (API might be slow)
3. Increase timeout in the test files

### **Issue 3: Module Not Found**
```
Error: Cannot find module 'axios'
```
**Solution:**
```bash
npm install
```

### **Issue 4: Permission Denied**
```
Error: EACCES: permission denied, open 'generated-image-1.jpg'
```
**Solution:**
```bash
chmod 755 /Users/Ani/dev/htn/HTN2025
```

---

## 🔧 **Configuration**

### **Update API Key:**
Edit `test-local.js` line 15:
```javascript
const CONFIG = {
  GEMINI_API_KEY: 'YOUR_NEW_API_KEY_HERE',
  // ... rest of config
};
```

### **Change Test Prompts:**
Edit `test-local.js` line 20:
```javascript
DEFAULT_TEST_PROMPT: 'Your custom prompt here',
```

### **Modify Image Settings:**
Edit `test-local.js` line 21:
```javascript
DEFAULT_IMAGE_SIZE: '1024x1024',  // or '512x512', '2048x2048'
NUMBER_OF_TEST_IMAGES: 3,         // or 1, 5, etc.
```

---

## 📊 **Test Results Interpretation**

### **100% Success Rate:**
- ✅ All systems working perfectly
- ✅ Ready for Snap Spectacles deployment
- ✅ No issues found

### **66-99% Success Rate:**
- ⚠️ Most systems working
- ⚠️ Some minor issues to fix
- ⚠️ Check failed tests for details

### **0-65% Success Rate:**
- ❌ Multiple systems failing
- ❌ Check API key and configuration
- ❌ Review error messages

---

## 🎉 **Next Steps After Testing**

Once all tests pass:

1. **Your API integration is working!** ✅
2. **You can deploy to Snap Spectacles** ✅
3. **All data formats are compatible** ✅
4. **Animation pipeline is ready** ✅

### **Deploy to Lens Studio:**
1. Open Lens Studio
2. Add your scripts to SceneObjects
3. Use the generated JSON data
4. Test on Snap Spectacles

---

## 🔍 **Debug Mode**

For detailed debugging, edit `test-local.js`:
```javascript
const CONFIG = {
  // ... other config
  ENABLE_DEBUG_MODE: true  // Set to true for verbose logging
};
```

This will show:
- Detailed API requests/responses
- Step-by-step pipeline execution
- File creation details
- Error stack traces

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check the console output** for specific error messages
2. **Verify your API key** has proper permissions
3. **Test with a simple prompt** first
4. **Check network connectivity**
5. **Review the generated files** for data quality

Your setup should work immediately since the API key is already configured! 🎉
