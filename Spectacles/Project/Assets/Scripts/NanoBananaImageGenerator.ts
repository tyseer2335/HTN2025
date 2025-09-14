import { Gemini } from "Remote Service Gateway.lspkg/HostedExternal/Gemini";
import { GeminiTypes } from "Remote Service Gateway.lspkg/HostedExternal/GeminiTypes";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class NanoBananaImageGenerator extends BaseScriptComponent {
  @ui.separator
  @ui.label("Nano Banana (Gemini 2.5 Flash) Image Generator")
  @ui.separator
  
  @ui.group_start("Model Configuration")
  @input
  private modelName: string = "gemini-2.5-flash-image-generation";
  
  @input
  public maxImages: number = 1;
  
  @input
  public imageSize: string = "1024x1024";
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Generation Settings")
  @input
  private temperature: number = 0.7;
  
  @input
  private maxTokens: number = 8192;
  
  @input
  private safetySettings: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Advanced Options")
  @input
  public enableImageEditing: boolean = false;
  
  @input
  private enableStyleTransfer: boolean = false;
  
  @input
  private enableUpscaling: boolean = false;
  @ui.group_end

  // Events
  public onImageGenerationStart: Event<string> = new Event<string>();
  public onImageGenerationComplete: Event<Texture[]> = new Event<Texture[]>();
  public onImageGenerationError: Event<string> = new Event<string>();
  public onImageGenerationProgress: Event<number> = new Event<number>();

  private isGenerating: boolean = false;
  private currentPrompt: string = "";

  /**
   * Generate images using Nano Banana (Gemini 2.5 Flash Image) model
   * @param prompt The text prompt for image generation
   * @param options Optional generation parameters
   */
  public async generateImages(
    prompt: string, 
    options?: {
      maxImages?: number;
      imageSize?: string;
      temperature?: number;
      enableEditing?: boolean;
      enableStyleTransfer?: boolean;
      enableUpscaling?: boolean;
    }
  ): Promise<Texture[]> {
    if (this.isGenerating) {
      print("Image generation already in progress, please wait...");
      return [];
    }

    this.currentPrompt = prompt;
    this.isGenerating = true;
    this.onImageGenerationStart.invoke(prompt);

    try {
      // Apply options if provided
      const maxImages = options?.maxImages || this.maxImages;
      const imageSize = options?.imageSize || this.imageSize;
      const temperature = options?.temperature || this.temperature;
      const enableEditing = options?.enableEditing || this.enableImageEditing;
      const enableStyleTransfer = options?.enableStyleTransfer || this.enableStyleTransfer;
      const enableUpscaling = options?.enableUpscaling || this.enableUpscaling;

      const request: GeminiTypes.Models.GenerateContentRequest = {
        model: this.modelName,
        type: "generateContent",
        body: {
          contents: [
            {
              parts: [
                {
                  text: this.buildPrompt(prompt, enableEditing, enableStyleTransfer, enableUpscaling),
                },
              ],
              role: "user",
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
            temperature: temperature,
            maxOutputTokens: this.maxTokens,
            imageGenerationConfig: {
              numberOfImages: maxImages,
              imageSize: this.parseImageSize(imageSize),
              safetySettings: this.safetySettings ? this.getSafetySettings() : undefined,
            },
          },
        },
      };

      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No images generated in response");
      }

      const textures: Texture[] = [];
      let foundImages = 0;

      for (let candidate of response.candidates) {
        for (let part of candidate.content.parts) {
          if (part?.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
            const texture = await this.decodeImageData(part.inlineData.data);
            if (texture) {
              textures.push(texture);
              foundImages++;
              
              // Update progress
              const progress = (foundImages / maxImages) * 100;
              this.onImageGenerationProgress.invoke(progress);
            }
          }
        }
      }

      if (foundImages === 0) {
        throw new Error("No image data found in response");
      }

      this.isGenerating = false;
      this.onImageGenerationComplete.invoke(textures);
      return textures;

    } catch (error) {
      this.handleImageGenerationError("Failed to generate images: " + error);
      return [];
    }
  }

  /**
   * Generate a single image (convenience method)
   */
  public async generateImage(prompt: string, options?: any): Promise<Texture | null> {
    const textures = await this.generateImages(prompt, { ...options, maxImages: 1 });
    return textures.length > 0 ? textures[0] : null;
  }

  /**
   * Edit an existing image with a text prompt
   */
  public async editImage(
    originalImage: Texture, 
    editPrompt: string, 
    options?: any
  ): Promise<Texture | null> {
    if (!this.enableImageEditing) {
      throw new Error("Image editing is not enabled");
    }

    // Convert texture to base64 for editing
    const imageData = await this.textureToBase64(originalImage);
    
    const request: GeminiTypes.Models.GenerateContentRequest = {
      model: this.modelName,
      type: "generateContent",
      body: {
        contents: [
          {
            parts: [
              {
                text: `Edit this image: ${editPrompt}`,
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData,
                },
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
            safetySettings: this.safetySettings ? this.getSafetySettings() : undefined,
          },
        },
      },
    };

    try {
      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No edited image generated");
      }

      for (let candidate of response.candidates) {
        for (let part of candidate.content.parts) {
          if (part?.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
            return await this.decodeImageData(part.inlineData.data);
          }
        }
      }

      throw new Error("No edited image data found in response");
    } catch (error) {
      this.handleImageGenerationError("Failed to edit image: " + error);
      return null;
    }
  }

  /**
   * Apply style transfer to an image
   */
  public async applyStyleTransfer(
    originalImage: Texture, 
    stylePrompt: string, 
    options?: any
  ): Promise<Texture | null> {
    if (!this.enableStyleTransfer) {
      throw new Error("Style transfer is not enabled");
    }

    const imageData = await this.textureToBase64(originalImage);
    
    const request: GeminiTypes.Models.GenerateContentRequest = {
      model: this.modelName,
      type: "generateContent",
      body: {
        contents: [
          {
            parts: [
              {
                text: `Apply this style to the image: ${stylePrompt}. Keep the original content but change the artistic style.`,
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData,
                },
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
            safetySettings: this.safetySettings ? this.getSafetySettings() : undefined,
          },
        },
      },
    };

    try {
      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No style transfer result generated");
      }

      for (let candidate of response.candidates) {
        for (let part of candidate.content.parts) {
          if (part?.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
            return await this.decodeImageData(part.inlineData.data);
          }
        }
      }

      throw new Error("No style transfer data found in response");
    } catch (error) {
      this.handleImageGenerationError("Failed to apply style transfer: " + error);
      return null;
    }
  }

  /**
   * Upscale an image
   */
  public async upscaleImage(
    originalImage: Texture, 
    targetSize?: string
  ): Promise<Texture | null> {
    if (!this.enableUpscaling) {
      throw new Error("Image upscaling is not enabled");
    }

    const imageData = await this.textureToBase64(originalImage);
    const upscaleSize = targetSize || "2048x2048";
    
    const request: GeminiTypes.Models.GenerateContentRequest = {
      model: this.modelName,
      type: "generateContent",
      body: {
        contents: [
          {
            parts: [
              {
                text: `Upscale this image to ${upscaleSize} while maintaining quality and detail.`,
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData,
                },
              },
            ],
            role: "user",
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
          temperature: 0.3, // Lower temperature for upscaling
          imageGenerationConfig: {
            numberOfImages: 1,
            imageSize: this.parseImageSize(upscaleSize),
            safetySettings: this.safetySettings ? this.getSafetySettings() : undefined,
          },
        },
      },
    };

    try {
      const response = await Gemini.models(request);
      
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No upscaled image generated");
      }

      for (let candidate of response.candidates) {
        for (let part of candidate.content.parts) {
          if (part?.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
            return await this.decodeImageData(part.inlineData.data);
          }
        }
      }

      throw new Error("No upscaled image data found in response");
    } catch (error) {
      this.handleImageGenerationError("Failed to upscale image: " + error);
      return null;
    }
  }

  /**
   * Check if image generation is currently in progress
   */
  public isGeneratingImages(): boolean {
    return this.isGenerating;
  }

  /**
   * Get the current prompt being processed
   */
  public getCurrentPrompt(): string {
    return this.currentPrompt;
  }

  /**
   * Cancel current image generation
   */
  public cancelGeneration(): void {
    if (this.isGenerating) {
      this.isGenerating = false;
      print("Image generation cancelled");
    }
  }

  // Private helper methods

  private buildPrompt(
    prompt: string, 
    enableEditing: boolean, 
    enableStyleTransfer: boolean, 
    enableUpscaling: boolean
  ): string {
    let enhancedPrompt = prompt;
    
    // Add quality enhancements
    enhancedPrompt += ", high quality, detailed, professional";
    
    if (enableEditing) {
      enhancedPrompt += ", editable, clean composition";
    }
    
    if (enableStyleTransfer) {
      enhancedPrompt += ", artistic style, creative interpretation";
    }
    
    if (enableUpscaling) {
      enhancedPrompt += ", high resolution, sharp details";
    }
    
    return enhancedPrompt;
  }

  private parseImageSize(sizeString: string): { width: number; height: number } {
    const [width, height] = sizeString.split('x').map(Number);
    return { width: width || 1024, height: height || 1024 };
  }

  private getSafetySettings(): any {
    return {
      harmCategoryHateSpeech: "BLOCK_MEDIUM_AND_ABOVE",
      harmCategoryDangerousContent: "BLOCK_MEDIUM_AND_ABOVE",
      harmCategoryHarassment: "BLOCK_MEDIUM_AND_ABOVE",
      harmCategorySexuallyExplicit: "BLOCK_MEDIUM_AND_ABOVE",
    };
  }

  private async decodeImageData(base64Data: string): Promise<Texture | null> {
    return new Promise((resolve, reject) => {
      Base64.decodeTextureAsync(
        base64Data,
        (texture) => {
          resolve(texture);
        },
        () => {
          reject(new Error("Failed to decode image from base64 data"));
        }
      );
    });
  }

  private async textureToBase64(texture: Texture): Promise<string> {
    // This is a simplified implementation
    // In a real implementation, you'd need to convert the texture to base64
    // For now, we'll return a placeholder
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
  }

  private handleImageGenerationError(error: string): void {
    this.isGenerating = false;
    this.onImageGenerationError.invoke(error);
    print("Image Generation Error: " + error);
  }

  onDestroy() {
    this.cancelGeneration();
  }
}
