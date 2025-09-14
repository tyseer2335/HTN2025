# AI Components for Lens Studio - Gemini TTS & Nano Banana Image Generation

This document explains how to use the new AI components that integrate Gemini text-to-speech and Nano Banana (Gemini 2.5 Flash) image generation capabilities into your Lens Studio project.

## Components Overview

### 1. GeminiTTSController.ts
Handles text-to-speech conversion using both Gemini's TTS API and Lens Studio's built-in TTS capabilities.

**Features:**
- Gemini TTS integration with multiple voice options
- Fallback to Lens Studio TTS
- Configurable voice, speech rate, pitch, and volume
- Real-time audio output
- Event-driven architecture

**Usage:**
```typescript
// Generate speech from text
await ttsController.generateSpeech("Hello, this is a test", true); // true = use Gemini TTS

// Configure voice settings
ttsController.setVoice("Puck");
ttsController.setSpeechRate(1.2);
ttsController.setPitch(0.5);
```

### 2. NanoBananaImageGenerator.ts
Implements image generation using Google's Nano Banana (Gemini 2.5 Flash Image) model.

**Features:**
- High-quality image generation from text prompts
- Image editing capabilities
- Style transfer
- Image upscaling
- Batch processing
- Safety settings
- Multiple image sizes

**Usage:**
```typescript
// Generate images from prompt
const images = await imageGenerator.generateImages("A beautiful sunset over mountains", {
  maxImages: 2,
  imageSize: "1024x1024"
});

// Edit existing image
const editedImage = await imageGenerator.editImage(originalTexture, "Make it more colorful");

// Apply style transfer
const styledImage = await imageGenerator.applyStyleTransfer(originalTexture, "Van Gogh style");
```

### 3. UnifiedAIController.ts
Combines TTS and image generation into a single workflow controller.

**Features:**
- Complete AI workflow management
- Sequential or parallel processing
- Event-driven updates
- Error handling and fallbacks
- Batch processing support

**Usage:**
```typescript
// Run complete workflow
const result = await unifiedController.processAIWorkflow("Create a beautiful landscape", {
  generateSpeech: true,
  generateImages: true,
  voice: "Puck",
  imageSize: "1024x1024"
});

// Generate speech and images simultaneously
const results = await unifiedController.generateSpeechAndImages(
  "Describe a magical forest",
  "A magical forest with glowing trees"
);
```

### 4. AIExampleUsage.ts
Demonstration script showing how to use all components together.

**Features:**
- UI controls for testing
- Example workflows
- Status updates
- Error handling demonstrations

## Setup Instructions

### 1. Import Components
1. Add all four script files to your Lens Studio project
2. Create SceneObjects for each component
3. Assign the scripts to the SceneObjects

### 2. Configure Dependencies
- Ensure you have the Remote Service Gateway package installed
- Set up your Gemini API key in the project settings
- Configure audio output components for TTS

### 3. Component Configuration

#### GeminiTTSController Setup:
```typescript
// Required inputs
@input private dynamicAudioOutput: DynamicAudioOutput;
@input private audioProcessor: AudioProcessor;

// Optional voice settings
@input private voice: string = "Puck";
@input private speechRate: number = 1.0;
@input private pitch: number = 0.0;
@input private volume: number = 1.0;
```

#### NanoBananaImageGenerator Setup:
```typescript
// Model configuration
@input private modelName: string = "gemini-2.5-flash-image-generation";
@input private maxImages: number = 1;
@input private imageSize: string = "1024x1024";

// Generation settings
@input private temperature: number = 0.7;
@input private safetySettings: boolean = true;
```

#### UnifiedAIController Setup:
```typescript
// Component references
@input private ttsController: GeminiTTSController;
@input private imageGenerator: NanoBananaImageGenerator;

// Workflow settings
@input private enableTextToSpeech: boolean = true;
@input private enableImageGeneration: boolean = true;
```

## API Reference

### GeminiTTSController Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `generateSpeech(text, useGemini?)` | `string, boolean?` | Generate speech from text |
| `stopTTS()` | None | Stop current TTS generation |
| `setVoice(voice)` | `string` | Set voice for TTS |
| `setSpeechRate(rate)` | `number` | Set speech rate (0.1-2.0) |
| `setPitch(pitch)` | `number` | Set pitch (-20 to 20) |
| `setVolume(volume)` | `number` | Set volume (0.0-1.0) |
| `isTTSGenerating()` | None | Check if TTS is active |

