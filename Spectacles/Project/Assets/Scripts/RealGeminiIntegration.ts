import { Gemini } from "Remote Service Gateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "Remote Service Gateway.lspkg/HostedExternal/GeminiTypes";
import { Config } from "./Config";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class RealGeminiIntegration extends BaseScriptComponent {
  @ui.separator
  @ui.label("Real Gemini API Integration")
  @ui.separator
  
  @ui.group_start("API Configuration")
  @input
  private apiKey: string = Config.GEMINI_API_KEY;
  
  @input
  private modelName: string = Config.GEMINI_IMAGE_MODEL;
  
  @input
  private enableImageGeneration: boolean = true;
  
  @input
  private enableTextGeneration: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Settings")
  @input
  private testPrompt: string = Config.DEFAULT_TEST_PROMPT;
  
  @input
  private imageSize: string = Config.DEFAULT_IMAGE_SIZE;
  
  @input
  private numberOfImages: number = Config.NUMBER_OF_TEST_IMAGES;
  
  @input
  private temperature: number = 0.7;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Controls")
  @ui.label("Test Image Generation")
  @ui.button
  private testImageGeneration(): void {
    this.executeImageGenerationTest();
  }
  
  @ui.label("Test Text Generation")
  @ui.button
  private testTextGeneration(): void {
    this.executeTextGenerationTest();
  }
  
  @ui.label("Test Complete Workflow")
  @ui.button
  private testCompleteWorkflow(): void {
    this.executeCompleteWorkflowTest();
  }
  
  @ui.label("Generate Story Data")
  @ui.button
  private generateStoryData(): void {
    this.executeStoryGeneration();
  }
  @ui.group_end

  // Events
  public onImageGenerated: Event<{ imageUrl: string; prompt: string }> = new Event<{ imageUrl: string; prompt: string }>();
  public onTextGenerated: Event<{ text: string; prompt: string }> = new Event<{ text: string; prompt: string }>();
  public onStoryGenerated: Event<{ storyData: any }> = new Event<{ storyData: any }>();
  public onError: Event<string> = new Event<string>();

  private generatedImages: any[] = [];
  private generatedTexts: any[] = [];
  private isGenerating: boolean = false;

  onStart() {
    this.initializeIntegration();
  }

  /**
   * Initialize the real Gemini integration
   */
  private initializeIntegration(): void {
    print("Real Gemini Integration initialized");
    print("Ready to make actual API calls to Google Gemini");
  }

  /**
   * Execute image generation test
   */
  private async executeImageGenerationTest(): Promise<void> {
    if (this.isGenerating) {
      print("Already generating, please wait...");
      return;
    }

    this.isGenerating = true;
    print("Testing real Gemini image generation...");

    try {
      const result = await this.generateImageWithGemini(this.testPrompt);
      
      this.generatedImages.push(result);
      this.onImageGenerated.invoke({ 
        imageUrl: result.imageUrl, 
        prompt: this.testPrompt 
      });
      
      print("✅ Image generation successful!");
      print(`Generated image: ${result.imageUrl}`);
      
    } catch (error) {
      this.onError.invoke("Image generation failed: " + error);
      print("❌ Image generation failed: " + error);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Execute text generation test
   */
  private async executeTextGenerationTest(): Promise<void> {
    if (this.isGenerating) {
      print("Already generating, please wait...");
      return;
    }

    this.isGenerating = true;
    print("Testing real Gemini text generation...");

    try {
      const result = await this.generateTextWithGemini(this.testPrompt);
      
      this.generatedTexts.push(result);
      this.onTextGenerated.invoke({ 
        text: result.text, 
        prompt: this.testPrompt 
      });
      
      print("✅ Text generation successful!");
      print(`Generated text: ${result.text.substring(0, 100)}...`);
      
    } catch (error) {
      this.onError.invoke("Text generation failed: " + error);
      print("❌ Text generation failed: " + error);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Execute complete workflow test
   */
  private async executeCompleteWorkflowTest(): Promise<void> {
    if (this.isGenerating) {
      print("Already generating, please wait...");
      return;
    }

    this.isGenerating = true;
    print("Testing complete Gemini workflow...");

    try {
      // Step 1: Generate text description
      const textResult = await this.generateTextWithGemini(
        `Create a detailed description for: ${this.testPrompt}. Make it vivid and suitable for image generation.`
      );
      
      // Step 2: Generate image based on text
      const imageResult = await this.generateImageWithGemini(textResult.text);
      
      // Step 3: Generate additional variations
      const variations = [];
      for (let i = 0; i < this.numberOfImages - 1; i++) {
        const variation = await this.generateImageWithGemini(
          `${textResult.text}, variation ${i + 1}, different angle or composition`
        );
        variations.push(variation);
      }
      
      print("✅ Complete workflow successful!");
      print(`Generated ${1 + variations.length} images and 1 text description`);
      
    } catch (error) {
      this.onError.invoke("Complete workflow failed: " + error);
      print("❌ Complete workflow failed: " + error);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Execute story generation
   */
  private async executeStoryGeneration(): Promise<void> {
    if (this.isGenerating) {
      print("Already generating, please wait...");
      return;
    }

    this.isGenerating = true;
    print("Generating complete story data...");

    try {
      const storyData = await this.generateCompleteStoryData();
      
      this.onStoryGenerated.invoke({ storyData: storyData });
      
      print("✅ Story generation successful!");
      print(`Generated story with ${storyData.panels.length} panels`);
      
    } catch (error) {
      this.onError.invoke("Story generation failed: " + error);
      print("❌ Story generation failed: " + error);
    } finally {
      this.isGenerating = false;
    }
  }

  // Real API Integration Methods

  /**
   * Generate image using real Gemini API
   */
  private async generateImageWithGemini(prompt: string): Promise<any> {
    try {
      const request: GeminiTypes.Models.GenerateContentRequest = {
        model: this.modelName,
        type: "generateContent",
        body: {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
              role: "user",
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
            temperature: this.temperature,
            imageGenerationConfig: {
              numberOfImages: 1,
              imageSize: this.parseImageSize(this.imageSize),
            },
          },
        },
      };

      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No image generated in response");
      }

      let foundImage = false;
      for (let part of response.candidates[0].content.parts) {
        if (part?.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
          foundImage = true;
          const b64Data = part.inlineData.data;
          
          // Convert base64 to texture
          const texture = await this.decodeBase64ToTexture(b64Data);
          
          return {
            success: true,
            imageUrl: `data:image/jpeg;base64,${b64Data}`,
            texture: texture,
            prompt: prompt,
            metadata: {
              model: this.modelName,
              timestamp: new Date().toISOString(),
              size: this.imageSize
            }
          };
        }
      }

      if (!foundImage) {
        throw new Error("No image data found in response");
      }
    } catch (error) {
      throw new Error("Gemini image generation failed: " + error);
    }
  }

  /**
   * Generate text using real Gemini API
   */
  private async generateTextWithGemini(prompt: string): Promise<any> {
    try {
      const request: GeminiTypes.Models.GenerateContentRequest = {
        model: "gemini-2.0-flash-preview",
        type: "generateContent",
        body: {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
              role: "user",
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT"],
            temperature: this.temperature,
            maxOutputTokens: 1000,
          },
        },
      };

      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No text generated in response");
      }

      let generatedText = "";
      for (let part of response.candidates[0].content.parts) {
        if (part?.text) {
          generatedText += part.text;
        }
      }

      if (!generatedText) {
        throw new Error("No text data found in response");
      }

      return {
        success: true,
        text: generatedText,
        prompt: prompt,
        metadata: {
          model: "gemini-2.0-flash-preview",
          timestamp: new Date().toISOString(),
          tokenCount: generatedText.length
        }
      };
    } catch (error) {
      throw new Error("Gemini text generation failed: " + error);
    }
  }

  /**
   * Generate complete story data
   */
  private async generateCompleteStoryData(): Promise<any> {
    try {
      // Generate story concept
      const storyConcept = await this.generateTextWithGemini(
        `Create a short story concept about: ${this.testPrompt}. Include 3-4 scenes that would work well as images.`
      );

      // Generate individual scene descriptions
      const sceneDescriptions = await this.generateTextWithGemini(
        `Based on this story: "${storyConcept.text}", create 3 detailed scene descriptions for image generation. Each should be vivid and visual.`
      );

      // Generate images for each scene
      const panels = [];
      const scenes = this.parseScenes(sceneDescriptions.text);
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const imageResult = await this.generateImageWithGemini(scene);
        
        panels.push({
          title: `Scene ${i + 1}`,
          description: scene,
          imageUrl: imageResult.imageUrl,
          anim: {
            type: i % 2 === 0 ? "kenburns" : "parallax",
            zoom: 1.0 + (i * 0.02),
            pan: [0.0, 0.01 * i],
            duration: 4.0 + i
          }
        });
      }

      return {
        iconCategory: "generated_story",
        title: "AI Generated Story",
        description: storyConcept.text,
        panels: panels,
        metadata: {
          generatedAt: new Date().toISOString(),
          model: this.modelName,
          panelCount: panels.length
        }
      };
    } catch (error) {
      throw new Error("Story generation failed: " + error);
    }
  }

  // Utility Methods

  private parseImageSize(sizeString: string): { width: number; height: number } {
    const [width, height] = sizeString.split('x').map(Number);
    return { width: width || 1024, height: height || 1024 };
  }

  private parseScenes(text: string): string[] {
    // Simple parsing - split by common scene separators
    const scenes = text.split(/[.!?]\s*(?=[A-Z])/).filter(scene => scene.trim().length > 10);
    return scenes.slice(0, 3); // Limit to 3 scenes
  }

  private async decodeBase64ToTexture(base64Data: string): Promise<Texture | null> {
    return new Promise((resolve, reject) => {
      Base64.decodeTextureAsync(
        base64Data,
        (texture) => {
          resolve(texture);
        },
        () => {
          reject(new Error("Failed to decode base64 to texture"));
        }
      );
    });
  }

  /**
   * Get generated images
   */
  public getGeneratedImages(): any[] {
    return this.generatedImages;
  }

  /**
   * Get generated texts
   */
  public getGeneratedTexts(): any[] {
    return this.generatedTexts;
  }

  /**
   * Check if currently generating
   */
  public isCurrentlyGenerating(): boolean {
    return this.isGenerating;
  }

  /**
   * Clear generated data
   */
  public clearGeneratedData(): void {
    this.generatedImages = [];
    this.generatedTexts = [];
  }

  /**
   * Configure API settings
   */
  public configureAPI(settings: {
    apiKey?: string;
    modelName?: string;
    enableImageGeneration?: boolean;
    enableTextGeneration?: boolean;
  }): void {
    if (settings.apiKey !== undefined) {
      this.apiKey = settings.apiKey;
    }
    if (settings.modelName !== undefined) {
      this.modelName = settings.modelName;
    }
    if (settings.enableImageGeneration !== undefined) {
      this.enableImageGeneration = settings.enableImageGeneration;
    }
    if (settings.enableTextGeneration !== undefined) {
      this.enableTextGeneration = settings.enableTextGeneration;
    }
  }
}
