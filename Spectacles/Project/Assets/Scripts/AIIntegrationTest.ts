import { UnifiedAIController } from "./UnifiedAIController";
import { GeminiTTSController } from "./GeminiTTSController";
import { NanoBananaImageGenerator } from "./NanoBananaImageGenerator";
import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";

@component
export class AIIntegrationTest extends BaseScriptComponent {
  @ui.separator
  @ui.label("AI Integration Test Suite")
  @ui.separator
  
  @ui.group_start("Test Configuration")
  @input
  private unifiedController: UnifiedAIController;
  
  @input
  private ttsController: GeminiTTSController;
  
  @input
  private imageGenerator: NanoBananaImageGenerator;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Controls")
  @ui.label("Run All Tests")
  @ui.button
  private runAllTests(): void {
    this.executeAllTests();
  }
  
  @ui.label("Test TTS Only")
  @ui.button
  private testTTS(): void {
    this.executeTTSTest();
  }
  
  @ui.label("Test Image Generation Only")
  @ui.button
  private testImageGen(): void {
    this.executeImageGenerationTest();
  }
  
  @ui.label("Test Unified Workflow")
  @ui.button
  private testUnified(): void {
    this.executeUnifiedWorkflowTest();
  }
  
  @ui.label("Test Error Handling")
  @ui.button
  private testErrorHandling(): void {
    this.executeErrorHandlingTest();
  }
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Results")
  @ui.label("Test Status: Ready")
  private testStatus: string = "Ready";
  
  @ui.label("Last Test: None")
  private lastTest: string = "None";
  @ui.group_end

  private testResults: { [key: string]: boolean } = {};
  private currentTest: string = "";

  onStart() {
    this.updateTestStatus("Integration test suite ready");
  }

  /**
   * Execute all integration tests
   */
  private async executeAllTests(): Promise<void> {
    this.updateTestStatus("Running all tests...");
    this.currentTest = "All Tests";
    
    const tests = [
      { name: "TTS Basic", fn: () => this.executeTTSTest() },
      { name: "Image Generation Basic", fn: () => this.executeImageGenerationTest() },
      { name: "Unified Workflow", fn: () => this.executeUnifiedWorkflowTest() },
      { name: "Error Handling", fn: () => this.executeErrorHandlingTest() },
      { name: "Component Integration", fn: () => this.executeComponentIntegrationTest() }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        this.updateTestStatus(`Running ${test.name}...`);
        await test.fn();
        this.testResults[test.name] = true;
        passedTests++;
        print(`✅ ${test.name} - PASSED`);
      } catch (error) {
        this.testResults[test.name] = false;
        print(`❌ ${test.name} - FAILED: ${error}`);
      }
    }

