# 🔧 Environment Setup Guide
## Setting Up Gemini API Key and Configuration for SpectraSphere

This guide shows you exactly how to set up your environment configuration for the Gemini API key and all other settings.

---

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Your API Key is Already Set!**
Your Gemini API key `AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM` is already configured in the `Config.ts` file.

### **Step 2: Verify Configuration**
1. **Open Lens Studio**
2. **Add the Config.ts script** to a SceneObject
3. **Check the Inspector** - you should see your API key is set
4. **Click "Print Configuration Status"** to verify everything

### **Step 3: Test the API**
1. **Add RealGeminiIntegration.ts** to a SceneObject
2. **Click "Test Image Generation"** to test your API key
3. **Check the console** for success messages

---

## 📁 **File Structure**

```
HTN2025/
├── Spectacles/Project/Assets/Scripts/
│   ├── Config.ts                    # ✅ Main configuration file
│   ├── RealGeminiIntegration.ts     # ✅ Real API integration
│   ├── GeminiAPITester.ts          # ✅ API testing
│   ├── CompletePipelineTest.ts     # ✅ Complete testing
│   └── ... (other animation scripts)
└── ENVIRONMENT_SETUP_GUIDE.md      # ✅ This guide
```

---

## 🔑 **API Key Configuration**

### **Your API Key is Already Set:**
```typescript
// In Config.ts - Line 15
public static readonly GEMINI_API_KEY = "AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM";
```

### **How to Change It (if needed):**
1. **Open `Config.ts`** in Lens Studio
2. **Find line 15** with `GEMINI_API_KEY`
3. **Replace with your new key**
4. **Save the file**

---

## ⚙️ **Configuration Options**

### **API Settings:**
```typescript
// Gemini API Configuration
GEMINI_API_KEY = "AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM"
GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image-generation"
GEMINI_TEXT_MODEL = "gemini-2.0-flash-preview"
YOUR_API_ENDPOINT = "https://your-api.com/api"
ENABLE_REAL_API_CALLS = true
```

### **Test Settings:**
```typescript
// Test Configuration
DEFAULT_TEST_PROMPT = "A magical forest with glowing trees and floating islands"
DEFAULT_IMAGE_SIZE = "1024x1024"
NUMBER_OF_TEST_IMAGES = 3
ENABLE_DEBUG_MODE = true
```

### **Animation Settings:**
```typescript
// Animation Configuration
DEFAULT_ANIMATION_DURATION = 4.0
DEFAULT_ZOOM_LEVEL = 1.08
DEFAULT_PAN_X = 0.0
DEFAULT_PAN_Y = 0.02
DEFAULT_DEPTH_SCALE = 0.02
```

---

## 🧪 **Testing Your Setup**

### **1. Basic API Test:**
```typescript
// In Lens Studio, add RealGeminiIntegration.ts to a SceneObject
// Click "Test Image Generation" button
// You should see:
// ✅ Image generation successful!
// Generated image: data:image/jpeg;base64,/9j/4AAQ...
```

### **2. Complete Pipeline Test:**
```typescript
// Add CompletePipelineTest.ts to a SceneObject
// Click "Run Full Integration Test" button
// You should see:
// 🎉 Pipeline test SUCCESSFUL! Ready for Snap Spectacles deployment.
```

### **3. Configuration Validation:**
```typescript
// Add Config.ts to a SceneObject
// Click "Print Configuration Status" button
// You should see:
// === SPECTRASPHERE CONFIGURATION STATUS ===
// Gemini API Key: ✅ Set
// Real API Calls: ✅ Enabled
// Configuration is valid
```

---

## 🔒 **Security Best Practices**

### **For Development:**
- ✅ **API key is in code** - OK for development
- ✅ **Real API calls enabled** - Good for testing
- ✅ **Debug mode enabled** - Helpful for development

### **For Production:**
- ⚠️ **Move API key to environment variables** (if possible)
- ⚠️ **Use server-side proxy** for API calls
- ⚠️ **Disable debug mode** in production
- ⚠️ **Add rate limiting** and error handling

---

## 🚨 **Troubleshooting**

### **Issue 1: API Key Not Working**
```
❌ Gemini API call failed: 401 Unauthorized
```
**Solution:**
1. Check if your API key is correct
2. Verify the key has proper permissions
3. Check if you have billing enabled on Google Cloud

### **Issue 2: API Calls Not Making Real Requests**
```
⚠️ Using simulated API response
```
**Solution:**
1. Set `enableRealAPICalls = true` in Config.ts
2. Verify your API key is set
3. Check network connectivity

### **Issue 3: Configuration Not Loading**
```
❌ Configuration has errors
```
**Solution:**
1. Check the Config.ts file syntax
2. Verify all required fields are set
3. Run configuration validation

---

## 📊 **Environment Variables (Advanced)**

### **If you want to use environment variables:**

1. **Create a `.env` file** in your project root:
```bash
# .env file
GEMINI_API_KEY=AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM
YOUR_API_ENDPOINT=https://your-api.com/api
ENABLE_REAL_API_CALLS=true
```

2. **Update Config.ts** to read from environment:
```typescript
// This would require additional setup in Lens Studio
private static getEnvVar(key: string, defaultValue: string): string {
  // Implementation would depend on Lens Studio's environment variable support
  return defaultValue;
}
```

---

## 🎯 **Quick Verification Checklist**

Before testing, ensure:

- [ ] **API Key is set** in Config.ts
- [ ] **Real API calls enabled** (`ENABLE_REAL_API_CALLS = true`)
- [ ] **Debug mode enabled** for detailed logging
- [ ] **All scripts imported** in Lens Studio
- [ ] **SceneObjects created** for each script
- [ ] **Component references assigned** in Inspector

---

## 🚀 **Ready to Test!**

Once you've completed the setup:

1. **Open Lens Studio**
2. **Add the scripts** to SceneObjects
3. **Click "Test Real Gemini API"**
4. **Watch the console** for success messages
5. **If successful, click "Run Full Integration Test"**

You should see:
```
🎉 Pipeline test SUCCESSFUL! Ready for Snap Spectacles deployment.
```

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Verify your API key** has proper permissions
3. **Test with a simple prompt** first
4. **Check network connectivity**
5. **Review the configuration status**

Your setup should work immediately since the API key is already configured! 🎉
