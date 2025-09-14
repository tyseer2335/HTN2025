import { PanelLoader } from "./PanelLoader";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class HandControls extends BaseScriptComponent {
  @ui.separator
  @ui.label("Hand Gesture Controls")
  @ui.separator
  
  @ui.group_start("Component References")
  @input
  private panelLoader: PanelLoader;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Gesture Settings")
  @input
  private enablePinchControl: boolean = true;
  
  @input
  private enableSwipeControl: boolean = true;
  
  @input
  private enableAirTapControl: boolean = true;
  
  @input
  private swipeThreshold: number = 0.6;
  
  @input
  private pinchThreshold: number = 0.8;
  
  @input
  private airTapThreshold: number = 0.7;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Timing Settings")
  @input
  private gestureCooldown: number = 0.5;
  
  @input
  private enableGazeFallback: boolean = true;
  
  @input
  private gazeDwellTime: number = 2.0;
  @ui.group_end

  // Events
  public onGestureDetected: Event<{ type: string; direction?: string }> = new Event<{ type: string; direction?: string }>();
  public onPinchDetected: Event<boolean> = new Event<boolean>();
  public onSwipeDetected: Event<string> = new Event<string>();
  public onAirTapDetected: Event<void> = new Event<void>();

  private lastGestureTime: number = 0;
  private wasPinched: boolean = false;
  private lastHandPosition: vec3 = new vec3(0, 0, 0);
  private gazeStartTime: number = 0;
  private isGazing: boolean = false;
  private lastAirTapTime: number = 0;

  onStart() {
    if (!this.panelLoader) {
      print("HandControls: PanelLoader not assigned!");
      return;
    }
  }

  onUpdate() {
    const currentTime = getTime();
    
    // Check for gesture cooldown
    if (currentTime - this.lastGestureTime < this.gestureCooldown) {
      return;
    }

    // Try hand tracking first
    if (this.detectHandGestures()) {
      return;
    }

    // Fallback to gaze control if enabled
    if (this.enableGazeFallback) {
      this.detectGazeGestures();
    }
  }

  /**
   * Detect hand-based gestures
   */
  private detectHandGestures(): boolean {
    try {
      // Get dominant hand from hand tracking
      const hand = this.getDominantHand();
      if (!hand) return false;

      // Detect pinch gesture
      if (this.enablePinchControl) {
        this.detectPinchGesture(hand);
      }

      // Detect swipe gesture
      if (this.enableSwipeControl) {
        this.detectSwipeGesture(hand);
      }

      // Detect air tap gesture
      if (this.enableAirTapControl) {
        this.detectAirTapGesture(hand);
      }

      return true;
    } catch (error) {
      // Hand tracking not available or failed
      return false;
    }
  }

  /**
   * Detect pinch gesture for play/pause
   */
  private detectPinchGesture(hand: any): void {
    const isPinched = this.isHandPinched(hand);
    
    if (isPinched && !this.wasPinched) {
      this.panelLoader.toggleAnimation();
      this.onPinchDetected.invoke(true);
      this.onGestureDetected.invoke({ type: "pinch" });
      this.lastGestureTime = getTime();
    }
    
    this.wasPinched = isPinched;
  }

  /**
   * Detect swipe gesture for navigation
   */
  private detectSwipeGesture(hand: any): void {
    const velocity = this.getHandVelocity(hand);
    const currentTime = getTime();
    
    if (Math.abs(velocity.x) > this.swipeThreshold) {
      if (velocity.x > 0) {
        this.panelLoader.nextPanel();
        this.onSwipeDetected.invoke("right");
        this.onGestureDetected.invoke({ type: "swipe", direction: "right" });
      } else {
        this.panelLoader.prevPanel();
        this.onSwipeDetected.invoke("left");
        this.onGestureDetected.invoke({ type: "swipe", direction: "left" });
      }
      this.lastGestureTime = currentTime;
    }
  }

  /**
   * Detect air tap gesture for next panel
   */
  private detectAirTapGesture(hand: any): void {
    const currentTime = getTime();
    const isTapping = this.isHandTapping(hand);
    
    if (isTapping && (currentTime - this.lastAirTapTime) > 1.0) {
      this.panelLoader.nextPanel();
      this.onAirTapDetected.invoke();
      this.onGestureDetected.invoke({ type: "airtap" });
      this.lastAirTapTime = currentTime;
      this.lastGestureTime = currentTime;
    }
  }

  /**
   * Detect gaze-based gestures as fallback
   */
  private detectGazeGestures(): void {
    try {
      const gazeTarget = this.getGazeTarget();
      if (!gazeTarget) {
        this.isGazing = false;
        this.gazeStartTime = 0;
        return;
      }

      const currentTime = getTime();
      
      if (!this.isGazing) {
        this.isGazing = true;
        this.gazeStartTime = currentTime;
      } else if (currentTime - this.gazeStartTime > this.gazeDwellTime) {
        // Gaze dwell completed - trigger next panel
        this.panelLoader.nextPanel();
        this.onGestureDetected.invoke({ type: "gaze" });
        this.lastGestureTime = currentTime;
        this.isGazing = false;
        this.gazeStartTime = 0;
      }
    } catch (error) {
      // Gaze tracking not available
      this.isGazing = false;
    }
  }

  // Helper methods for hand tracking

  private getDominantHand(): any {
    try {
      // This would use the actual Spectacles hand tracking API
      // For now, we'll simulate it
      return {
        isVisible: true,
        position: new vec3(0, 0, 0),
        velocity: new vec3(0, 0, 0),
        isPinched: false,
        isTapping: false
      };
    } catch (error) {
      return null;
    }
  }

  private isHandPinched(hand: any): boolean {
    // Simulate pinch detection
    // In real implementation, this would check hand pose
    return hand.isPinched || false;
  }

  private isHandTapping(hand: any): boolean {
    // Simulate air tap detection
    // In real implementation, this would check for quick hand movement
    return hand.isTapping || false;
  }

  private getHandVelocity(hand: any): vec3 {
    // Simulate velocity calculation
    // In real implementation, this would calculate from hand position changes
    return hand.velocity || new vec3(0, 0, 0);
  }

  private getGazeTarget(): any {
    try {
      // This would use the actual Spectacles gaze tracking API
      // For now, we'll simulate it
      return {
        isVisible: true,
        position: new vec3(0, 0, 0)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Enable/disable specific gesture types
   */
  public setPinchEnabled(enabled: boolean): void {
    this.enablePinchControl = enabled;
  }

  public setSwipeEnabled(enabled: boolean): void {
    this.enableSwipeControl = enabled;
  }

  public setAirTapEnabled(enabled: boolean): void {
    this.enableAirTapControl = enabled;
  }

  public setGazeFallbackEnabled(enabled: boolean): void {
    this.enableGazeFallback = enabled;
  }

  /**
   * Adjust gesture sensitivity
   */
  public setSwipeThreshold(threshold: number): void {
    this.swipeThreshold = threshold;
  }

  public setPinchThreshold(threshold: number): void {
    this.pinchThreshold = threshold;
  }

  public setAirTapThreshold(threshold: number): void {
    this.airTapThreshold = threshold;
  }

  /**
   * Get current gesture status
   */
  public isGestureEnabled(type: string): boolean {
    switch (type) {
      case "pinch": return this.enablePinchControl;
      case "swipe": return this.enableSwipeControl;
      case "airtap": return this.enableAirTapControl;
      case "gaze": return this.enableGazeFallback;
      default: return false;
    }
  }

  /**
   * Force trigger a gesture (for testing)
   */
  public triggerGesture(type: string, direction?: string): void {
    if (getTime() - this.lastGestureTime < this.gestureCooldown) return;

    switch (type) {
      case "pinch":
        this.panelLoader.toggleAnimation();
        this.onPinchDetected.invoke(true);
        break;
      case "swipe":
        if (direction === "right") {
          this.panelLoader.nextPanel();
        } else if (direction === "left") {
          this.panelLoader.prevPanel();
        }
        this.onSwipeDetected.invoke(direction || "right");
        break;
      case "airtap":
        this.panelLoader.nextPanel();
        this.onAirTapDetected.invoke();
        break;
    }
    
    this.onGestureDetected.invoke({ type, direction });
    this.lastGestureTime = getTime();
  }
}
