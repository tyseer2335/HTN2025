// Configuration file for SpectraSphere project
// This file manages all API keys and environment settings

@component
export class Config extends BaseScriptComponent {
  @ui.separator
  @ui.label("SpectraSphere Configuration")
  @ui.separator
  
  @ui.group_start("API Keys")
  @input
  private geminiAPIKey: string = "AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM";
  
  @input
  private yourAPIEndpoint: string = "https://your-api.com/api";
  
  @input
  private enableRealAPICalls: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Gemini Configuration")
  @input
  private geminiImageModel: string = "gemini-2.5-flash-image-generation";
  
  @input
  private geminiTextModel: string = "gemini-2.0-flash-preview";
  
  @input
  private defaultImageSize: string = "1024x1024";
  
  @input
  private numberOfTestImages: number = 3;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Configuration")
  @input
  private defaultTestPrompt: string = "A magical forest with glowing trees and floating islands";
  
  @input
  private enableDebugMode: boolean = true;
  
  @input
  private enablePerformanceMode: boolean = false;
  @ui.group_end

  // Static configuration values
  public static readonly GEMINI_API_KEY = "AIzaSyBJ34l6doJi2XATaOB4jPISI8Q9NJ88ijM";
  public static readonly YOUR_API_ENDPOINT = "https://your-api.com/api";
  public static readonly ENABLE_REAL_API_CALLS = true;
  public static readonly GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image-generation";
  public static readonly GEMINI_TEXT_MODEL = "gemini-2.0-flash-preview";
  public static readonly DEFAULT_IMAGE_SIZE = "1024x1024";
  public static readonly NUMBER_OF_TEST_IMAGES = 3;
  public static readonly DEFAULT_TEST_PROMPT = "A magical forest with glowing trees and floating islands";
  public static readonly ENABLE_DEBUG_MODE = true;
  public static readonly ENABLE_PERFORMANCE_MODE = false;

  // API Endpoints
  public static readonly GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
  public static readonly GEMINI_IMAGE_GENERATION_URL = `${Config.GEMINI_API_BASE_URL}/models/${Config.GEMINI_IMAGE_MODEL}:generateContent`;
  public static readonly GEMINI_TEXT_GENERATION_URL = `${Config.GEMINI_API_BASE_URL}/models/${Config.GEMINI_TEXT_MODEL}:generateContent`;

  // Animation Settings
  public static readonly DEFAULT_ANIMATION_DURATION = 4.0;
  public static readonly DEFAULT_ZOOM_LEVEL = 1.08;
  public static readonly DEFAULT_PAN_X = 0.0;
  public static readonly DEFAULT_PAN_Y = 0.02;
  public static readonly DEFAULT_DEPTH_SCALE = 0.02;

  // Performance Settings
  public static readonly MAX_TEXTURE_SIZE = 2048;
  public static readonly TARGET_FPS = 30;
  public static readonly MAX_CONCURRENT_ANIMATIONS = 2;

  onStart() {
    this.initializeConfig();
  }

