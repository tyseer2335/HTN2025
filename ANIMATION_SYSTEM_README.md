# SpectraSphere Animation System
## In-House Animation Pipeline for Snap Spectacles

This document explains the complete animation system that transforms static Gemini-generated images into dynamic, interactive AR experiences on Snap Spectacles.

---

## 🎯 **System Overview**

The animation system consists of four main components that work together to create immersive storytelling experiences:

1. **PanelLoader** - Manages image/video loading and panel navigation
2. **HandControls** - Handles gesture recognition and user interaction
3. **ParallaxMaterial** - Provides Ken Burns and depth-based parallax effects
4. **AnimationSystem** - Coordinates all components and manages the complete pipeline

---

## 🏗️ **Architecture**

### **Data Flow:**
```
Story JSON → PanelLoader → ParallaxMaterial → Spectacles Display
     ↓
HandControls → Gesture Recognition → Animation Control
```

### **Component Dependencies:**
- **AnimationSystem** depends on all other components
- **PanelLoader** handles RSG asset loading
- **HandControls** provides gesture input
- **ParallaxMaterial** renders visual effects

---

## 📁 **File Structure**

```
Assets/Scripts/
├── PanelLoader.ts              # Core panel management
├── HandControls.ts             # Gesture recognition
├── ParallaxMaterial.ts         # Visual effects controller
├── AnimationSystem.ts          # Main coordination system
└── AnimationExample.ts         # Demo and testing

Assets/Shaders/
└── ParallaxShader.ss_graph     # Custom shader for effects
```

---

## 🚀 **Quick Start**

### **1. Basic Setup**
```typescript
// Create the main animation system
const animationSystem = new AnimationSystem();

// Configure the system
animationSystem.configureSystem({
  enableAutoAdvance: true,
  autoAdvanceDelay: 5.0,
  enableLooping: true,
  enableSmoothTransitions: true,
  transitionDuration: 1.0
});
```

### **2. Load Story Data**
```typescript
// Load from RSG endpoint
await panelLoader.loadStoryFromRSG("https://your-api.com/story.json");

// Or use sample data
panelLoader.showPanel(0);
```

### **3. Enable Gesture Controls**
```typescript
// Configure hand controls
handControls.setPinchEnabled(true);      // Play/pause
handControls.setSwipeEnabled(true);      // Navigate
handControls.setAirTapEnabled(true);     // Next panel
handControls.setGazeFallbackEnabled(true); // Fallback
```

---

## 🎨 **Animation Types**

### **1. Ken Burns Effect**
- **Purpose:** Classic pan and zoom animation
- **Use Case:** Static images, portraits, landscapes
- **Configuration:**
  ```typescript
  parallaxMaterial.applyKenBurnsAnimation({
    startScale: 1.0,
    endScale: 1.12,
    panX: 0.02,
    panY: 0.01,
    duration: 4.0
  });
  ```

### **2. Depth Parallax**
- **Purpose:** 3D-like depth effect using depth maps
- **Use Case:** Images with clear foreground/background separation
- **Configuration:**
  ```typescript
  parallaxMaterial.setDepthScale(0.03);
  parallaxMaterial.setParallaxStrength(1.2);
  parallaxMaterial.setDepthParallaxEnabled(true);
  ```

### **3. Video Animation**
- **Purpose:** Play video loops for dynamic content
- **Use Case:** Action scenes, moving elements
- **Configuration:** Automatically handled by PanelLoader

---

## 🎮 **Gesture Controls**

### **Supported Gestures:**
- **Pinch:** Toggle animation play/pause
- **Swipe Left/Right:** Navigate between panels
- **Air Tap:** Advance to next panel
- **Gaze Dwell:** Fallback navigation (2-second dwell)

### **Configuration:**
```typescript
// Adjust sensitivity
handControls.setSwipeThreshold(0.6);
handControls.setPinchThreshold(0.8);
handControls.setAirTapThreshold(0.7);

// Enable/disable specific gestures
handControls.setPinchEnabled(true);
handControls.setSwipeEnabled(true);
handControls.setAirTapEnabled(true);
```

---

## 📊 **Data Format**

### **Story JSON Structure:**
```json
{
  "iconCategory": "torii gate",
  "panels": [
    {
      "title": "Lost in Shibuya",
      "description": "The neon lights of Tokyo's busiest intersection",
      "imageUrl": "https://cdn.example.com/shibuya_1.png",
      "depthUrl": "https://cdn.example.com/shibuya_1_d.png",
      "maskUrl": "https://cdn.example.com/shibuya_1_fg.png",
      "anim": {
        "type": "parallax",
        "zoom": 1.08,
        "pan": [0.0, 0.03],
        "duration": 4.5
      }
    },
    {
      "title": "Bullet Train to Kyoto",
      "description": "High-speed journey through the Japanese countryside",
      "videoUrl": "https://cdn.example.com/kyoto_2_loop.mp4",
      "anim": {
        "type": "video",
        "duration": 5.0
      }
    }
  ]
}
```

### **Animation Configuration:**
- **type:** "kenburns", "parallax", or "video"
- **zoom:** Zoom level (1.0 = no zoom, >1.0 = zoom in)
- **pan:** [x, y] pan offset in UV coordinates
- **duration:** Animation duration in seconds
- **depthScale:** Parallax strength (0.01-0.05)
- **strength:** Overall parallax multiplier

---

## ⚡ **Performance Optimization**

### **Target Specifications:**
- **FPS:** 30-60 FPS on Spectacles
- **Texture Size:** ≤2048x1024 for ScreenImage
- **Depth Map:** 1024x512 for parallax
- **Animation Duration:** ≤6 seconds per panel

