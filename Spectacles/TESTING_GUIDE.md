# Spectacles Memory Gallery Testing Guide

## Overview
This guide will help you test the Memory Gallery system on Snap Spectacles using Lens Studio.

## Prerequisites

### Hardware Requirements
- Snap Spectacles (AR glasses)
- Computer with Lens Studio installed
- USB-C cable for Spectacles connection
- Stable internet connection for backend sync

### Software Requirements
- **Lens Studio 5.0+** (latest version recommended)
- **Spectacles Developer Tools**
- Your backend server running (web-app)

## Setup Steps

### 1. Lens Studio Project Setup

1. **Open your project in Lens Studio:**
   ```bash
   # Open the project file
   open "Spectacles/Project/Project.esproj"
   ```

2. **Import Required Packages:**
   - Ensure `SpectaclesInteractionKit.lspkg` is imported
   - Ensure `Remote Service Gateway.lspkg` is imported for Snap3D functionality
   - Check `LSTween.lspkg` for animations

3. **Scene Setup:**
   - Add `MemoryOrbGallery` component to your main scene
   - Set up the `StoryboardViewer` prefab
   - Configure `MemoryOrb` prefabs with proper materials

### 2. Component Configuration

#### MemoryOrbGallery Setup:
```typescript
// In your scene hierarchy:
// - Create empty SceneObject named "MemoryGallery"
// - Add MemoryOrbGallery component
// - Set orbPrefab to your MemoryOrb prefab
// - Set storyboardViewer reference
// - Configure galleryRadius (150 cm recommended)
// - Set maxOrbs (20 recommended for performance)
```

#### MemoryOrb Prefab Setup:
```typescript
// Create prefab with:
// - Sphere mesh with glow material
// - MemoryOrb script component
// - Interaction components for tap/hover
// - Optional thumbnail image component
// - Title text component
```

#### StoryboardViewer Setup:
```typescript
// Configure with:
// - ContainerFrame for panels
// - Image component for storyboard panels
// - Text component for captions
// - Navigation buttons (Previous/Next/Close)
// - Audio button for VAPI integration
```

### 3. Testing on Device

#### Connection Setup:
1. **Connect Spectacles to computer via USB-C**
2. **Enable Developer Mode on Spectacles:**
   - Settings > Developer > Enable Developer Mode
   - Allow computer connection

3. **In Lens Studio:**
   - Click "Push to Device" button
   - Select your connected Spectacles
   - Wait for build and deployment

#### Testing Scenarios:

##### Basic Gallery Testing:
1. **Launch the lens on Spectacles**
2. **Voice Commands (if enabled):**
   - Say "show memories" to open gallery
   - Say "hide memories" to close gallery
   - Say "sync memories" to refresh from backend

3. **Visual Verification:**
   - Orbs should appear in a circle around you
   - Orbs should glow and float gently
   - Each orb should display different colors based on theme

##### Interaction Testing:
1. **Tap an orb:**
   - Should highlight when approached
   - Should open storyboard viewer when tapped
   - Gallery should hide while viewing memory

2. **Storyboard Navigation:**
   - Previous/Next buttons should work
   - Captions should display correctly
   - Close button should return to gallery

3. **Audio Testing:**
   - Audio button should trigger VAPI narration
   - Visual feedback during audio playback

##### Performance Testing:
1. **Memory Usage:**
   - Monitor with Lens Studio profiler
   - Watch for memory leaks with multiple orbs

2. **Frame Rate:**
   - Should maintain 60fps with 20 orbs
   - No stuttering during animations

3. **Battery Usage:**
   - Extended testing sessions
   - Monitor Spectacles temperature

### 4. Backend Integration Testing

#### API Connectivity:
1. **Update backend URL in MemoryGalleryIntegration:**
   ```typescript
   // Set your actual backend URL
   backendUrl: "https://your-backend-url.com"
   ```

2. **Test Memory Sync:**
   - Create memories in your web app
   - Force sync on Spectacles: say "sync memories"
   - Verify new orbs appear in gallery

3. **Authentication Testing:**
   - Test with valid auth tokens
   - Test error handling for invalid tokens

#### Web App Integration:
1. **Upload Memory Flow:**
   - Upload photos in web app
   - Generate storyboard with Cohere
   - Verify orb appears in Spectacles gallery

2. **Cross-Platform Sync:**
   - Create memory on web
   - View on Spectacles
   - Ensure consistent data

### 5. Voice Command Testing

#### ASR Integration:
1. **Test voice commands:**
   ```
   "Show memories" → Opens gallery
   "Create memory about my beach trip" → Initiates memory creation
   "Close gallery" → Hides gallery
   "Sync memories" → Forces backend sync
   ```

2. **Voice Recognition Quality:**
   - Test in different noise environments
   - Test with different accents/speaking styles
   - Verify command accuracy

### 6. 3D Object Integration Testing

#### Snap3D Memory Objects:
1. **Test voice creation:**
   - Say "Create memory about a cute dog"
   - Verify 3D object generates
   - Test integration with memory system

2. **Performance with 3D objects:**
   - Monitor rendering performance
   - Test with multiple 3D memories
   - Check memory cleanup

### 7. Debugging and Logs

#### Lens Studio Console:
- Monitor `print()` statements from scripts
- Check for TypeScript compilation errors
- Watch for runtime exceptions

#### Common Issues:
1. **Orbs not appearing:**
   - Check prefab references
   - Verify component setup
   - Check positioning calculations

2. **Backend connectivity:**
   - Verify internet connection
   - Check CORS settings on backend
   - Validate API endpoints

3. **Performance issues:**
   - Reduce number of orbs
   - Optimize materials and textures
   - Check animation loops

### 8. Performance Optimization

#### Recommended Settings:
```typescript
// MemoryOrbGallery configuration for optimal performance
maxOrbs: 15-20
galleryRadius: 120-150 cm
floatSpeed: 0.5-1.0
heightVariation: 30-50 cm
```

#### Material Optimization:
- Use unlit materials for orbs where possible
- Minimize texture sizes
- Use texture atlasing for multiple orb states

### 9. Deployment Checklist

Before final deployment:
- [ ] All components properly referenced
- [ ] Backend URL configured for production
- [ ] Voice commands tested and working
- [ ] Performance meets requirements (60fps)
- [ ] Battery usage acceptable
- [ ] Memory leaks resolved
- [ ] Error handling tested
- [ ] Cross-platform sync verified

### 10. Known Limitations

- Maximum 20 orbs recommended for performance
- Voice commands require quiet environment
- Backend sync requires stable internet
- Texture loading may have delays
- VAPI integration requires backend proxy

## Troubleshooting

### Common Error Messages:
1. **"Cannot find module SpectaclesInteractionKit"**
   - Solution: Re-import the package in Lens Studio

2. **"Voice commands not responding"**
   - Solution: Check ASR permissions and microphone access

3. **"Orbs not positioning correctly"**
   - Solution: Verify WorldCameraFinderProvider setup

4. **"Backend sync failing"**
   - Solution: Check network connectivity and API endpoints

## Support Resources

- [Lens Studio Documentation](https://docs.snap.com/lens-studio)
- [Spectacles Developer Guide](https://docs.snap.com/spectacles)
- [SpectaclesInteractionKit Documentation](https://docs.snap.com/spectacles/spectacles-interaction-kit)

For project-specific issues, check the console logs in Lens Studio and verify component references in the scene hierarchy.