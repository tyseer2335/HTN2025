import { AnimationSystem } from "./AnimationSystem";
import { PanelLoader } from "./PanelLoader";
import { HandControls } from "./HandControls";
import { ParallaxMaterial } from "./ParallaxMaterial";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class AnimationExample extends BaseScriptComponent {
  @ui.separator
  @ui.label("Animation System Example")
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
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Demo Settings")
  @input
  private enableDemoMode: boolean = true;
  
  @input
  private demoDuration: number = 10.0;
  
  @input
  private enableAutoDemo: boolean = false;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("UI Controls")
  @ui.label("Start Demo")
  @ui.button
  private startDemo(): void {
    this.runDemo();
  }
  
  @ui.label("Stop Demo")
  @ui.button
  private stopDemo(): void {
    this.stopDemo();
  }
  
  @ui.label("Next Panel")
  @ui.button
  private nextPanel(): void {
    this.animationSystem.nextPanel();
  }
  
  @ui.label("Previous Panel")
  @ui.button
  private prevPanel(): void {
    this.animationSystem.previousPanel();
  }
  
  @ui.label("Toggle Animation")
  @ui.button
  private toggleAnimation(): void {
    this.animationSystem.toggleAnimation();
  }
  @ui.group_end

  // Events
  public onDemoStarted: Event<void> = new Event<void>();
  public onDemoCompleted: Event<void> = new Event<void>();
  public onStatusUpdate: Event<string> = new Event<string>();

  private isDemoRunning: boolean = false;
  private demoStartTime: number = 0;

  onStart() {
    this.setupEventListeners();
    this.initializeDemo();
  }

  onUpdate() {
    if (this.isDemoRunning) {
      this.updateDemo();
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (this.animationSystem) {
      this.animationSystem.onSystemReady.add(() => {
        this.onStatusUpdate.invoke("Animation System Ready");
      });
      
      this.animationSystem.onAnimationStarted.add((data) => {
        this.onStatusUpdate.invoke(`Animation Started: ${data.animationType} on panel ${data.panelIndex}`);
      });
      
      this.animationSystem.onAnimationCompleted.add((data) => {
        this.onStatusUpdate.invoke(`Animation Completed on panel ${data.panelIndex}`);
      });
      
      this.animationSystem.onTransitionStarted.add((data) => {
        this.onStatusUpdate.invoke(`Transition: ${data.fromIndex} → ${data.toIndex}`);
      });
    }

    if (this.handControls) {
      this.handControls.onGestureDetected.add((data) => {
        this.onStatusUpdate.invoke(`Gesture: ${data.type} ${data.direction || ''}`);
      });
    }
  }

  /**
   * Initialize demo
   */
  private async initializeDemo(): Promise<void> {
    try {
      // Configure animation system
      this.animationSystem.configureSystem({
        enableAutoAdvance: true,
        autoAdvanceDelay: 5.0,
        enableLooping: true,
        enableSmoothTransitions: true,
        transitionDuration: 1.0
      });

      // Configure hand controls
      this.handControls.setPinchEnabled(true);
      this.handControls.setSwipeEnabled(true);
      this.handControls.setAirTapEnabled(true);
      this.handControls.setGazeFallbackEnabled(true);

      // Configure parallax material
      this.parallaxMaterial.setDepthScale(0.02);
      this.parallaxMaterial.setParallaxStrength(1.0);
      this.parallaxMaterial.setAnimationSpeed(1.0);
      this.parallaxMaterial.setKenBurnsEnabled(true);
      this.parallaxMaterial.setDepthParallaxEnabled(true);

      this.onStatusUpdate.invoke("Demo initialized successfully");
    } catch (error) {
      this.onStatusUpdate.invoke("Demo initialization failed: " + error);
    }
  }

  /**
   * Run the complete demo
   */
  private async runDemo(): Promise<void> {
    if (this.isDemoRunning) return;

    this.isDemoRunning = true;
    this.demoStartTime = getTime();
    this.onDemoStarted.invoke();
    this.onStatusUpdate.invoke("Demo started - showing all animation types");

    try {
      // Show different animation types
      await this.demonstrateKenBurns();
      await this.demonstrateParallax();
      await this.demonstrateVideo();
      await this.demonstrateGestures();

      this.onStatusUpdate.invoke("Demo completed successfully");
    } catch (error) {
      this.onStatusUpdate.invoke("Demo failed: " + error);
    } finally {
      this.isDemoRunning = false;
      this.onDemoCompleted.invoke();
    }
  }

  /**
   * Stop the demo
   */
  private stopDemo(): void {
    this.isDemoRunning = false;
    this.onStatusUpdate.invoke("Demo stopped");
  }

  /**
   * Update demo state
   */
  private updateDemo(): void {
    if (!this.enableAutoDemo) return;

    const elapsed = getTime() - this.demoStartTime;
    if (elapsed >= this.demoDuration) {
      this.stopDemo();
    }
  }

  /**
   * Demonstrate Ken Burns animation
   */
  private async demonstrateKenBurns(): Promise<void> {
    this.onStatusUpdate.invoke("Demonstrating Ken Burns animation...");
    
    // Configure for Ken Burns
    this.parallaxMaterial.setKenBurnsEnabled(true);
    this.parallaxMaterial.setDepthParallaxEnabled(false);
    
    // Apply Ken Burns animation
    this.parallaxMaterial.applyKenBurnsAnimation({
      startScale: 1.0,
      endScale: 1.12,
      panX: 0.02,
      panY: 0.01,
      duration: 4.0
    });
    
    // Wait for animation
    await this.waitForSeconds(4.0);
  }

  /**
   * Demonstrate parallax animation
   */
  private async demonstrateParallax(): Promise<void> {
    this.onStatusUpdate.invoke("Demonstrating parallax animation...");
    
    // Configure for parallax
    this.parallaxMaterial.setKenBurnsEnabled(false);
    this.parallaxMaterial.setDepthParallaxEnabled(true);
    this.parallaxMaterial.setDepthScale(0.03);
    this.parallaxMaterial.setParallaxStrength(1.2);
    
    // Wait for animation
    await this.waitForSeconds(4.0);
  }

  /**
   * Demonstrate video animation
   */
  private async demonstrateVideo(): Promise<void> {
    this.onStatusUpdate.invoke("Demonstrating video animation...");
    
    // Configure for video
    this.parallaxMaterial.setKenBurnsEnabled(false);
    this.parallaxMaterial.setDepthParallaxEnabled(false);
    
    // Wait for animation
    await this.waitForSeconds(4.0);
  }

  /**
   * Demonstrate gesture controls
   */
  private async demonstrateGestures(): Promise<void> {
    this.onStatusUpdate.invoke("Demonstrating gesture controls...");
    
    // Simulate gesture inputs
    this.handControls.triggerGesture("pinch");
    await this.waitForSeconds(1.0);
    
    this.handControls.triggerGesture("swipe", "right");
    await this.waitForSeconds(1.0);
    
    this.handControls.triggerGesture("swipe", "left");
    await this.waitForSeconds(1.0);
    
    this.handControls.triggerGesture("airtap");
    await this.waitForSeconds(1.0);
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
   * Get system status
   */
  public getSystemStatus(): any {
    return this.animationSystem.getSystemStatus();
  }

  /**
   * Get demo status
   */
  public getDemoStatus(): {
    isRunning: boolean;
    elapsedTime: number;
    remainingTime: number;
  } {
    const elapsed = this.isDemoRunning ? getTime() - this.demoStartTime : 0;
    const remaining = Math.max(0, this.demoDuration - elapsed);
    
    return {
      isRunning: this.isDemoRunning,
      elapsedTime: elapsed,
      remainingTime: remaining
    };
  }

  /**
   * Configure demo settings
   */
  public configureDemo(config: {
    enableDemoMode?: boolean;
    demoDuration?: number;
    enableAutoDemo?: boolean;
  }): void {
    if (config.enableDemoMode !== undefined) {
      this.enableDemoMode = config.enableDemoMode;
    }
    if (config.demoDuration !== undefined) {
      this.demoDuration = config.demoDuration;
    }
    if (config.enableAutoDemo !== undefined) {
      this.enableAutoDemo = config.enableAutoDemo;
    }
  }

  /**
   * Test specific animation type
   */
  public testAnimationType(type: string): void {
    switch (type) {
      case "kenburns":
        this.demonstrateKenBurns();
        break;
      case "parallax":
        this.demonstrateParallax();
        break;
      case "video":
        this.demonstrateVideo();
        break;
      case "gestures":
        this.demonstrateGestures();
        break;
      default:
        this.onStatusUpdate.invoke("Unknown animation type: " + type);
    }
  }

  onDestroy() {
    this.stopDemo();
  }
}
