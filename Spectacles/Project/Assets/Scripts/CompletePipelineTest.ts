import { RealGeminiIntegration } from "./RealGeminiIntegration";
import { GeminiAPITester } from "./GeminiAPITester";
import { AnimationSystem } from "./AnimationSystem";
import { PanelLoader } from "./PanelLoader";
import { HandControls } from "./HandControls";
import { ParallaxMaterial } from "./ParallaxMaterial";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class CompletePipelineTest extends BaseScriptComponent {
  @ui.separator
  @ui.label("Complete Pipeline Test - Real API Integration")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  private realGeminiIntegration: RealGeminiIntegration;
  
  @input
  private geminiAPITester: GeminiAPITester;
  
  @input
  private animationSystem: AnimationSystem;
  
  @input
  private panelLoader: PanelLoader;
  
  @input
  private handControls: HandControls;
  
  @input
  private parallaxMaterial: ParallaxMaterial;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Configuration")
  @input
  private enableRealAPICalls: boolean = true;
  
  @input
  private testPrompt: string = "A magical forest with glowing trees and floating islands";
  
  @input
  private numberOfTestImages: number = 3;
  
  @input
  private enableAnimationTesting: boolean = true;
  
  @input
  private enableGestureTesting: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Controls")
  @ui.label("Test Real Gemini API")
  @ui.button
  private testRealGeminiAPI(): void {
    this.executeRealGeminiTest();
  }
  
  @ui.label("Test Complete Pipeline")
  @ui.button
  private testCompletePipeline(): void {
    this.executeCompletePipelineTest();
  }
  
  @ui.label("Test Animation System")
  @ui.button
  private testAnimationSystem(): void {
    this.executeAnimationSystemTest();
  }
  
  @ui.label("Test Gesture Controls")
  @ui.button
  private testGestureControls(): void {
    this.executeGestureControlsTest();
  }
  
  @ui.label("Run Full Integration Test")
  @ui.button
  private runFullIntegrationTest(): void {
    this.executeFullIntegrationTest();
  }
  
  @ui.label("Generate Demo Story")
  @ui.button
  private generateDemoStory(): void {
    this.executeDemoStoryGeneration();
  }
  @ui.group_end

  // Events
  public onTestStarted: Event<string> = new Event<string>();
  public onTestCompleted: Event<{ testName: string; success: boolean; duration: number }> = new Event<{ testName: string; success: boolean; duration: number }>();
  public onPipelineStep: Event<{ step: string; status: string; data?: any }> = new Event<{ step: string; status: string; data?: any }>();
  public onError: Event<string> = new Event<string>();

  private testResults: { [key: string]: any } = {};
  private isTestRunning: boolean = false;
  private currentTestStartTime: number = 0;

  onStart() {
    this.initializePipelineTest();
  }

  onUpdate() {
    if (this.isTestRunning) {
      this.updateTestProgress();
    }
  }

  /**
   * Initialize the complete pipeline test
   */
  private initializePipelineTest(): void {
    print("Complete Pipeline Test initialized");
    print("Ready to test real API integration with animation system");
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (this.realGeminiIntegration) {
      this.realGeminiIntegration.onImageGenerated.add((data) => {
        this.onPipelineStep.invoke({ 
          step: "Image Generation", 
          status: "completed", 
          data: data 
        });
      });
      
      this.realGeminiIntegration.onTextGenerated.add((data) => {
        this.onPipelineStep.invoke({ 
          step: "Text Generation", 
          status: "completed", 
          data: data 
        });
      });
      
      this.realGeminiIntegration.onStoryGenerated.add((data) => {
        this.onPipelineStep.invoke({ 
          step: "Story Generation", 
          status: "completed", 
          data: data 
        });
      });
      
      this.realGeminiIntegration.onError.add((error) => {
        this.onError.invoke("Gemini Integration Error: " + error);
      });
    }

    if (this.animationSystem) {
      this.animationSystem.onSystemReady.add(() => {
        this.onPipelineStep.invoke({ 
          step: "Animation System", 
          status: "ready" 
        });
      });
      
      this.animationSystem.onAnimationStarted.add((data) => {
        this.onPipelineStep.invoke({ 
          step: "Animation", 
          status: "started", 
          data: data 
        });
      });
    }
  }

  /**
   * Execute real Gemini API test
   */
  private async executeRealGeminiTest(): Promise<void> {
    this.startTest("Real Gemini API");
    
    try {
      // Configure Gemini integration
      this.realGeminiIntegration.configureAPI({
        enableImageGeneration: true,
        enableTextGeneration: true
      });
      
      // Test image generation
      this.onPipelineStep.invoke({ step: "Image Generation", status: "starting" });
      await this.realGeminiIntegration.executeImageGenerationTest();
      
      // Test text generation
      this.onPipelineStep.invoke({ step: "Text Generation", status: "starting" });
      await this.realGeminiIntegration.executeTextGenerationTest();
      
      // Test complete workflow
      this.onPipelineStep.invoke({ step: "Complete Workflow", status: "starting" });
      await this.realGeminiIntegration.executeCompleteWorkflowTest();
      
      this.completeTest("Real Gemini API", true);
      
    } catch (error) {
      this.completeTest("Real Gemini API", false);
      this.onError.invoke("Real Gemini API test failed: " + error);
    }
  }

  /**
   * Execute complete pipeline test
   */
  private async executeCompletePipelineTest(): Promise<void> {
    this.startTest("Complete Pipeline");
    
    try {
      // Step 1: Generate story data with Gemini
      this.onPipelineStep.invoke({ step: "Story Generation", status: "starting" });
      await this.realGeminiIntegration.executeStoryGeneration();
      
      // Step 2: Load story into animation system
      this.onPipelineStep.invoke({ step: "Story Loading", status: "starting" });
      const generatedImages = this.realGeminiIntegration.getGeneratedImages();
      const storyData = this.createStoryDataFromImages(generatedImages);
      
      // Step 3: Test animation system
      if (this.enableAnimationTesting) {
        this.onPipelineStep.invoke({ step: "Animation System", status: "starting" });
        await this.testAnimationSystemWithData(storyData);
      }
      
      // Step 4: Test gesture controls
      if (this.enableGestureTesting) {
        this.onPipelineStep.invoke({ step: "Gesture Controls", status: "starting" });
        await this.testGestureControlsWithData();
      }
      
      this.completeTest("Complete Pipeline", true);
      
    } catch (error) {
      this.completeTest("Complete Pipeline", false);
      this.onError.invoke("Complete pipeline test failed: " + error);
    }
  }

  /**
   * Execute animation system test
   */
  private async executeAnimationSystemTest(): Promise<void> {
    this.startTest("Animation System");
    
    try {
      // Generate test data
      const testData = this.createTestStoryData();
      
      // Test animation system
      await this.testAnimationSystemWithData(testData);
      
      this.completeTest("Animation System", true);
      
    } catch (error) {
      this.completeTest("Animation System", false);
      this.onError.invoke("Animation system test failed: " + error);
    }
  }

  /**
   * Execute gesture controls test
   */
  private async executeGestureControlsTest(): Promise<void> {
    this.startTest("Gesture Controls");
    
    try {
      await this.testGestureControlsWithData();
      
      this.completeTest("Gesture Controls", true);
      
    } catch (error) {
      this.completeTest("Gesture Controls", false);
      this.onError.invoke("Gesture controls test failed: " + error);
    }
  }

  /**
   * Execute full integration test
   */
  private async executeFullIntegrationTest(): Promise<void> {
    this.startTest("Full Integration");
    
    try {
      // Run all tests in sequence
      await this.executeRealGeminiTest();
      await this.executeCompletePipelineTest();
      await this.executeAnimationSystemTest();
      await this.executeGestureControlsTest();
      
      this.completeTest("Full Integration", true);
      this.printAllTestResults();
      
    } catch (error) {
      this.completeTest("Full Integration", false);
      this.onError.invoke("Full integration test failed: " + error);
    }
  }

  /**
   * Execute demo story generation
   */
  private async executeDemoStoryGeneration(): Promise<void> {
    this.startTest("Demo Story Generation");
    
    try {
      // Generate a complete demo story
      await this.realGeminiIntegration.executeStoryGeneration();
      
      // Load it into the animation system
      const generatedImages = this.realGeminiIntegration.getGeneratedImages();
      const storyData = this.createStoryDataFromImages(generatedImages);
      
      if (this.panelLoader) {
        await this.panelLoader.loadStoryFromRSG(JSON.stringify(storyData));
        this.onPipelineStep.invoke({ 
          step: "Demo Story", 
          status: "loaded", 
          data: storyData 
        });
      }
      
      this.completeTest("Demo Story Generation", true);
      
    } catch (error) {
      this.completeTest("Demo Story Generation", false);
      this.onError.invoke("Demo story generation failed: " + error);
    }
  }

  // Test Helper Methods

  private async testAnimationSystemWithData(storyData: any): Promise<void> {
    if (!this.animationSystem || !this.panelLoader) {
      throw new Error("Animation system components not assigned");
    }

    // Load story data
    await this.panelLoader.loadStoryFromRSG(JSON.stringify(storyData));
    
    // Test system status
    const status = this.animationSystem.getSystemStatus();
    if (!status.isReady) {
      throw new Error("Animation system not ready");
    }
    
    // Test navigation
    this.animationSystem.nextPanel();
    this.animationSystem.previousPanel();
    
    // Test animation control
    this.animationSystem.toggleAnimation();
    
    print("Animation system test completed successfully");
  }

  private async testGestureControlsWithData(): Promise<void> {
    if (!this.handControls) {
      throw new Error("Hand controls not assigned");
    }

    // Test gesture configuration
    this.handControls.setPinchEnabled(true);
    this.handControls.setSwipeEnabled(true);
    this.handControls.setAirTapEnabled(true);
    
    // Test gesture triggering
    this.handControls.triggerGesture("pinch");
    this.handControls.triggerGesture("swipe", "right");
    this.handControls.triggerGesture("airtap");
    
    print("Gesture controls test completed successfully");
  }

  private createStoryDataFromImages(images: any[]): any {
    const panels = images.map((image, index) => ({
      title: `Generated Image ${index + 1}`,
      description: image.prompt || this.testPrompt,
      imageUrl: image.imageUrl,
      anim: {
        type: index % 2 === 0 ? "kenburns" : "parallax",
        zoom: 1.0 + (index * 0.02),
        pan: [0.0, 0.01 * index],
        duration: 4.0 + index
      }
    }));

    return {
      iconCategory: "generated_story",
      title: "AI Generated Story",
      description: this.testPrompt,
      panels: panels,
      metadata: {
        generatedAt: new Date().toISOString(),
        panelCount: panels.length
      }
    };
  }

  private createTestStoryData(): any {
    return {
      iconCategory: "test_story",
      title: "Test Story",
      description: this.testPrompt,
      panels: [
        {
          title: "Test Panel 1",
          description: this.testPrompt,
          imageUrl: "https://example.com/test1.jpg",
          anim: { type: "kenburns", duration: 3.0 }
        },
        {
          title: "Test Panel 2",
          description: this.testPrompt,
          imageUrl: "https://example.com/test2.jpg",
          anim: { type: "parallax", duration: 4.0 }
        }
      ]
    };
  }

  // Test Management Methods

  private startTest(testName: string): void {
    this.isTestRunning = true;
    this.currentTestStartTime = getTime();
    this.onTestStarted.invoke(testName);
    print(`Starting test: ${testName}`);
  }

  private completeTest(testName: string, success: boolean): void {
    const duration = getTime() - this.currentTestStartTime;
    this.testResults[testName] = { success, duration };
    this.onTestCompleted.invoke({ testName, success, duration });
    this.isTestRunning = false;
    
    const status = success ? "PASSED" : "FAILED";
    print(`Test ${testName} ${status} (${duration.toFixed(2)}s)`);
  }

  private updateTestProgress(): void {
    // Update test progress if needed
  }

  private printAllTestResults(): void {
    print("=== COMPLETE PIPELINE TEST RESULTS ===");
    
    let totalTests = 0;
    let passedTests = 0;
    let totalDuration = 0;
    
    for (const [testName, result] of Object.entries(this.testResults)) {
      totalTests++;
      if (result.success) passedTests++;
      totalDuration += result.duration;
      
      const status = result.success ? "PASS" : "FAIL";
      print(`${testName}: ${status} (${result.duration.toFixed(2)}s)`);
    }
    
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const avgDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    
    print(`\nSummary:`);
    print(`Total Tests: ${totalTests}`);
    print(`Passed: ${passedTests}`);
    print(`Failed: ${totalTests - passedTests}`);
    print(`Success Rate: ${successRate.toFixed(1)}%`);
    print(`Average Duration: ${avgDuration.toFixed(2)}s`);
    
    if (successRate >= 80) {
      print("\n🎉 Pipeline test SUCCESSFUL! Ready for Snap Spectacles deployment.");
    } else {
      print("\n❌ Pipeline test FAILED - Check individual test results before deployment.");
    }
  }

  /**
   * Get test results
   */
  public getTestResults(): { [key: string]: any } {
    return this.testResults;
  }

  /**
   * Check if test is running
   */
  public isTestRunning(): boolean {
    return this.isTestRunning;
  }

  /**
   * Get test status
   */
  public getTestStatus(): {
    isRunning: boolean;
    currentTest: string;
    elapsedTime: number;
    results: { [key: string]: any };
  } {
    const elapsed = this.isTestRunning ? getTime() - this.currentTestStartTime : 0;
    
    return {
      isRunning: this.isTestRunning,
      currentTest: this.isTestRunning ? "Running..." : "Idle",
      elapsedTime: elapsed,
      results: this.testResults
    };
  }

  /**
   * Configure test settings
   */
  public configureTest(settings: {
    enableRealAPICalls?: boolean;
    testPrompt?: string;
    numberOfTestImages?: number;
    enableAnimationTesting?: boolean;
    enableGestureTesting?: boolean;
  }): void {
    if (settings.enableRealAPICalls !== undefined) {
      this.enableRealAPICalls = settings.enableRealAPICalls;
    }
    if (settings.testPrompt !== undefined) {
      this.testPrompt = settings.testPrompt;
    }
    if (settings.numberOfTestImages !== undefined) {
      this.numberOfTestImages = settings.numberOfTestImages;
    }
    if (settings.enableAnimationTesting !== undefined) {
      this.enableAnimationTesting = settings.enableAnimationTesting;
    }
    if (settings.enableGestureTesting !== undefined) {
      this.enableGestureTesting = settings.enableGestureTesting;
    }
  }
}