    const successRate = (passedTests / totalTests) * 100;
    this.updateTestStatus(`All tests completed: ${passedTests}/${totalTests} passed (${successRate.toFixed(1)}%)`);
    this.lastTest = `All Tests - ${passedTests}/${totalTests} passed`;
  }

  /**
   * Test TTS functionality
   */
  private async executeTTSTest(): Promise<void> {
    this.currentTest = "TTS Test";
    
    if (!this.ttsController) {
      throw new Error("TTS Controller not assigned");
    }

    // Test basic TTS
    this.updateTestStatus("Testing basic TTS...");
    await this.ttsController.generateSpeech("This is a test of the text to speech system");
    
    // Test voice configuration
    this.updateTestStatus("Testing voice configuration...");
    this.ttsController.setVoice("Charon");
    this.ttsController.setSpeechRate(1.2);
    this.ttsController.setPitch(0.5);
    
    // Test TTS with different voice
    await this.ttsController.generateSpeech("This is a test with a different voice and settings");
    
    // Test TTS stop functionality
    this.updateTestStatus("Testing TTS stop functionality...");
    this.ttsController.generateSpeech("This speech should be interrupted");
    setTimeout(() => {
      this.ttsController.stopTTS();
    }, 1000);
    
    this.updateTestStatus("TTS test completed successfully");
  }

  /**
   * Test image generation functionality
   */
  private async executeImageGenerationTest(): Promise<void> {
    this.currentTest = "Image Generation Test";
    
    if (!this.imageGenerator) {
      throw new Error("Image Generator not assigned");
    }

    // Test basic image generation
    this.updateTestStatus("Testing basic image generation...");
    const images = await this.imageGenerator.generateImages("A simple test image of a red apple", {
      maxImages: 1,
      imageSize: "512x512"
    });
    
    if (images.length === 0) {
      throw new Error("No images generated");
    }
    
    // Test multiple image generation
    this.updateTestStatus("Testing multiple image generation...");
    const multipleImages = await this.imageGenerator.generateImages("A blue ocean wave", {
      maxImages: 2,
      imageSize: "1024x1024"
    });
    
    if (multipleImages.length !== 2) {
      throw new Error(`Expected 2 images, got ${multipleImages.length}`);
    }
    
    // Test image editing (if enabled)
    if (this.imageGenerator.enableImageEditing) {
      this.updateTestStatus("Testing image editing...");
      const editedImage = await this.imageGenerator.editImage(
        images[0],
        "Make the apple green instead of red"
      );
      
      if (!editedImage) {
        throw new Error("Image editing failed");
      }
    }
    
    this.updateTestStatus("Image generation test completed successfully");
  }

  /**
   * Test unified workflow
   */
  private async executeUnifiedWorkflowTest(): Promise<void> {
    this.currentTest = "Unified Workflow Test";
    
    if (!this.unifiedController) {
      throw new Error("Unified Controller not assigned");
    }

    // Test complete workflow
    this.updateTestStatus("Testing complete AI workflow...");
    const result = await this.unifiedController.processAIWorkflow(
      "Create a beautiful sunset scene",
      {
        generateSpeech: true,
        generateImages: true,
        voice: "Puck",
        imageSize: "1024x1024",
        maxImages: 1
      }
    );
    
    if (!result.text && !result.images.length) {
      throw new Error("Workflow produced no results");
    }
    
    // Test speech and image generation separately
    this.updateTestStatus("Testing separate speech generation...");
    await this.unifiedController.generateSpeech("This is a separate speech test");
    
    this.updateTestStatus("Testing separate image generation...");
    const separateImages = await this.unifiedController.generateImages(
      "A magical forest with glowing trees"
    );
    
    if (separateImages.length === 0) {
      throw new Error("Separate image generation failed");
    }
    
    this.updateTestStatus("Unified workflow test completed successfully");
  }

  /**
   * Test error handling
   */
  private async executeErrorHandlingTest(): Promise<void> {
    this.currentTest = "Error Handling Test";
    
    // Test with invalid inputs
    this.updateTestStatus("Testing error handling with invalid inputs...");
    
    try {
      // Test TTS with empty string
      await this.ttsController.generateSpeech("");
      print("⚠️ Empty string TTS should have failed but didn't");
    } catch (error) {
      print("✅ Empty string TTS properly failed");
    }
    
    try {
      // Test image generation with empty prompt
      await this.imageGenerator.generateImages("");
      print("⚠️ Empty prompt image generation should have failed but didn't");
    } catch (error) {
      print("✅ Empty prompt image generation properly failed");
    }
    
    // Test stop functionality
    this.updateTestStatus("Testing stop functionality...");
    this.unifiedController.stopProcessing();
    
    // Verify all processing is stopped
    if (this.unifiedController.isProcessingActive()) {
      throw new Error("Stop processing failed - still showing as active");
    }
    
    this.updateTestStatus("Error handling test completed successfully");
  }

  /**
   * Test component integration
   */
  private async executeComponentIntegrationTest(): Promise<void> {
    this.currentTest = "Component Integration Test";
    
    // Test that all components are properly connected
    this.updateTestStatus("Testing component connections...");
    
    if (!this.unifiedController.ttsController) {
      throw new Error("Unified controller TTS reference not set");
    }
    
    if (!this.unifiedController.imageGenerator) {
      throw new Error("Unified controller image generator reference not set");
    }
    
    // Test event propagation
    this.updateTestStatus("Testing event propagation...");
    let eventReceived = false;
    
    const eventHandler = () => {
      eventReceived = true;
    };
    
    this.unifiedController.onWorkflowStart.add(eventHandler);
    
    // Trigger a workflow
    this.unifiedController.processAIWorkflow("Test event propagation", {
      generateSpeech: false,
      generateImages: false
    });
    
    // Wait a bit for event
    setTimeout(() => {
      if (!eventReceived) {
        print("⚠️ Event propagation may not be working correctly");
      } else {
        print("✅ Event propagation working correctly");
      }
    }, 1000);
    
    this.updateTestStatus("Component integration test completed successfully");
  }

  /**
   * Get test results summary
   */
  public getTestResults(): { [key: string]: boolean } {
    return this.testResults;
  }

  /**
   * Get current test status
   */
  public getCurrentTestStatus(): string {
    return this.testStatus;
  }

  /**
   * Get last test result
   */
  public getLastTestResult(): string {
    return this.lastTest;
  }

  /**
   * Check if all tests passed
   */
  public allTestsPassed(): boolean {
    const results = Object.values(this.testResults);
    return results.length > 0 && results.every(result => result === true);
  }

  /**
   * Get test success rate
   */
  public getSuccessRate(): number {
    const results = Object.values(this.testResults);
    if (results.length === 0) return 0;
    
    const passed = results.filter(result => result === true).length;
    return (passed / results.length) * 100;
  }

  private updateTestStatus(status: string): void {
    this.testStatus = status;
    this.lastTest = this.currentTest;
    print(`[AI Integration Test] ${status}`);
  }

  onDestroy() {
    // Clean up any running tests
    if (this.unifiedController) {
      this.unifiedController.stopProcessing();
    }
  }
}
