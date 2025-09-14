# 🚀 Quick Commands for Local Testing

## **Run These Commands in Your Terminal**

### **📍 Navigate to Project Directory:**
```bash
cd /Users/Ani/dev/htn/HTN2025
```

### **🔧 Setup (One-time):**
```bash
npm install
```

### **🧪 Run All Tests:**
```bash
npm test
```

### **⚡ Quick API Test:**
```bash
node test-gemini-api.js
```

### **🖼️ Test Image Generation:**
```bash
node test-image-generation.js
```

### **🎬 Test Complete Pipeline:**
```bash
node test-complete-pipeline.js
```

### **🔍 Check Available Models:**
```bash
node test-models.js
```

---

## **📊 What Each Command Does**

| Command | Purpose | Time | Output |
|---------|---------|------|--------|
| `npm test` | Complete test suite | ~30s | All tests + generated files |
| `node test-gemini-api.js` | Quick API test | ~5s | API working confirmation |
| `node test-image-generation.js` | Image generation only | ~15s | 3 sample images |
| `node test-complete-pipeline.js` | Full pipeline test | ~20s | Story + image + animation data |
| `node test-models.js` | Check available models | ~10s | List of all Gemini models |

---

## **✅ Expected Results**

### **All Tests Pass:**
```
🎉 ALL TESTS PASSED! Your setup is ready for Snap Spectacles!
```

### **Generated Files:**
- `generated-image-1.jpg` - Sample image 1
- `generated-image-2.jpg` - Sample image 2  
- `generated-image-3.jpg` - Sample image 3
- `pipeline-story-image.jpg` - Story illustration
- `complete-story.json` - Complete story data
- `animation-test-data.json` - Animation test data

---

## **🚨 If Something Goes Wrong**

### **API Key Issues:**
```bash
# Check your API key in test-local.js line 14
# Make sure it's: AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM
```

### **Network Issues:**
```bash
# Check internet connection
# Try again (API might be slow)
```

### **Permission Issues:**
```bash
chmod 755 /Users/Ani/dev/htn/HTN2025
```

---

## **🎯 Success Indicators**

- ✅ **API Key Working**: "API key is valid and working"
- ✅ **Image Generation**: Images saved successfully
- ✅ **Text Generation**: Story text generated
- ✅ **Complete Pipeline**: All components working together
- ✅ **100% Success Rate**: Ready for Snap Spectacles!

---

## **📱 Next Steps After Testing**

Once all tests pass:

1. **Your API integration works!** ✅
2. **You can deploy to Lens Studio** ✅
3. **All data formats are compatible** ✅
4. **Animation pipeline is ready** ✅

### **Deploy to Lens Studio:**
1. Open Lens Studio
2. Add your scripts to SceneObjects
3. Use the generated JSON data
4. Test on Snap Spectacles

---

## **🔧 Configuration**

### **Change API Key:**
Edit `test-local.js` line 14:
```javascript
GEMINI_API_KEY: 'YOUR_NEW_API_KEY_HERE',
```

### **Change Test Prompts:**
Edit `test-local.js` line 18:
```javascript
DEFAULT_TEST_PROMPT: 'Your custom prompt here',
```

### **Modify Image Settings:**
Edit `test-local.js` line 19-20:
```javascript
DEFAULT_IMAGE_SIZE: '1024x1024',  // or '512x512', '2048x2048'
NUMBER_OF_TEST_IMAGES: 3,         // or 1, 5, etc.
```

---

## **🎉 You're Ready!**

Your SpectraSphere setup is fully tested and working! All components are verified and ready for Snap Spectacles deployment.