### **Optimization Features:**
- **Performance Mode:** Automatic FPS monitoring
- **Texture Compression:** ETC2/ASTC support
- **Memory Management:** Automatic cleanup of previous panels
- **LOD System:** Reduced quality for distant objects

### **Configuration:**
```typescript
// Enable performance monitoring
animationSystem.configureSystem({
  enablePerformanceMode: true,
  targetFPS: 30
});

// Optimize parallax material
parallaxMaterial.setAnimationSpeed(0.5); // Slower = better performance
```

---

## 🔧 **Integration with SpectraSphere**

### **1. Web App Integration:**
```typescript
// Send story data from web app
const storyData = {
  panels: generatedImages.map(img => ({
    title: img.prompt,
    imageUrl: img.url,
    anim: { type: "kenburns", duration: 5.0 }
  }))
};

// Send to Spectacles via RSG
await sendToSpectacles(storyData);
```

### **2. Gemini API Integration:**
```typescript
// Generate depth maps server-side
const depthMap = await generateDepthMap(imageUrl);
const maskMap = await generateSegmentationMask(imageUrl);

// Add to story data
panel.depthUrl = depthMap.url;
panel.maskUrl = maskMap.url;
```

### **3. Snapchat Memories Integration:**
```typescript
// Pull from Snapchat Memories
const memories = await getSnapchatMemories();
const storyData = memories.map(memory => ({
  title: memory.caption,
  imageUrl: memory.imageUrl,
  anim: { type: "parallax", duration: 4.0 }
}));
```

---

## 🧪 **Testing and Debugging**

### **Demo Mode:**
```typescript
// Run complete demo
animationExample.runDemo();

// Test specific animation types
animationExample.testAnimationType("kenburns");
animationExample.testAnimationType("parallax");
animationExample.testAnimationType("gestures");
```

### **Debug Information:**
```typescript
// Get system status
const status = animationSystem.getSystemStatus();
console.log("System Ready:", status.isReady);
console.log("Current Animation:", status.currentAnimationType);
console.log("Is Animating:", status.isAnimating);

// Get demo status
const demoStatus = animationExample.getDemoStatus();
console.log("Demo Running:", demoStatus.isRunning);
console.log("Elapsed Time:", demoStatus.elapsedTime);
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Low FPS Performance:**
   - Reduce texture sizes
   - Disable depth parallax
   - Lower animation speed

2. **Gesture Recognition Issues:**
   - Check hand tracking permissions
   - Adjust gesture thresholds
   - Enable gaze fallback

3. **Asset Loading Failures:**
   - Verify RSG configuration
   - Check network connectivity
   - Validate image URLs

4. **Animation Stuttering:**
   - Enable performance mode
   - Reduce concurrent animations
   - Check memory usage

### **Debug Commands:**
```typescript
// Force gesture trigger (for testing)
handControls.triggerGesture("pinch");
handControls.triggerGesture("swipe", "right");

// Reset system
animationSystem.resetToDefault();
parallaxMaterial.resetToDefault();
```

---

## 🔮 **Future Enhancements**

### **Planned Features:**
- **AI-Generated Video:** Integration with VO3 for dynamic content
- **Multi-User Support:** Shared AR experiences
- **Advanced Gestures:** More complex hand interactions
- **Real-Time Effects:** Live style switching
- **Performance Analytics:** Detailed performance monitoring

### **Technical Roadmap:**
- **Q1 2025:** VO3 video integration
- **Q2 2025:** Multi-user AR spaces
- **Q3 2025:** Advanced gesture recognition
- **Q4 2025:** Real-time collaboration

---

## 📚 **API Reference**

### **PanelLoader Methods:**
- `loadStoryFromRSG(url: string)` - Load story from RSG endpoint
- `showPanel(index: number)` - Display specific panel
- `nextPanel()` - Navigate to next panel
- `prevPanel()` - Navigate to previous panel
- `toggleAnimation()` - Play/pause animation

### **HandControls Methods:**
- `setPinchEnabled(enabled: boolean)` - Enable/disable pinch
- `setSwipeEnabled(enabled: boolean)` - Enable/disable swipe
- `setAirTapEnabled(enabled: boolean)` - Enable/disable air tap
- `triggerGesture(type: string, direction?: string)` - Force gesture

### **ParallaxMaterial Methods:**
- `applyKenBurnsAnimation(config)` - Apply Ken Burns effect
- `setDepthScale(scale: number)` - Set parallax strength
- `setAnimationSpeed(speed: number)` - Set animation speed
- `startAnimation()` - Start animation
- `stopAnimation()` - Stop animation

### **AnimationSystem Methods:**
- `configureSystem(config)` - Configure system settings
- `nextPanel()` - Navigate to next panel
- `previousPanel()` - Navigate to previous panel
- `toggleAnimation()` - Toggle play/pause
- `getSystemStatus()` - Get current status

---

## 🎯 **Best Practices**

1. **Start Simple:** Begin with Ken Burns, add parallax later
2. **Test Performance:** Always test on actual Spectacles hardware
3. **Optimize Early:** Set performance targets from the start
4. **Handle Errors:** Implement proper error handling and fallbacks
5. **User Experience:** Focus on smooth, intuitive interactions
6. **Memory Management:** Clean up resources when switching panels

---

This animation system provides a complete solution for transforming static images into dynamic, interactive AR experiences on Snap Spectacles. It's designed to be performant, user-friendly, and easily extensible for future enhancements.
