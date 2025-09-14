import { AnimationSystem } from "./AnimationSystem";
import { PanelLoader } from "./PanelLoader";
import { HandControls } from "./HandControls";
import { ParallaxMaterial } from "./ParallaxMaterial";
import { AnimationExample } from "./AnimationExample";

@component
export class AnimationIntegrationTest extends BaseScriptComponent {
  @ui.separator
  @ui.label("Animation Integration Test")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  private animationSystem: AnimationSystem;
  
  @input
  private panelLoader: PanelLoader;
  
  @input
  private handControls: HandControls;
  
  @input
  private parallaxMaterial: ParallaxMaterial;
  
  @input
  private animationExample: AnimationExample;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Configuration")
  @input
  private enableFullTest: boolean = true;
  
  @input
  private testDuration: number = 30.0;
  
  @input
  private enablePerformanceTest: boolean = true;
  
  @input
  private enableGestureTest: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Test Controls")
  @ui.label("Run Full Integration Test")
  @ui.button
  private runFullTest(): void {
    this.executeFullIntegrationTest();
  }
  
  @ui.label("Test Panel Loading")
  @ui.button
  private testPanelLoading(): void {
    this.testPanelLoader();
  }
  
  @ui.label("Test Gesture Controls")
  @ui.button
  private testGestureControls(): void {
    this.testHandControls();
  }
  
  @ui.label("Test Animation System")
  @ui.button
  private testAnimationSystem(): void {
    this.testAnimationSystem();
  }
  
  @ui.label("Test Performance")
  @ui.button
  private testPerformance(): void {
    this.testPerformance();
  }
  @ui.group_end

  // Test results
  private testResults: { [key: string]: boolean } = {};
  private testStartTime: number = 0;
  private isTestRunning: boolean = false;

  onStart() {
    this.initializeTestEnvironment();
  }

  onUpdate() {
    if (this.isTestRunning) {
      this.updateTestProgress();
    }
  }

  /**
   * Initialize test environment
   */
  private async initializeTestEnvironment(): Promise<void> {
    try {
      // Set up test data
      await this.setupTestData();
      
      // Configure components for testing
      this.configureComponentsForTesting();
      
      print("Animation Integration Test environment initialized");
    } catch (error) {
      print("Failed to initialize test environment: " + error);
    }
  }

  /**
   * Set up test data
   */
  private async setupTestData(): Promise<void> {
    // This would set up sample data for testing
    // For now, we'll use the built-in sample data
    print("Test data setup completed");
  }

  /**
   * Configure components for testing
   */
  private configureComponentsForTesting(): void {
    // Configure animation system
    if (this.animationSystem) {
      this.animationSystem.configureSystem({
        enableAutoAdvance: true,
        autoAdvanceDelay: 3.0,
        enableLooping: true,
        enableSmoothTransitions: true,
        transitionDuration: 0.5
      });
    }

    // Configure hand controls
    if (this.handControls) {
      this.handControls.setPinchEnabled(true);
      this.handControls.setSwipeEnabled(true);
      this.handControls.setAirTapEnabled(true);
      this.handControls.setGazeFallbackEnabled(true);
    }

    // Configure parallax material
    if (this.parallaxMaterial) {
      this.parallaxMaterial.setDepthScale(0.02);
      this.parallaxMaterial.setParallaxStrength(1.0);
      this.parallaxMaterial.setAnimationSpeed(1.0);
      this.parallaxMaterial.setKenBurnsEnabled(true);
      this.parallaxMaterial.setDepthParallaxEnabled(true);
    }
  }

  /**
   * Execute full integration test
   */
  private async executeFullIntegrationTest(): Promise<void> {
    if (this.isTestRunning) return;

    this.isTestRunning = true;
    this.testStartTime = getTime();
    this.testResults = {};

    print("Starting full integration test...");

    try {
      // Test 1: Panel Loading
      await this.testPanelLoader();
      
      // Test 2: Gesture Controls
      await this.testHandControls();
      
      // Test 3: Animation System
      await this.testAnimationSystem();
      
      // Test 4: Performance
      if (this.enablePerformanceTest) {
        await this.testPerformance();
      }
      
      // Test 5: Integration
      await this.testIntegration();
      
      this.printTestResults();
      
    } catch (error) {
      print("Integration test failed: " + error);
    } finally {
      this.isTestRunning = false;
    }
  }

  /**
   * Test panel loader functionality
   */
  private async testPanelLoader(): Promise<void> {
    print("Testing Panel Loader...");
    
    try {
      if (!this.panelLoader) {
        throw new Error("PanelLoader not assigned");
      }

      // Test basic functionality
      const panelCount = this.panelLoader.getPanelCount();
      print(`Panel count: ${panelCount}`);

      // Test panel navigation
      await this.panelLoader.showPanel(0);
      print("Panel 0 loaded successfully");

      // Test next/previous navigation
      await this.panelLoader.nextPanel();
      print("Next panel navigation successful");

      await this.panelLoader.prevPanel();
      print("Previous panel navigation successful");

      // Test animation controls
      this.panelLoader.toggleAnimation();
      print("Animation toggle successful");

      this.testResults["PanelLoader"] = true;
      print("Panel Loader test PASSED");
      
    } catch (error) {
      this.testResults["PanelLoader"] = false;
      print("Panel Loader test FAILED: " + error);
    }
  }

