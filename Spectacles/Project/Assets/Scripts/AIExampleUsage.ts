import { UnifiedAIController } from "./UnifiedAIController";
import { GeminiTTSController } from "./GeminiTTSController";
import { NanoBananaImageGenerator } from "./NanoBananaImageGenerator";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class AIExampleUsage extends BaseScriptComponent {
  @ui.separator
  @ui.label("AI Example Usage - Demo Script")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  private unifiedController: UnifiedAIController;
  
  @input
  private ttsController: GeminiTTSController;
  
  @input
  private imageGenerator: NanoBananaImageGenerator;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Demo Settings")
  @input
  private demoPrompt: string = "Create a beautiful sunset over mountains";
  
  @input
  private enableTTS: boolean = true;
  
  @input
  private enableImageGen: boolean = true;
  
  @input
  private voice: string = "Puck";
  @ui.group_end
  
  @ui.separator
  @ui.group_start("UI Controls")
  @ui.label("Run Full AI Workflow")
  @ui.button
  private runFullWorkflow(): void {
    this.executeFullWorkflow();
  }
  
  @ui.label("Generate Speech Only")
  @ui.button
  private runTTSOnly(): void {
    this.executeTTSOnly();
  }
  
  @ui.label("Generate Images Only")
  @ui.button
  private runImageOnly(): void {
    this.executeImageOnly();
  }
  
  @ui.label("Stop All Processing")
  @ui.button
  private stopProcessing(): void {
    this.stopAllProcessing();
  }
  @ui.group_end

  // Events for UI updates
  public onStatusUpdate: Event<string> = new Event<string>();
  public onResultsReady: Event<{ text: string; images: Texture[] }> = new Event<{ text: string; images: Texture[] }>();

  onStart() {
    this.setupEventListeners();
    this.onStatusUpdate.invoke("AI Example ready. Click a button to start.");
  }

  /**
   * Execute a complete AI workflow with both TTS and image generation
   */
  private async executeFullWorkflow(): Promise<void> {
    try {
      this.onStatusUpdate.invoke("Starting full AI workflow...");
      
      const result = await this.unifiedController.processAIWorkflow(this.demoPrompt, {
        generateText: true,
        generateSpeech: this.enableTTS,
        generateImages: this.enableImageGen,
        voice: this.voice,
        imageSize: "1024x1024",
        maxImages: 2
      });

      this.onResultsReady.invoke(result);
      this.onStatusUpdate.invoke(`Workflow complete! Generated text and ${result.images.length} images.`);
      
    } catch (error) {
      this.onStatusUpdate.invoke("Error in full workflow: " + error);
    }
  }

  /**
   * Execute TTS only
   */
  private async executeTTSOnly(): Promise<void> {
    try {
      this.onStatusUpdate.invoke("Generating speech...");
      
      await this.ttsController.generateSpeech(this.demoPrompt);
      
      this.onStatusUpdate.invoke("Speech generation complete!");
      
    } catch (error) {
      this.onStatusUpdate.invoke("Error in TTS: " + error);
    }
  }

  /**
   * Execute image generation only
   */
  private async executeImageOnly(): Promise<void> {
    try {
      this.onStatusUpdate.invoke("Generating images...");
      
      const images = await this.imageGenerator.generateImages(this.demoPrompt, {
        maxImages: 2,
        imageSize: "1024x1024"
      });
      
      this.onResultsReady.invoke({ text: "", images: images });
      this.onStatusUpdate.invoke(`Image generation complete! Generated ${images.length} images.`);
      
    } catch (error) {
      this.onStatusUpdate.invoke("Error in image generation: " + error);
    }
  }

  /**
   * Stop all processing
   */
  private stopAllProcessing(): void {
    this.unifiedController.stopProcessing();
    this.ttsController.stopTTS();
    this.imageGenerator.cancelGeneration();
    this.onStatusUpdate.invoke("All processing stopped.");
  }

  /**
   * Example of advanced image operations
   */
  public async demonstrateImageOperations(originalImage: Texture): Promise<void> {
    try {
      this.onStatusUpdate.invoke("Demonstrating image operations...");
      
      // Edit the image
      const editedImage = await this.imageGenerator.editImage(
        originalImage, 
        "Make it more colorful and vibrant"
      );
      
      if (editedImage) {
        this.onStatusUpdate.invoke("Image edited successfully!");
        
        // Apply style transfer
        const styledImage = await this.imageGenerator.applyStyleTransfer(
          editedImage,
          "Van Gogh painting style"
        );
        
        if (styledImage) {
          this.onStatusUpdate.invoke("Style transfer applied!");
          
          // Upscale the final image
          const upscaledImage = await this.imageGenerator.upscaleImage(
            styledImage,
            "2048x2048"
          );
          
          if (upscaledImage) {
            this.onStatusUpdate.invoke("Image upscaled successfully!");
          }
        }
      }
      
    } catch (error) {
      this.onStatusUpdate.invoke("Error in image operations: " + error);
    }
  }

  /**
   * Example of batch processing
   */
  public async processMultiplePrompts(prompts: string[]): Promise<void> {
    try {
      this.onStatusUpdate.invoke(`Processing ${prompts.length} prompts...`);
      
      const results = [];
      
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        this.onStatusUpdate.invoke(`Processing prompt ${i + 1}/${prompts.length}: ${prompt}`);
        
        const result = await this.unifiedController.processAIWorkflow(prompt, {
          generateSpeech: this.enableTTS,
          generateImages: this.enableImageGen,
          maxImages: 1
        });
        
        results.push(result);
      }
      
      this.onStatusUpdate.invoke(`Batch processing complete! Processed ${results.length} prompts.`);
      
    } catch (error) {
      this.onStatusUpdate.invoke("Error in batch processing: " + error);
    }
  }

  /**
   * Get current processing status
   */
  public getProcessingStatus(): string {
    if (this.unifiedController.isProcessingActive()) {
      return "Processing active";
    } else if (this.ttsController.isTTSGenerating()) {
      return "TTS generating";
    } else if (this.imageGenerator.isGeneratingImages()) {
      return "Images generating";
    } else {
      return "Idle";
    }
  }

  /**
   * Update demo prompt
   */
  public updateDemoPrompt(newPrompt: string): void {
    this.demoPrompt = newPrompt;
    this.onStatusUpdate.invoke(`Demo prompt updated: ${newPrompt}`);
  }

  /**
   * Set voice for TTS
   */
  public setVoice(voice: string): void {
    this.voice = voice;
    this.ttsController.setVoice(voice);
    this.onStatusUpdate.invoke(`Voice set to: ${voice}`);
  }

  /**
   * Set image generation parameters
   */
  public setImageParameters(size: string, maxImages: number): void {
    this.imageGenerator.imageSize = size;
    this.imageGenerator.maxImages = maxImages;
    this.onStatusUpdate.invoke(`Image parameters updated: ${size}, max ${maxImages} images`);
  }

  private setupEventListeners(): void {
    // Listen to unified controller events
    this.unifiedController.onWorkflowStart.add((prompt) => {
      this.onStatusUpdate.invoke(`Workflow started: ${prompt}`);
    });
    
    this.unifiedController.onWorkflowComplete.add((result) => {
      this.onResultsReady.invoke(result);
      this.onStatusUpdate.invoke("Workflow completed successfully!");
    });
    
    this.unifiedController.onWorkflowError.add((error) => {
      this.onStatusUpdate.invoke("Workflow error: " + error);
    });

    // Listen to TTS events
    this.ttsController.onTTSStart.add(() => {
      this.onStatusUpdate.invoke("TTS generation started...");
    });
    
    this.ttsController.onTTSComplete.add(() => {
      this.onStatusUpdate.invoke("TTS generation completed!");
    });
    
    this.ttsController.onTTSError.add((error) => {
      this.onStatusUpdate.invoke("TTS error: " + error);
    });

    // Listen to image generation events
    this.imageGenerator.onImageGenerationStart.add((prompt) => {
      this.onStatusUpdate.invoke(`Image generation started: ${prompt}`);
    });
    
    this.imageGenerator.onImageGenerationComplete.add((images) => {
      this.onStatusUpdate.invoke(`Image generation completed: ${images.length} images`);
    });
    
    this.imageGenerator.onImageGenerationError.add((error) => {
      this.onStatusUpdate.invoke("Image generation error: " + error);
    });
  }

  onDestroy() {
    this.stopAllProcessing();
  }
}
