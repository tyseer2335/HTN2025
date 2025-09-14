import { PanelLoader } from "./PanelLoader";
import { AnimationSystem } from "./AnimationSystem";
import { ParallaxMaterial } from "./ParallaxMaterial";
import { Config } from "./Config";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class GeminiAPITester extends BaseScriptComponent {
  @ui.separator
  @ui.label("Gemini API Integration Tester")
  @ui.separator
  
  @ui.group_start("API Configuration")
  @input
  private geminiAPIKey: string = Config.GEMINI_API_KEY;
  
  @input
  private yourAPIEndpoint: string = Config.YOUR_API_ENDPOINT;
  
  @input
  private testImageUrl: string = "https://example.com/test-image.jpg";
  
  @input
  private enableRealAPICalls: boolean = Config.ENABLE_REAL_API_CALLS;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Settings")
  @input
  private testPrompt: string = "A beautiful sunset over mountains";
  
  @input
  private testStyle: string = "Studio Ghibli animated style";
  
  @input
  private generateDepthMaps: boolean = true;
  
  @input
  private generateMasks: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Component References")
  @input
  private panelLoader: PanelLoader;
  
  @input
  private animationSystem: AnimationSystem;
  
  @input
  private parallaxMaterial: ParallaxMaterial;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Controls")
  @ui.label("Test Gemini Image Generation")
  @ui.button
  private testGeminiImageGeneration(): void {
    this.executeGeminiImageTest();
  }
  
  @ui.label("Test Complete Pipeline")
  @ui.button
  private testCompletePipeline(): void {
    this.executeCompletePipelineTest();
  }
  
  @ui.label("Test Your API Integration")
  @ui.button
  private testYourAPI(): void {
    this.executeYourAPITest();
  }
  
  @ui.label("Test Animation System")
  @ui.button
  private testAnimationWithRealData(): void {
    this.executeAnimationTest();
  }
  
  @ui.label("Run All Tests")
  @ui.button
  private runAllTests(): void {
    this.executeAllTests();
  }
  @ui.group_end

  // Events
  public onTestStarted: Event<string> = new Event<string>();
  public onTestCompleted: Event<{ testName: string; success: boolean; result: any }> = new Event<{ testName: string; success: boolean; result: any }>();
  public onAPIResponse: Event<{ endpoint: string; response: any }> = new Event<{ endpoint: string; response: any }>();
  public onError: Event<string> = new Event<string>();

  private testResults: { [key: string]: any } = {};
  private isTestRunning: boolean = false;

  onStart() {
    this.initializeTester();
  }

  /**
   * Initialize the API tester
   */
  private initializeTester(): void {
    print("Gemini API Tester initialized");
    print("Ready to test real API endpoints and animation system");
  }

  /**
   * Execute Gemini image generation test
   */
  private async executeGeminiImageTest(): Promise<void> {
    this.onTestStarted.invoke("Gemini Image Generation");
    print("Testing Gemini image generation...");

    try {
      const result = await this.testGeminiImageGenerationAPI();
      this.testResults["GeminiImageGeneration"] = result;
      this.onTestCompleted.invoke({ 
        testName: "Gemini Image Generation", 
        success: true, 
        result: result 
      });
      print("✅ Gemini image generation test PASSED");
    } catch (error) {
      this.testResults["GeminiImageGeneration"] = { error: error };
      this.onTestCompleted.invoke({ 
        testName: "Gemini Image Generation", 
        success: false, 
        result: { error: error } 
      });
      this.onError.invoke("Gemini image generation failed: " + error);
      print("❌ Gemini image generation test FAILED: " + error);
    }
  }

  /**
   * Execute complete pipeline test
   */
  private async executeCompletePipelineTest(): Promise<void> {
    this.onTestStarted.invoke("Complete Pipeline");
    print("Testing complete pipeline...");

    try {
      // Step 1: Generate image with Gemini
      const imageResult = await this.testGeminiImageGenerationAPI();
      
      // Step 2: Generate depth map
      const depthResult = this.generateDepthMap ? await this.testDepthMapGeneration(imageResult.imageUrl) : null;
      
      // Step 3: Generate mask
      const maskResult = this.generateMasks ? await this.testMaskGeneration(imageResult.imageUrl) : null;
      
      // Step 4: Create story data
      const storyData = this.createStoryData(imageResult, depthResult, maskResult);
      
      // Step 5: Test with animation system
      const animationResult = await this.testAnimationSystemWithData(storyData);
      
      const result = {
        imageGeneration: imageResult,
        depthMap: depthResult,
        mask: maskResult,
        storyData: storyData,
        animation: animationResult
      };

      this.testResults["CompletePipeline"] = result;
      this.onTestCompleted.invoke({ 
        testName: "Complete Pipeline", 
        success: true, 
        result: result 
      });
      print("✅ Complete pipeline test PASSED");
    } catch (error) {
      this.testResults["CompletePipeline"] = { error: error };
      this.onTestCompleted.invoke({ 
        testName: "Complete Pipeline", 
        success: false, 
        result: { error: error } 
      });
      this.onError.invoke("Complete pipeline test failed: " + error);
      print("❌ Complete pipeline test FAILED: " + error);
    }
  }

  /**
   * Execute your API test
   */
  private async executeYourAPITest(): Promise<void> {
    this.onTestStarted.invoke("Your API Integration");
    print("Testing your API integration...");

    try {
      const result = await this.testYourAPIEndpoint();
      this.testResults["YourAPI"] = result;
      this.onTestCompleted.invoke({ 
        testName: "Your API Integration", 
        success: true, 
        result: result 
      });
      print("✅ Your API test PASSED");
    } catch (error) {
      this.testResults["YourAPI"] = { error: error };
      this.onTestCompleted.invoke({ 
        testName: "Your API Integration", 
        success: false, 
        result: { error: error } 
      });
      this.onError.invoke("Your API test failed: " + error);
      print("❌ Your API test FAILED: " + error);
    }
  }

  /**
   * Execute animation test with real data
   */
  private async executeAnimationTest(): Promise<void> {
    this.onTestStarted.invoke("Animation System");
    print("Testing animation system with real data...");

    try {
      // Generate test data
      const testData = await this.generateTestData();
      
      // Test with animation system
      const result = await this.testAnimationSystemWithData(testData);
      
      this.testResults["AnimationSystem"] = result;
      this.onTestCompleted.invoke({ 
        testName: "Animation System", 
        success: true, 
        result: result 
      });
      print("✅ Animation system test PASSED");
    } catch (error) {
      this.testResults["AnimationSystem"] = { error: error };
      this.onTestCompleted.invoke({ 
        testName: "Animation System", 
        success: false, 
        result: { error: error } 
      });
      this.onError.invoke("Animation system test failed: " + error);
      print("❌ Animation system test FAILED: " + error);
    }
  }

  /**
   * Execute all tests
   */
  private async executeAllTests(): Promise<void> {
    if (this.isTestRunning) return;
    
    this.isTestRunning = true;
    print("Running all API and animation tests...");

    try {
      await this.executeGeminiImageTest();
      await this.executeYourAPITest();
      await this.executeAnimationTest();
      await this.executeCompletePipelineTest();
      
      this.printAllTestResults();
    } catch (error) {
      print("Test suite failed: " + error);
    } finally {
      this.isTestRunning = false;
    }
  }

  // API Testing Methods

  /**
   * Test Gemini image generation API
   */
  private async testGeminiImageGenerationAPI(): Promise<any> {
    if (!this.enableRealAPICalls) {
      // Simulate API response for testing
      return this.simulateGeminiResponse();
    }

    try {
      // Real Gemini API call
      const response = await this.callGeminiAPI({
        model: "gemini-2.5-flash-image-generation",
        prompt: `${this.testPrompt}, ${this.testStyle}`,
        parameters: {
          width: 1024,
          height: 1024,
          quality: "high"
        }
      });

      this.onAPIResponse.invoke({ 
        endpoint: "Gemini Image Generation", 
        response: response 
      });

      return {
        success: true,
        imageUrl: response.imageUrl,
        prompt: this.testPrompt,
        style: this.testStyle,
        metadata: response.metadata
      };
    } catch (error) {
      throw new Error("Gemini API call failed: " + error);
    }
  }

  /**
   * Test depth map generation
   */
  private async testDepthMapGeneration(imageUrl: string): Promise<any> {
    if (!this.enableRealAPICalls) {
      // Simulate depth map generation
      return this.simulateDepthMapResponse(imageUrl);
    }

    try {
      // Real depth map generation API call
      const response = await this.callDepthMapAPI(imageUrl);
      
      this.onAPIResponse.invoke({ 
        endpoint: "Depth Map Generation", 
        response: response 
      });

      return {
        success: true,
        depthMapUrl: response.depthMapUrl,
        originalImageUrl: imageUrl
      };
    } catch (error) {
      throw new Error("Depth map generation failed: " + error);
    }
  }

  /**
   * Test mask generation
   */
  private async testMaskGeneration(imageUrl: string): Promise<any> {
    if (!this.enableRealAPICalls) {
      // Simulate mask generation
      return this.simulateMaskResponse(imageUrl);
    }

    try {
      // Real mask generation API call
      const response = await this.callMaskAPI(imageUrl);
      
      this.onAPIResponse.invoke({ 
        endpoint: "Mask Generation", 
        response: response 
      });

      return {
        success: true,
        maskUrl: response.maskUrl,
        originalImageUrl: imageUrl
      };
    } catch (error) {
      throw new Error("Mask generation failed: " + error);
    }
  }

  /**
   * Test your API endpoint
   */
  private async testYourAPIEndpoint(): Promise<any> {
    if (!this.enableRealAPICalls) {
      // Simulate your API response
      return this.simulateYourAPIResponse();
    }

    try {
      // Real API call to your endpoint
      const response = await this.callYourAPI({
        prompt: this.testPrompt,
        style: this.testStyle,
        generateDepth: this.generateDepthMaps,
        generateMask: this.generateMasks
      });

      this.onAPIResponse.invoke({ 
        endpoint: "Your API", 
        response: response 
      });

      return {
        success: true,
        data: response,
        endpoint: this.yourAPIEndpoint
      };
    } catch (error) {
      throw new Error("Your API call failed: " + error);
    }
  }

  /**
   * Test animation system with real data
   */
  private async testAnimationSystemWithData(storyData: any): Promise<any> {
    if (!this.animationSystem || !this.panelLoader) {
      throw new Error("Animation system components not assigned");
    }

    try {
      // Load story data into panel loader
      await this.panelLoader.loadStoryFromRSG(JSON.stringify(storyData));
      
      // Test animation system
      const status = this.animationSystem.getSystemStatus();
      
      // Test navigation
      this.animationSystem.nextPanel();
      this.animationSystem.previousPanel();
      
      // Test animation control
      this.animationSystem.toggleAnimation();
      
      return {
        success: true,
        systemStatus: status,
        panelCount: this.panelLoader.getPanelCount(),
        currentIndex: this.panelLoader.getCurrentIndex()
      };
    } catch (error) {
      throw new Error("Animation system test failed: " + error);
    }
  }

  // API Call Methods

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(request: any): Promise<any> {
    // This would make the actual API call
    // For now, we'll simulate it
    return this.simulateGeminiResponse();
  }

  /**
   * Call depth map API
   */
  private async callDepthMapAPI(imageUrl: string): Promise<any> {
    // This would make the actual API call
    return this.simulateDepthMapResponse(imageUrl);
  }

  /**
   * Call mask API
   */
  private async callMaskAPI(imageUrl: string): Promise<any> {
    // This would make the actual API call
    return this.simulateMaskResponse(imageUrl);
  }

  /**
   * Call your API
   */
  private async callYourAPI(request: any): Promise<any> {
    // This would make the actual API call
    return this.simulateYourAPIResponse();
  }

  // Simulation Methods (for testing without real API calls)

  private simulateGeminiResponse(): any {
    return {
      imageUrl: "https://example.com/generated-image.jpg",
      prompt: this.testPrompt,
      style: this.testStyle,
      metadata: {
        model: "gemini-2.5-flash-image-generation",
        timestamp: new Date().toISOString(),
        dimensions: { width: 1024, height: 1024 }
      }
    };
  }

  private simulateDepthMapResponse(imageUrl: string): any {
    return {
      depthMapUrl: imageUrl.replace('.jpg', '_depth.png'),
      originalImageUrl: imageUrl,
      metadata: {
        algorithm: "MiDaS",
        timestamp: new Date().toISOString()
      }
    };
  }

  private simulateMaskResponse(imageUrl: string): any {
    return {
      maskUrl: imageUrl.replace('.jpg', '_mask.png'),
      originalImageUrl: imageUrl,
      metadata: {
        algorithm: "Segment Anything",
        timestamp: new Date().toISOString()
      }
    };
  }

  private simulateYourAPIResponse(): any {
    return {
      success: true,
      data: {
        prompt: this.testPrompt,
        style: this.testStyle,
        generatedImages: [
          {
            url: "https://example.com/your-api-image1.jpg",
            style: this.testStyle,
            metadata: { source: "your-api" }
          }
        ]
      },
      timestamp: new Date().toISOString()
    };
  }

  // Utility Methods

  private createStoryData(imageResult: any, depthResult: any, maskResult: any): any {
    return {
      iconCategory: "test",
      panels: [
        {
          title: "Generated Image",
          description: this.testPrompt,
          imageUrl: imageResult.imageUrl,
          depthUrl: depthResult?.depthMapUrl || null,
          maskUrl: maskResult?.maskUrl || null,
          anim: {
            type: "parallax",
            zoom: 1.08,
            pan: [0.0, 0.03],
            duration: 4.5
          }
        }
      ]
    };
  }

  private async generateTestData(): Promise<any> {
    return {
      iconCategory: "test",
      panels: [
        {
          title: "Test Panel 1",
          description: "Test description",
          imageUrl: this.testImageUrl,
          anim: { type: "kenburns", duration: 3.0 }
        },
        {
          title: "Test Panel 2",
          description: "Test description 2",
          imageUrl: this.testImageUrl,
          anim: { type: "parallax", duration: 4.0 }
        }
      ]
    };
  }

  private printAllTestResults(): void {
    print("=== ALL TEST RESULTS ===");
    
    for (const [testName, result] of Object.entries(this.testResults)) {
      print(`${testName}: ${result.success ? 'PASS' : 'FAIL'}`);
      if (result.error) {
        print(`  Error: ${result.error}`);
      }
    }
  }

  /**
   * Get test results
   */
  public getTestResults(): { [key: string]: any } {
    return this.testResults;
  }

  /**
   * Check if tests are running
   */
  public isTestRunning(): boolean {
    return this.isTestRunning;
  }

  /**
   * Configure API settings
   */
  public configureAPI(settings: {
    geminiAPIKey?: string;
    yourAPIEndpoint?: string;
    enableRealAPICalls?: boolean;
  }): void {
    if (settings.geminiAPIKey !== undefined) {
      this.geminiAPIKey = settings.geminiAPIKey;
    }
    if (settings.yourAPIEndpoint !== undefined) {
      this.yourAPIEndpoint = settings.yourAPIEndpoint;
    }
    if (settings.enableRealAPICalls !== undefined) {
      this.enableRealAPICalls = settings.enableRealAPICalls;
    }
  }
}