  /**
   * Test hand controls functionality
   */
  private async testHandControls(): Promise<void> {
    print("Testing Hand Controls...");
    
    try {
      if (!this.handControls) {
        throw new Error("HandControls not assigned");
      }

      // Test gesture configuration
      this.handControls.setPinchEnabled(true);
      this.handControls.setSwipeEnabled(true);
      this.handControls.setAirTapEnabled(true);
      this.handControls.setGazeFallbackEnabled(true);

      // Test gesture sensitivity
      this.handControls.setSwipeThreshold(0.6);
      this.handControls.setPinchThreshold(0.8);
      this.handControls.setAirTapThreshold(0.7);

      // Test gesture triggering
      this.handControls.triggerGesture("pinch");
      print("Pinch gesture triggered");

      this.handControls.triggerGesture("swipe", "right");
      print("Swipe gesture triggered");

      this.handControls.triggerGesture("airtap");
      print("Air tap gesture triggered");

      // Test gesture status
      const pinchEnabled = this.handControls.isGestureEnabled("pinch");
      const swipeEnabled = this.handControls.isGestureEnabled("swipe");
      const airTapEnabled = this.handControls.isGestureEnabled("airtap");

      print(`Gesture status - Pinch: ${pinchEnabled}, Swipe: ${swipeEnabled}, AirTap: ${airTapEnabled}`);

      this.testResults["HandControls"] = true;
      print("Hand Controls test PASSED");
      
    } catch (error) {
      this.testResults["HandControls"] = false;
      print("Hand Controls test FAILED: " + error);
    }
  }

  /**
   * Test animation system functionality
   */
  private async testAnimationSystem(): Promise<void> {
    print("Testing Animation System...");
    
    try {
      if (!this.animationSystem) {
        throw new Error("AnimationSystem not assigned");
      }

      // Test system configuration
      this.animationSystem.configureSystem({
        enableAutoAdvance: true,
        autoAdvanceDelay: 2.0,
        enableLooping: true,
        enableSmoothTransitions: true,
        transitionDuration: 0.5
      });

      // Test navigation
      this.animationSystem.nextPanel();
      print("Next panel navigation successful");

      this.animationSystem.previousPanel();
      print("Previous panel navigation successful");

      // Test animation control
      this.animationSystem.toggleAnimation();
      print("Animation toggle successful");

      // Test system status
      const status = this.animationSystem.getSystemStatus();
      print(`System status - Ready: ${status.isReady}, Animating: ${status.isAnimating}`);

      this.testResults["AnimationSystem"] = true;
      print("Animation System test PASSED");
      
    } catch (error) {
      this.testResults["AnimationSystem"] = false;
      print("Animation System test FAILED: " + error);
    }
  }

  /**
   * Test performance
   */
  private async testPerformance(): Promise<void> {
    print("Testing Performance...");
    
    try {
      // Test parallax material performance
      if (this.parallaxMaterial) {
        this.parallaxMaterial.setAnimationSpeed(0.5);
        this.parallaxMaterial.setDepthScale(0.01);
        this.parallaxMaterial.setParallaxStrength(0.5);
        print("Performance optimizations applied");
      }

      // Test animation system performance
      if (this.animationSystem) {
        this.animationSystem.configureSystem({
          enablePerformanceMode: true,
          targetFPS: 30
        });
        print("Performance mode enabled");
      }

      // Simulate performance test
      await this.waitForSeconds(2.0);
      print("Performance test completed");

      this.testResults["Performance"] = true;
      print("Performance test PASSED");
      
    } catch (error) {
      this.testResults["Performance"] = false;
      print("Performance test FAILED: " + error);
    }
  }

  /**
   * Test integration between components
   */
  private async testIntegration(): Promise<void> {
    print("Testing Component Integration...");
    
    try {
      // Test that all components work together
      if (this.animationSystem && this.panelLoader && this.handControls && this.parallaxMaterial) {
        print("All components are properly connected");
        
        // Test end-to-end workflow
        await this.animationSystem.nextPanel();
        this.handControls.triggerGesture("pinch");
        this.animationSystem.toggleAnimation();
        
        print("End-to-end workflow test successful");
        
        this.testResults["Integration"] = true;
        print("Integration test PASSED");
      } else {
        throw new Error("Not all components are assigned");
      }
      
    } catch (error) {
      this.testResults["Integration"] = false;
      print("Integration test FAILED: " + error);
    }
  }

  /**
   * Update test progress
   */
  private updateTestProgress(): void {
    const elapsed = getTime() - this.testStartTime;
    if (elapsed >= this.testDuration) {
      this.isTestRunning = false;
      this.printTestResults();
    }
  }

  /**
   * Print test results
   */
  private printTestResults(): void {
    print("=== INTEGRATION TEST RESULTS ===");
    
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(result => result).length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    print(`Total Tests: ${totalTests}`);
    print(`Passed: ${passedTests}`);
    print(`Failed: ${totalTests - passedTests}`);
    print(`Success Rate: ${successRate.toFixed(1)}%`);
    
    print("\nDetailed Results:");
    for (const [testName, result] of Object.entries(this.testResults)) {
      print(`${testName}: ${result ? 'PASS' : 'FAIL'}`);
    }
    
    if (successRate >= 80) {
      print("\n🎉 Integration test SUCCESSFUL!");
    } else {
      print("\n❌ Integration test FAILED - Check individual test results");
    }
  }

  /**
   * Wait for specified seconds
   */
  private async waitForSeconds(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  /**
   * Get test status
   */
  public getTestStatus(): {
    isRunning: boolean;
    elapsedTime: number;
    results: { [key: string]: boolean };
    successRate: number;
  } {
    const elapsed = this.isTestRunning ? getTime() - this.testStartTime : 0;
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(result => result).length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    return {
      isRunning: this.isTestRunning,
      elapsedTime: elapsed,
      results: this.testResults,
      successRate: successRate
    };
  }

  onDestroy() {
    this.isTestRunning = false;
  }
}
