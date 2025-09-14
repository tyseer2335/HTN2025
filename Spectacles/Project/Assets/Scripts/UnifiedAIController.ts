import { GeminiTTSController } from "./GeminiTTSController";
import { NanoBananaImageGenerator } from "./NanoBananaImageGenerator";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class UnifiedAIController extends BaseScriptComponent {
  @ui.separator
  @ui.label("Unified AI Controller - TTS + Image Generation")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  public ttsController: GeminiTTSController;
  
  @input
  public imageGenerator: NanoBananaImageGenerator;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("AI Workflow Settings")
  @input
  private enableTextToSpeech: boolean = true;
  
  @input
  private enableImageGeneration: boolean = true;
  
  @input
  private enableSequentialProcessing: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Voice Settings")
  @input
  private defaultVoice: string = "Puck";
  
  @input
  private speechRate: number = 1.0;
  
  @input
  private pitch: number = 0.0;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Image Settings")
  @input
  private defaultImageSize: string = "1024x1024";
  
  @input
  private maxImages: number = 1;
  
  @input
  private enableImageEditing: boolean = false;
  @ui.group_end

  // Events
  public onWorkflowStart: Event<string> = new Event<string>();
  public onWorkflowComplete: Event<{ text: string; images: Texture[] }> = new Event<{ text: string; images: Texture[] }>();
  public onWorkflowError: Event<string> = new Event<string>();
  public onTTSComplete: Event<string> = new Event<string>();
  public onImageGenerationComplete: Event<Texture[]> = new Event<Texture[]>();

  private isProcessing: boolean = false;
  private currentWorkflow: string = "";

  onStart() {
    this.setupEventListeners();
  }

  /**
   * Process a complete AI workflow: generate text, convert to speech, and generate images
   * @param prompt The main prompt for the AI workflow
   * @param options Optional configuration for the workflow
   */
  public async processAIWorkflow(
    prompt: string,
    options?: {
      generateText?: boolean;
      generateSpeech?: boolean;
      generateImages?: boolean;
      imagePrompt?: string;
      voice?: string;
      imageSize?: string;
      maxImages?: number;
    }
  ): Promise<{ text: string; images: Texture[] }> {
    if (this.isProcessing) {
      print("AI workflow already in progress, please wait...");
      return { text: "", images: [] };
    }

    this.isProcessing = true;
    this.currentWorkflow = prompt;
    this.onWorkflowStart.invoke(prompt);

    try {
      let generatedText = "";
      let generatedImages: Texture[] = [];

      // Step 1: Generate text using Gemini (if enabled)
      if (options?.generateText !== false) {
        generatedText = await this.generateText(prompt);
      }

      // Step 2: Convert text to speech (if enabled)
      if (this.enableTextToSpeech && options?.generateSpeech !== false) {
        await this.generateSpeech(generatedText || prompt, options?.voice);
      }

      // Step 3: Generate images (if enabled)
      if (this.enableImageGeneration && options?.generateImages !== false) {
        const imagePrompt = options?.imagePrompt || prompt;
        generatedImages = await this.generateImages(
          imagePrompt,
          options?.imageSize,
          options?.maxImages
        );
      }

      this.isProcessing = false;
      this.onWorkflowComplete.invoke({ text: generatedText, images: generatedImages });
      return { text: generatedText, images: generatedImages };

    } catch (error) {
      this.handleWorkflowError("AI workflow failed: " + error);
      return { text: "", images: [] };
    }
  }

  /**
   * Generate text using Gemini
   */
  public async generateText(prompt: string): Promise<string> {
    try {
      // This would integrate with your existing Gemini text generation
      // For now, we'll return a placeholder
      return `Generated text for: ${prompt}`;
    } catch (error) {
      throw new Error("Failed to generate text: " + error);
    }
  }

  /**
   * Generate speech from text
   */
  public async generateSpeech(text: string, voice?: string): Promise<void> {
    if (!this.ttsController) {
      throw new Error("TTS Controller not assigned");
    }

    if (voice) {
      this.ttsController.setVoice(voice);
    } else {
      this.ttsController.setVoice(this.defaultVoice);
    }

    this.ttsController.setSpeechRate(this.speechRate);
    this.ttsController.setPitch(this.pitch);

    await this.ttsController.generateSpeech(text);
    this.onTTSComplete.invoke(text);
  }

  /**
   * Generate images from prompt
   */
  public async generateImages(
    prompt: string, 
    imageSize?: string, 
    maxImages?: number
  ): Promise<Texture[]> {
    if (!this.imageGenerator) {
      throw new Error("Image Generator not assigned");
    }

    const images = await this.imageGenerator.generateImages(prompt, {
      maxImages: maxImages || this.maxImages,
      imageSize: imageSize || this.defaultImageSize,
      enableEditing: this.enableImageEditing,
    });

    this.onImageGenerationComplete.invoke(images);
    return images;
  }

  /**
   * Generate speech and images simultaneously
   */
  public async generateSpeechAndImages(
    textPrompt: string,
    imagePrompt?: string,
    options?: any
  ): Promise<{ speech: void; images: Texture[] }> {
    const imagePromptToUse = imagePrompt || textPrompt;
    
    const promises = [];
    
    if (this.enableTextToSpeech) {
      promises.push(this.generateSpeech(textPrompt, options?.voice));
    }
    
    if (this.enableImageGeneration) {
      promises.push(this.generateImages(imagePromptToUse, options?.imageSize, options?.maxImages));
    }

    const results = await Promise.all(promises);
    
    return {
      speech: results[0],
      images: results[1] || []
    };
  }

  /**
   * Edit an existing image with text prompt
   */
  public async editImage(
    originalImage: Texture,
    editPrompt: string,
    options?: any
  ): Promise<Texture | null> {
    if (!this.imageGenerator) {
      throw new Error("Image Generator not assigned");
    }

    return await this.imageGenerator.editImage(originalImage, editPrompt, options);
  }

  /**
   * Apply style transfer to an image
   */
  public async applyStyleTransfer(
    originalImage: Texture,
    stylePrompt: string,
    options?: any
  ): Promise<Texture | null> {
    if (!this.imageGenerator) {
      throw new Error("Image Generator not assigned");
    }

    return await this.imageGenerator.applyStyleTransfer(originalImage, stylePrompt, options);
  }

  /**
   * Upscale an image
   */
  public async upscaleImage(
    originalImage: Texture,
    targetSize?: string
  ): Promise<Texture | null> {
    if (!this.imageGenerator) {
      throw new Error("Image Generator not assigned");
    }

    return await this.imageGenerator.upscaleImage(originalImage, targetSize);
  }

  /**
   * Stop all current processing
   */
  public stopProcessing(): void {
    if (this.isProcessing) {
      this.isProcessing = false;
      
      if (this.ttsController) {
        this.ttsController.stopTTS();
      }
      
      if (this.imageGenerator) {
        this.imageGenerator.cancelGeneration();
      }
      
      print("AI processing stopped");
    }
  }

  /**
   * Check if any processing is currently active
   */
  public isProcessingActive(): boolean {
    return this.isProcessing || 
           (this.ttsController?.isTTSGenerating() || false) ||
           (this.imageGenerator?.isGeneratingImages() || false);
  }

  /**
   * Get current workflow status
   */
  public getCurrentWorkflow(): string {
    return this.currentWorkflow;
  }

  // Private methods

  private setupEventListeners(): void {
    if (this.ttsController) {
      this.ttsController.onTTSComplete.add(() => {
        print("TTS generation completed");
      });
      
      this.ttsController.onTTSError.add((error) => {
        this.handleWorkflowError("TTS Error: " + error);
      });
    }

    if (this.imageGenerator) {
      this.imageGenerator.onImageGenerationComplete.add((images) => {
        print(`Image generation completed: ${images.length} images generated`);
      });
      
      this.imageGenerator.onImageGenerationError.add((error) => {
        this.handleWorkflowError("Image Generation Error: " + error);
      });
    }
  }

  private handleWorkflowError(error: string): void {
    this.isProcessing = false;
    this.onWorkflowError.invoke(error);
    print("Workflow Error: " + error);
  }

  onDestroy() {
    this.stopProcessing();
  }
}
