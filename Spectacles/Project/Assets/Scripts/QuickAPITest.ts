import { Config } from "./Config";
import { RealGeminiIntegration } from "./RealGeminiIntegration";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class QuickAPITest extends BaseScriptComponent {
  @ui.separator
  @ui.label("Quick API Test - Verify Setup")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  private config: Config;
  
  @input
  private realGeminiIntegration: RealGeminiIntegration;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Quick Tests")
  @ui.label("Test Configuration")
  @ui.button
  private testConfiguration(): void {
    this.executeConfigurationTest();
  }
  
  @ui.label("Test API Key")
  @ui.button
  private testAPIKey(): void {
    this.executeAPIKeyTest();
  }
  
  @ui.label("Test Image Generation")
  @ui.button
  private testImageGeneration(): void {
    this.executeImageGenerationTest();
  }
  
  @ui.label("Run All Quick Tests")
  @ui.button
  private runAllQuickTests(): void {
    this.executeAllQuickTests();
  }
  @ui.group_end

  // Events
  public onTestStarted: Event<string> = new Event<string>();
  public onTestCompleted: Event<{ testName: string; success: boolean; message: string }> = new Event<{ testName: string; success: boolean; message: string }>();
  public onError: Event<string> = new Event<string>();

  private testResults: { [key: string]: any } = {};

  onStart() {
    this.initializeQuickTest();
  }

  /**
   * Initialize quick test
   */
  private initializeQuickTest(): void {
    print("Quick API Test initialized");
    print("Ready to verify your setup");
  }

  /**
   * Execute configuration test
   */
  private async executeConfigurationTest(): Promise<void> {
    this.onTestStarted.invoke("Configuration Test");
    print("Testing configuration...");

    try {
      if (!this.config) {
        throw new Error("Config component not assigned");
      }

      // Test configuration validation
      const validation = this.config.validateConfiguration();
      
      if (validation.isValid) {
        this.config.printConfigurationStatus();
        this.testResults["Configuration"] = { success: true, message: "Configuration is valid" };
        this.onTestCompleted.invoke({ 
          testName: "Configuration Test", 
          success: true, 
          message: "Configuration is valid" 
        });
        print("✅ Configuration test PASSED");
      } else {
        throw new Error("Configuration validation failed: " + validation.errors.join(", "));
      }
    } catch (error) {
      this.testResults["Configuration"] = { success: false, message: error };
      this.onTestCompleted.invoke({ 
        testName: "Configuration Test", 
        success: false, 
        message: error 
      });
      this.onError.invoke("Configuration test failed: " + error);
      print("❌ Configuration test FAILED: " + error);
    }
  }

  /**
   * Execute API key test
   */
  private async executeAPIKeyTest(): Promise<void> {
    this.onTestStarted.invoke("API Key Test");
    print("Testing API key...");

    try {
      if (!this.config) {
        throw new Error("Config component not assigned");
      }

      const apiKey = this.config.getGeminiAPIKey();
      
      if (!apiKey) {
        throw new Error("API key is not set");
      }

      if (apiKey.length < 20) {
        throw new Error("API key appears to be invalid (too short)");
      }

      if (!apiKey.startsWith("AIza")) {
        throw new Error("API key does not appear to be a valid Google API key");
      }

      this.testResults["APIKey"] = { success: true, message: "API key is valid" };
      this.onTestCompleted.invoke({ 
        testName: "API Key Test", 
        success: true, 
        message: "API key is valid" 
      });
      print("✅ API key test PASSED");
      print(`API Key: ${apiKey.substring(0, 10)}...`);
    } catch (error) {
      this.testResults["APIKey"] = { success: false, message: error };
      this.onTestCompleted.invoke({ 
        testName: "API Key Test", 
        success: false, 
        message: error 
      });
      this.onError.invoke("API key test failed: " + error);
      print("❌ API key test FAILED: " + error);
    }
  }

  /**
   * Execute image generation test
   */
  private async executeImageGenerationTest(): Promise<void> {
    this.onTestStarted.invoke("Image Generation Test");
    print("Testing image generation...");

    try {
      if (!this.realGeminiIntegration) {
        throw new Error("RealGeminiIntegration component not assigned");
      }

      // Test image generation
      await this.realGeminiIntegration.executeImageGenerationTest();
      
      this.testResults["ImageGeneration"] = { success: true, message: "Image generation successful" };
      this.onTestCompleted.invoke({ 
        testName: "Image Generation Test", 
        success: true, 
        message: "Image generation successful" 
      });
      print("✅ Image generation test PASSED");
    } catch (error) {
      this.testResults["ImageGeneration"] = { success: false, message: error };
      this.onTestCompleted.invoke({ 
        testName: "Image Generation Test", 
        success: false, 
        message: error 
      });
      this.onError.invoke("Image generation test failed: " + error);
      print("❌ Image generation test FAILED: " + error);
    }
  }

  /**
   * Execute all quick tests
   */
  private async executeAllQuickTests(): Promise<void> {
    print("Running all quick tests...");
    
    try {
      await this.executeConfigurationTest();
      await this.executeAPIKeyTest();
      await this.executeImageGenerationTest();
      
      this.printQuickTestResults();
    } catch (error) {
      print("Quick tests failed: " + error);
    }
  }

  /**
   * Print quick test results
   */
  private printQuickTestResults(): void {
    print("=== QUICK TEST RESULTS ===");
    
    let totalTests = 0;
    let passedTests = 0;
    
    for (const [testName, result] of Object.entries(this.testResults)) {
      totalTests++;
      if (result.success) passedTests++;
      
      const status = result.success ? "PASS" : "FAIL";
      print(`${testName}: ${status} - ${result.message}`);
    }
    
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    print(`\nSummary:`);
    print(`Total Tests: ${totalTests}`);
    print(`Passed: ${passedTests}`);
    print(`Failed: ${totalTests - passedTests}`);
    print(`Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 100) {
      print("\n🎉 All quick tests PASSED! Your setup is ready!");
    } else if (successRate >= 66) {
      print("\n⚠️ Most tests passed, but some issues need attention.");
    } else {
      print("\n❌ Multiple tests failed. Please check your configuration.");
    }
  }

  /**
   * Get test results
   */
  public getTestResults(): { [key: string]: any } {
    return this.testResults;
  }

  /**
   * Get test status
   */
  public getTestStatus(): {
    totalTests: number;
    passedTests: number;
    successRate: number;
    isReady: boolean;
  } {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(result => result.success).length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const isReady = successRate >= 100;
    
    return {
      totalTests,
      passedTests,
      successRate,
      isReady
    };
  }
}
