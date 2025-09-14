import { PanelLoader } from "./PanelLoader";
import { HandControls } from "./HandControls";
import { ParallaxMaterial } from "./ParallaxMaterial";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class AnimationSystem extends BaseScriptComponent {
  @ui.separator
  @ui.label("Animation System - Complete Pipeline")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  private panelLoader: PanelLoader;
  
  @input
  private handControls: HandControls;
  
  @input
  private parallaxMaterial: ParallaxMaterial;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Animation Settings")
  @input
  private enableAutoAdvance: boolean = true;
  
  @input
  private autoAdvanceDelay: number = 5.0;
  
  @input
  private enableLooping: boolean = true;
  
  @input
  private enableSmoothTransitions: boolean = true;
  
  @input
  private transitionDuration: number = 1.0;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Performance Settings")
  @input
  private maxConcurrentAnimations: number = 2;
  
  @input
  private enablePerformanceMode: boolean = false;
  
  @input
  private targetFPS: number = 30;
  @ui.group_end

  // Events
  public onAnimationStarted: Event<{ panelIndex: number; animationType: string }> = new Event<{ panelIndex: number; animationType: string }>();
  public onAnimationCompleted: Event<{ panelIndex: number }> = new Event<{ panelIndex: number }>();
  public onTransitionStarted: Event<{ fromIndex: number; toIndex: number }> = new Event<{ fromIndex: number; toIndex: number }>();
  public onSystemReady: Event<void> = new Event<void>();

  private isSystemReady: boolean = false;
  private currentAnimationType: string = "none";
  private autoAdvanceTimer: number = 0;
  private performanceTimer: number = 0;
  private frameCount: number = 0;
  private lastFPSCheck: number = 0;

  onStart() {
    this.initializeSystem();
  }

  onUpdate() {
    if (!this.isSystemReady) return;

    this.updateAutoAdvance();
    this.updatePerformanceMonitoring();
    this.updateAnimationState();
  }

  /**
   * Initialize the complete animation system
   */
  private async initializeSystem(): Promise<void> {
    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize components
      await this.initializeComponents();
      
      // Start the system
      this.startSystem();
      
      this.isSystemReady = true;
      this.onSystemReady.invoke();
      
      print("Animation System initialized successfully");
    } catch (error) {
      print("Failed to initialize Animation System: " + error);
    }
  }

  /**
   * Set up event listeners between components
   */
  private setupEventListeners(): void {
    if (this.panelLoader) {
      this.panelLoader.onPanelChanged.add((data) => {
        this.handlePanelChanged(data);
      });
      
      this.panelLoader.onAnimationComplete.add((data) => {
        this.handleAnimationComplete(data);
      });
      
      this.panelLoader.onError.add((error) => {
        this.handleError(error);
      });
    }

    if (this.handControls) {
      this.handControls.onGestureDetected.add((data) => {
        this.handleGestureDetected(data);
      });
    }
  }

  /**
   * Initialize all components
   */
  private async initializeComponents(): Promise<void> {
    // Initialize panel loader with sample data
    if (this.panelLoader) {
      await this.panelLoader.showPanel(0);
    }

    // Initialize hand controls
    if (this.handControls) {
      // Hand controls are ready
    }

    // Initialize parallax material
    if (this.parallaxMaterial) {
      this.parallaxMaterial.startAnimation();
    }
  }

  /**
   * Start the animation system
   */
  private startSystem(): void {
    this.currentAnimationType = "kenburns";
    this.autoAdvanceTimer = 0;
    this.performanceTimer = 0;
    this.frameCount = 0;
    this.lastFPSCheck = getTime();
  }

  /**
   * Update auto-advance functionality
   */
  private updateAutoAdvance(): void {
    if (!this.enableAutoAdvance || !this.panelLoader) return;

    this.autoAdvanceTimer += getDeltaTime();
    
    if (this.autoAdvanceTimer >= this.autoAdvanceDelay) {
      this.advanceToNextPanel();
      this.autoAdvanceTimer = 0;
    }
  }

  /**
   * Update performance monitoring
   */
  private updatePerformanceMonitoring(): void {
    if (!this.enablePerformanceMode) return;

    this.frameCount++;
    this.performanceTimer += getDeltaTime();
    
    if (this.performanceTimer >= 1.0) {
      const currentFPS = this.frameCount / this.performanceTimer;
      
      if (currentFPS < this.targetFPS) {
        this.optimizePerformance();
      }
      
      this.frameCount = 0;
      this.performanceTimer = 0;
    }
  }

  /**
   * Update animation state
   */
  private updateAnimationState(): void {
    if (!this.panelLoader) return;

    // Check if we need to start a new animation
    if (!this.panelLoader.isCurrentlyAnimating()) {
      this.startNextAnimation();
    }
  }

  /**
   * Handle panel change events
   */
  private handlePanelChanged(data: { index: number; panel: any }): void {
    this.currentAnimationType = data.panel.anim?.type || "kenburns";
    this.autoAdvanceTimer = 0;
    
    // Start appropriate animation
    this.startAnimationForPanel(data.panel);
  }

  /**
   * Handle animation completion events
   */
  private handleAnimationComplete(data: { panelIndex: number }): void {
    this.onAnimationCompleted.invoke(data);
    
    // Auto-advance if enabled
    if (this.enableAutoAdvance) {
      this.advanceToNextPanel();
    }
  }

  /**
   * Handle gesture detection events
   */
  private handleGestureDetected(data: { type: string; direction?: string }): void {
    switch (data.type) {
      case "pinch":
        this.toggleAnimation();
        break;
      case "swipe":
        if (data.direction === "right") {
          this.nextPanel();
        } else if (data.direction === "left") {
          this.previousPanel();
        }
        break;
      case "airtap":
        this.nextPanel();
        break;
    }
  }

  /**
   * Handle error events
   */
  private handleError(error: string): void {
    print("Animation System Error: " + error);
  }

  /**
   * Start animation for a specific panel
   */
  private startAnimationForPanel(panel: any): void {
    if (!this.parallaxMaterial) return;

    const animConfig = panel.anim || {};
    const animationType = animConfig.type || "kenburns";

    switch (animationType) {
      case "kenburns":
        this.startKenBurnsAnimation(animConfig);
        break;
      case "parallax":
        this.startParallaxAnimation(animConfig);
        break;
      case "video":
        this.startVideoAnimation(animConfig);
        break;
      default:
        this.startDefaultAnimation();
    }

    this.onAnimationStarted.invoke({ 
      panelIndex: this.panelLoader.getCurrentIndex(), 
      animationType: animationType 
    });
  }

  /**
   * Start Ken Burns animation
   */
  private startKenBurnsAnimation(config: any): void {
    if (!this.parallaxMaterial) return;

    this.parallaxMaterial.applyKenBurnsAnimation({
      startScale: 1.0,
      endScale: config.zoom || 1.08,
      panX: config.pan?.[0] || 0.0,
      panY: config.pan?.[1] || 0.02,
      duration: config.duration || 4.0
    });

    this.parallaxMaterial.setKenBurnsEnabled(true);
    this.parallaxMaterial.setDepthParallaxEnabled(false);
  }

  /**
   * Start parallax animation
   */
  private startParallaxAnimation(config: any): void {
    if (!this.parallaxMaterial) return;

    this.parallaxMaterial.setDepthScale(config.depthScale || 0.02);
    this.parallaxMaterial.setParallaxStrength(config.strength || 1.0);
    this.parallaxMaterial.setKenBurnsEnabled(false);
    this.parallaxMaterial.setDepthParallaxEnabled(true);
  }

  /**
   * Start video animation
   */
  private startVideoAnimation(config: any): void {
    // Video animations are handled by the panel loader
    this.parallaxMaterial.setKenBurnsEnabled(false);
    this.parallaxMaterial.setDepthParallaxEnabled(false);
  }

  /**
   * Start default animation
   */
  private startDefaultAnimation(): void {
    if (!this.parallaxMaterial) return;

    this.parallaxMaterial.setKenBurnsEnabled(true);
    this.parallaxMaterial.setDepthParallaxEnabled(false);
  }

  /**
   * Start next animation
   */
  private startNextAnimation(): void {
    if (!this.panelLoader) return;

    const currentPanel = this.panelLoader.getCurrentIndex();
    this.startAnimationForPanel(this.panelLoader.panels[currentPanel]);
  }

  /**
   * Advance to next panel
   */
  private advanceToNextPanel(): void {
    if (!this.panelLoader) return;

    const currentIndex = this.panelLoader.getCurrentIndex();
    const nextIndex = (currentIndex + 1) % this.panelLoader.getPanelCount();
    
    if (nextIndex === 0 && !this.enableLooping) {
      return; // Don't loop if disabled
    }

    this.onTransitionStarted.invoke({ fromIndex: currentIndex, toIndex: nextIndex });
    this.panelLoader.showPanel(nextIndex);
  }

  /**
   * Navigate to next panel
   */
  public nextPanel(): void {
    if (this.panelLoader) {
      this.panelLoader.nextPanel();
    }
  }

  /**
   * Navigate to previous panel
   */
  public previousPanel(): void {
    if (this.panelLoader) {
      this.panelLoader.prevPanel();
    }
  }

  /**
   * Toggle animation play/pause
   */
  public toggleAnimation(): void {
    if (this.panelLoader) {
      this.panelLoader.toggleAnimation();
    }
  }

  /**
   * Optimize performance
   */
  private optimizePerformance(): void {
    if (this.parallaxMaterial) {
      this.parallaxMaterial.setAnimationSpeed(0.5);
    }
  }

  /**
   * Get system status
   */
  public getSystemStatus(): {
    isReady: boolean;
    currentAnimationType: string;
    isAnimating: boolean;
    currentPanelIndex: number;
    totalPanels: number;
  } {
    return {
      isReady: this.isSystemReady,
      currentAnimationType: this.currentAnimationType,
      isAnimating: this.panelLoader?.isCurrentlyAnimating() || false,
      currentPanelIndex: this.panelLoader?.getCurrentIndex() || 0,
      totalPanels: this.panelLoader?.getPanelCount() || 0
    };
  }

  /**
   * Configure system settings
   */
  public configureSystem(config: {
    enableAutoAdvance?: boolean;
    autoAdvanceDelay?: number;
    enableLooping?: boolean;
    enableSmoothTransitions?: boolean;
    transitionDuration?: number;
  }): void {
    if (config.enableAutoAdvance !== undefined) {
      this.enableAutoAdvance = config.enableAutoAdvance;
    }
    if (config.autoAdvanceDelay !== undefined) {
      this.autoAdvanceDelay = config.autoAdvanceDelay;
    }
    if (config.enableLooping !== undefined) {
      this.enableLooping = config.enableLooping;
    }
    if (config.enableSmoothTransitions !== undefined) {
      this.enableSmoothTransitions = config.enableSmoothTransitions;
    }
    if (config.transitionDuration !== undefined) {
      this.transitionDuration = config.transitionDuration;
    }
  }

  onDestroy() {
    if (this.parallaxMaterial) {
      this.parallaxMaterial.stopAnimation();
    }
  }
}