### NanoBananaImageGenerator Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `generateImages(prompt, options?)` | `string, object?` | Generate images from prompt |
| `generateImage(prompt, options?)` | `string, object?` | Generate single image |
| `editImage(image, prompt, options?)` | `Texture, string, object?` | Edit existing image |
| `applyStyleTransfer(image, style, options?)` | `Texture, string, object?` | Apply style transfer |
| `upscaleImage(image, size?)` | `Texture, string?` | Upscale image |
| `cancelGeneration()` | None | Cancel current generation |
| `isGeneratingImages()` | None | Check if generating |

### UnifiedAIController Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `processAIWorkflow(prompt, options?)` | `string, object?` | Run complete AI workflow |
| `generateText(prompt)` | `string` | Generate text only |
| `generateSpeech(text, voice?)` | `string, string?` | Generate speech only |
| `generateImages(prompt, size?, max?)` | `string, string?, number?` | Generate images only |
| `generateSpeechAndImages(text, image?, options?)` | `string, string?, object?` | Generate both simultaneously |
| `stopProcessing()` | None | Stop all processing |
| `isProcessingActive()` | None | Check processing status |

## Events

### GeminiTTSController Events
- `onTTSStart`: Fired when TTS generation starts
- `onTTSComplete`: Fired when TTS generation completes
- `onTTSError`: Fired when TTS generation fails

### NanoBananaImageGenerator Events
- `onImageGenerationStart`: Fired when image generation starts
- `onImageGenerationComplete`: Fired when images are generated
- `onImageGenerationError`: Fired when image generation fails
- `onImageGenerationProgress`: Fired with progress updates

### UnifiedAIController Events
- `onWorkflowStart`: Fired when workflow starts
- `onWorkflowComplete`: Fired when workflow completes
- `onWorkflowError`: Fired when workflow fails
- `onTTSComplete`: Fired when TTS completes
- `onImageGenerationComplete`: Fired when images complete

## Example Workflows

### Basic Text-to-Speech
```typescript
// Simple TTS
await ttsController.generateSpeech("Hello, welcome to our lens!");

// TTS with custom voice
ttsController.setVoice("Charon");
await ttsController.generateSpeech("This is a different voice");
```

### Basic Image Generation
```typescript
// Generate single image
const image = await imageGenerator.generateImage("A cute robot");

// Generate multiple images
const images = await imageGenerator.generateImages("Fantasy castle", {
  maxImages: 3,
  imageSize: "1024x1024"
});
```

### Complete AI Workflow
```typescript
// Full workflow with both TTS and images
const result = await unifiedController.processAIWorkflow(
  "Create a magical forest scene",
  {
    generateSpeech: true,
    generateImages: true,
    voice: "Puck",
    imageSize: "1024x1024",
    maxImages: 2
  }
);

// Use the results
console.log("Generated text:", result.text);
console.log("Generated images:", result.images.length);
```

### Advanced Image Operations
```typescript
// Edit an existing image
const edited = await imageGenerator.editImage(
  originalTexture,
  "Add more vibrant colors and magical sparkles"
);

// Apply style transfer
const styled = await imageGenerator.applyStyleTransfer(
  edited,
  "Picasso cubist style"
);

// Upscale the final result
const upscaled = await imageGenerator.upscaleImage(
  styled,
  "2048x2048"
);
```

## Troubleshooting

### Common Issues

1. **TTS not working**: Ensure DynamicAudioOutput is properly configured
2. **Image generation failing**: Check Gemini API key and internet connection
3. **Audio feedback**: Use headphones or manage microphone input
4. **Performance issues**: Reduce image size or max images for better performance

### Error Handling

All components include comprehensive error handling:
- Automatic fallbacks where possible
- Detailed error messages
- Event-based error reporting
- Graceful degradation

### Performance Tips

1. Use appropriate image sizes for your use case
2. Limit concurrent operations
3. Cache generated content when possible
4. Monitor memory usage with large images

## Compatibility

- **Lens Studio Version**: 4.0+
- **Remote Service Gateway**: Latest version required
- **Gemini API**: Requires valid API key
- **Platforms**: iOS and Android

## Support

For issues or questions:
1. Check the error messages in the console
2. Verify API key configuration
3. Test with simple prompts first
4. Check internet connectivity

## License

These components are part of your HTN2025 project and follow the same licensing terms.
