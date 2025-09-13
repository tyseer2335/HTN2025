# Memory Orbs - Spectacles AR Integration

Transform your everyday memories into an immersive 3D gallery experience using Snap Spectacles! This project brings your story-based memories into AR space as floating, glowing orbs that you can explore and interact with.

## 🌟 Features

### Core Functionality
- **3D Memory Gallery**: Float through a space filled with glowing memory orbs
- **Interactive Orbs**: Tap orbs to open and explore your memories
- **Storyboard Viewer**: Experience memories as comic-style panels with captions
- **Voice Narration**: Listen to your memories with VAPI-powered audio
- **Voice Commands**: Control the gallery hands-free with speech recognition
- **Real-time Sync**: Automatically sync new memories from your web app

### Technical Features
- **Spatial Audio Integration**: Immersive audio experience
- **Smooth Animations**: Floating orbs with ambient lighting effects
- **Performance Optimized**: Handles 20+ memory orbs at 60fps
- **Cross-Platform Sync**: Seamless integration with web app backend
- **3D Object Integration**: Snap3D generated objects as special memories

## 🏗️ Architecture

### Components Overview

```
MemoryOrbGallery (Main Controller)
├── MemoryOrb (Individual Orb Logic)
├── StoryboardViewer (Memory Display)
├── MemoryGalleryIntegration (Backend Sync)
└── Existing Snap3D Integration
    ├── Snap3DInteractableFactory
    └── ASRQueryController
```

### File Structure
```
Spectacles/Project/Assets/Scripts/
├── MemoryOrbGallery.ts          # Main gallery controller
├── MemoryOrb.ts                 # Individual orb behavior
├── StoryboardViewer.ts          # Memory viewing interface
├── MemoryGalleryIntegration.ts  # Backend/web app integration
├── Snap3DInteractableFactory.ts # Existing 3D object creation
├── ASRQueryController.ts        # Voice command handling
└── [Other existing scripts...]
```

## 🚀 Quick Start

### Prerequisites
- Snap Spectacles with Developer Mode enabled
- Lens Studio 5.0+
- Your web app backend running
- SpectaclesInteractionKit package imported

### Setup Steps

1. **Clone and Configure**
   ```bash
   git checkout experimental-night
   cd Spectacles/Project
   ```

2. **Open in Lens Studio**
   - Open `Project.esproj` in Lens Studio
   - Import required packages if not already present

3. **Scene Setup**
   - Add `MemoryOrbGallery` component to your scene
   - Configure the orb prefab with proper materials
   - Set up the storyboard viewer interface

4. **Backend Integration**
   - Update `backendUrl` in `MemoryGalleryIntegration.ts`
   - Configure authentication tokens
   - Test API connectivity

5. **Deploy to Spectacles**
   - Connect Spectacles via USB-C
   - Use "Push to Device" in Lens Studio
   - Test the experience!

## 💡 Usage

### Voice Commands
- **"Show memories"** - Opens the memory gallery
- **"Hide memories"** - Closes the gallery
- **"Sync memories"** - Syncs with backend for new memories
- **"Create memory about [description]"** - Initiates memory creation

### Interactions
- **Approach an orb** - Orb highlights and scales up
- **Tap an orb** - Opens the memory storyboard
- **Navigate storyboard** - Use Previous/Next buttons
- **Audio narration** - Tap audio button for VAPI speech
- **Close storyboard** - Return to gallery view

### Web App Integration
1. Upload photos and description in your web app
2. Generate storyboard using Cohere API
3. Memory automatically appears as new orb in Spectacles gallery
4. Orb color reflects the chosen theme (watercolor, sketch, comic, etc.)

## 🔧 Configuration

### MemoryOrbGallery Settings
```typescript
galleryRadius: 150        // Distance of orbs from center (cm)
heightVariation: 50       // Random height spread (cm)
maxOrbs: 20              // Maximum orbs for performance
floatSpeed: 1.0          // Animation speed multiplier
```