  /**
   * Initialize configuration
   */
  private initializeConfig(): void {
    print("SpectraSphere Configuration initialized");
    print(`Gemini API Key: ${this.geminiAPIKey ? 'Set' : 'Not Set'}`);
    print(`Real API Calls: ${this.enableRealAPICalls ? 'Enabled' : 'Disabled'}`);
    print(`Debug Mode: ${this.enableDebugMode ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Get Gemini API key
   */
  public getGeminiAPIKey(): string {
    return this.geminiAPIKey || Config.GEMINI_API_KEY;
  }

  /**
   * Get your API endpoint
   */
  public getYourAPIEndpoint(): string {
    return this.yourAPIEndpoint || Config.YOUR_API_ENDPOINT;
  }

  /**
   * Check if real API calls are enabled
   */
  public isRealAPICallsEnabled(): boolean {
    return this.enableRealAPICalls && Config.ENABLE_REAL_API_CALLS;
  }

  /**
   * Get Gemini image model
   */
  public getGeminiImageModel(): string {
    return this.geminiImageModel || Config.GEMINI_IMAGE_MODEL;
  }

  /**
   * Get Gemini text model
   */
  public getGeminiTextModel(): string {
    return this.geminiTextModel || Config.GEMINI_TEXT_MODEL;
  }

  /**
   * Get default image size
   */
  public getDefaultImageSize(): string {
    return this.defaultImageSize || Config.DEFAULT_IMAGE_SIZE;
  }

  /**
   * Get number of test images
   */
  public getNumberOfTestImages(): number {
    return this.numberOfTestImages || Config.NUMBER_OF_TEST_IMAGES;
  }

  /**
   * Get default test prompt
   */
  public getDefaultTestPrompt(): string {
    return this.defaultTestPrompt || Config.DEFAULT_TEST_PROMPT;
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugModeEnabled(): boolean {
    return this.enableDebugMode && Config.ENABLE_DEBUG_MODE;
  }

  /**
   * Check if performance mode is enabled
   */
  public isPerformanceModeEnabled(): boolean {
    return this.enablePerformanceMode && Config.ENABLE_PERFORMANCE_MODE;
  }

  /**
   * Get complete configuration object
   */
  public getConfiguration(): any {
    return {
      geminiAPIKey: this.getGeminiAPIKey(),
      yourAPIEndpoint: this.getYourAPIEndpoint(),
      enableRealAPICalls: this.isRealAPICallsEnabled(),
      geminiImageModel: this.getGeminiImageModel(),
      geminiTextModel: this.getGeminiTextModel(),
      defaultImageSize: this.getDefaultImageSize(),
      numberOfTestImages: this.getNumberOfTestImages(),
      defaultTestPrompt: this.getDefaultTestPrompt(),
      enableDebugMode: this.isDebugModeEnabled(),
      enablePerformanceMode: this.isPerformanceModeEnabled()
    };
  }

  /**
   * Update configuration
   */
  public updateConfiguration(config: any): void {
    if (config.geminiAPIKey !== undefined) {
      this.geminiAPIKey = config.geminiAPIKey;
    }
    if (config.yourAPIEndpoint !== undefined) {
      this.yourAPIEndpoint = config.yourAPIEndpoint;
    }
    if (config.enableRealAPICalls !== undefined) {
      this.enableRealAPICalls = config.enableRealAPICalls;
    }
    if (config.geminiImageModel !== undefined) {
      this.geminiImageModel = config.geminiImageModel;
    }
    if (config.geminiTextModel !== undefined) {
      this.geminiTextModel = config.geminiTextModel;
    }
    if (config.defaultImageSize !== undefined) {
      this.defaultImageSize = config.defaultImageSize;
    }
    if (config.numberOfTestImages !== undefined) {
      this.numberOfTestImages = config.numberOfTestImages;
    }
    if (config.defaultTestPrompt !== undefined) {
      this.defaultTestPrompt = config.defaultTestPrompt;
    }
    if (config.enableDebugMode !== undefined) {
      this.enableDebugMode = config.enableDebugMode;
    }
    if (config.enablePerformanceMode !== undefined) {
      this.enablePerformanceMode = config.enablePerformanceMode;
    }

    print("Configuration updated");
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.getGeminiAPIKey()) {
      errors.push("Gemini API key is required");
    }

    if (!this.getYourAPIEndpoint()) {
      errors.push("Your API endpoint is required");
    }

    if (this.getNumberOfTestImages() < 1) {
      errors.push("Number of test images must be at least 1");
    }

    if (this.getDefaultImageSize().split('x').length !== 2) {
      errors.push("Image size must be in format 'WIDTHxHEIGHT'");
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Print configuration status
   */
  public printConfigurationStatus(): void {
    print("=== SPECTRASPHERE CONFIGURATION STATUS ===");
    print(`Gemini API Key: ${this.getGeminiAPIKey() ? '✅ Set' : '❌ Not Set'}`);
    print(`Your API Endpoint: ${this.getYourAPIEndpoint()}`);
    print(`Real API Calls: ${this.isRealAPICallsEnabled() ? '✅ Enabled' : '❌ Disabled'}`);
    print(`Gemini Image Model: ${this.getGeminiImageModel()}`);
    print(`Gemini Text Model: ${this.getGeminiTextModel()}`);
    print(`Default Image Size: ${this.getDefaultImageSize()}`);
    print(`Number of Test Images: ${this.getNumberOfTestImages()}`);
    print(`Debug Mode: ${this.isDebugModeEnabled() ? '✅ Enabled' : '❌ Disabled'}`);
    print(`Performance Mode: ${this.isPerformanceModeEnabled() ? '✅ Enabled' : '❌ Disabled'}`);
    
    const validation = this.validateConfiguration();
    if (validation.isValid) {
      print("✅ Configuration is valid");
    } else {
      print("❌ Configuration has errors:");
      validation.errors.forEach(error => print(`  - ${error}`));
    }
  }
}