### Performance Optimization
- **Recommended max orbs**: 15-20 for 60fps
- **Gallery radius**: 120-150cm for comfortable viewing
- **Materials**: Use unlit shaders where possible
- **Texture sizes**: Keep under 512x512 for orb thumbnails

## 🎨 Customization

### Orb Themes & Colors
Memory orbs automatically color themselves based on the memory theme:
- **Watercolor**: Light blue glow
- **Sketch**: Gray tones
- **Comic**: Orange highlights
- **Vintage**: Sepia warmth
- **Default**: Soft green

### Custom Materials
Create custom materials in Lens Studio for:
- Orb glow effects
- Storyboard panel frames
- UI button styles
- Loading animations

## 🔗 Backend Integration

### API Endpoints Expected
```typescript
GET /api/memories          // Fetch user memories
POST /api/memories         // Create new memory
GET /api/memories/:id      // Get specific memory
PUT /api/memories/:id      // Update memory
```

### Memory Data Format
```typescript
interface MemoryData {
  id: string
  title: string
  description: string
  theme: "watercolor" | "sketch" | "comic" | "vintage"
  storyboard: {
    panels: Array<{
      imageUrl: string
      caption: string
      audioUrl: string
    }>
  }
  createdAt: Date
  thumbnailUrl: string
}
```

## 🏆 Prize Targets

This implementation specifically targets:

### 🥇 **Snap: Spectacles AR Hackathon: Game On!** (Priority)
- Immersive AR gallery experience
- Innovative memory interaction
- Spatial computing showcase

### 🥈 **Windsurf: Best Project built with Windsurf** (Priority)
- Full-stack integration
- Seamless development experience

### 🥉 **Cohere: Best Use of Cohere API**
- Story generation integration
- Enhanced narrative experience

### Additional Targets
- **MLH: Best Use of MongoDB Atlas** - Memory storage
- **VAPI: Best Voice AI Application** - Audio narration
- **MLH: Best Use of Auth0** - Authentication integration

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test Commands
```bash
# Test voice commands
"Show memories"
"Sync memories"
"Create memory about my beach trip"

# Test interactions
# Approach orb → Should highlight
# Tap orb → Should open storyboard
# Navigate → Previous/Next buttons work
# Audio → VAPI narration plays
```

## 🐛 Troubleshooting

### Common Issues
- **Orbs not appearing**: Check prefab references and positioning
- **Voice commands not working**: Verify ASR permissions
- **Backend sync failing**: Check internet and API endpoints
- **Performance issues**: Reduce orb count or optimize materials

### Debug Tools
- Use Lens Studio console for script logs
- Monitor frame rate with built-in profiler
- Check memory usage in device tools

## 🚧 Future Enhancements

### Planned Features
- **Collaborative memories**: Share orbs with friends
- **AR anchoring**: Place orbs in specific real-world locations
- **Advanced animations**: More sophisticated orb behaviors
- **Gesture controls**: Hand tracking for interaction
- **Social features**: Like/comment on memories

### Technical Improvements
- **Texture streaming**: Dynamic loading for large galleries
- **Cloud rendering**: Offload processing for complex scenes
- **ML categorization**: Automatic memory organization
- **Offline mode**: Local storage for memories

## 🤝 Contributing

This project is part of Hack the North 2025. For team members:

1. **Create feature branches** from `experimental-night`
2. **Test thoroughly** on actual Spectacles hardware
3. **Document changes** in component headers
4. **Optimize for performance** - maintain 60fps target

## 📄 License

Built for Hack the North 2025. See project root for license details.

## 🔗 Related Resources

- [Web App Backend](../web-app/) - Node.js + MongoDB Atlas
- [Frontend Interface](../web-app/frontend/) - React + Vite
- [Spatial Image Gallery Sample](https://github.com/Snapchat/Spectacles-Sample/tree/main/Spatial%20Image%20Gallery)
- [Lens Studio Documentation](https://docs.snap.com/lens-studio)

---

*Transform your memories into an explorable AR universe with Snap Spectacles! 🥽✨*