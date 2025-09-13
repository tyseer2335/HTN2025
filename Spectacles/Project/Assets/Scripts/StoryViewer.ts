import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";
import { LSTween } from "LSTween.lspkg/LSTween";

/**
 * StoryViewer - Phase 1: Initial Dot Implementation
 * Single dot appears at starting position when button is clicked
 */
@component
export class StoryViewer extends BaseScriptComponent {
  @ui.separator
  @ui.label("Story Viewer - Phase 1: Initial Dot")
  
  // Core Components
  @input
  @hint("Button to trigger the story generation sequence")
  private generateButton: PinchButton;
  
  @input
  @hint("Initial dot that appears when generation starts")
  private initialDot: SceneObject;
  
  // Optional line that will expand from the dot
  @input
  @hint("Optional: line visual that will be scaled to form a line")
  private lineVisual: SceneObject;
  
  // Visual Feedback Elements
  @input
  @hint("Optional: Text component on button for state feedback")
  private buttonText: Text;
  
  @input
  @hint("Optional: Status display text")
  private statusDisplay: Text;
  
  @input
  @hint("Optional: Material for button color changes")
  private buttonMaterial: Material;
  
  // Phase 1 Settings
  @ui.separator
  @ui.label("Phase 1 Configuration")
  
  @input
  @hint("Duration for initial dot appearance (in seconds)")
  private dotAppearDuration: number = 0.8;
  
  @input
  @hint("Duration for line expansion (in seconds)")
  private lineExpandDuration: number = 0.6;
  
  @input
  @hint("Length the line should expand to (local scale X)")
  private lineTargetLength: number = 0.6;
  
  @input
  @hint("Local offset from button top where the dot should appear")
  private dotOffset: vec3 = new vec3(0, 0.06, 0);
  
  // Internal state
  private isAnimating: boolean = false;
  private currentTween: any = null;
  
  onAwake() {
    // attach onGenerateButtonPressed to generateButton
    this.createEvent("OnStartEvent").bind(() => {
      
      // Set up button click handler
      this.generateButton.onButtonPinched.add(() => {
        this.onGenerateButtonPressed();
      });
    });
    
    // ensure visuals start hidden
    // if (this.initialDot) {
    //   // this.initialDot.enabled = false;
    //   this.initialDot.getTransform().setLocalScale(vec3.zero());
    // }
    // if (this.lineVisual) {
    //   // this.lineVisual.enabled = false;
    //   // assume line is scaled along X for length
    //   this.lineVisual.getTransform().setLocalScale(new vec3(0.01,1,1));
    // }
    
    if (this.buttonText) this.buttonText.text = "Start Story";
    if (this.statusDisplay) this.statusDisplay.text = "Ready";
  }
  
  private onGenerateButtonPressed() {
    this.startPhase1();
  }
  
  private startPhase1() {
    this.isAnimating = true;
    print("StoryViewer: Starting Phase 1 - isAnimating set to true");
    
    // visual feedback: disable further presses logically
    if (this.buttonText) this.buttonText.text = "Generating...";
    if (this.statusDisplay) this.statusDisplay.text = "Starting...";
    
    // compute starting world position (top of button)
    let startWorldPos: vec3;
    try {
      const btnTransform = this.generateButton.sceneObject.getTransform();
      startWorldPos = btnTransform.getWorldPosition().add(this.dotOffset);
    } catch (e) {
      // fallback to component transform
      startWorldPos = this.getTransform().getWorldPosition().add(this.dotOffset);
    }
    
    // show and animate dot
    if (!this.initialDot) {
      print("StoryViewer: initialDot not assigned");
      this.completePhase1();
      return;
    }
    
    this.initialDot.getTransform().setWorldPosition(startWorldPos);
    this.initialDot.getTransform().setLocalScale(vec3.zero());
    this.initialDot.enabled = true;
    if (this.statusDisplay) this.statusDisplay.text = "Dot appearing...";
    
     const durationMs = Math.max(1, this.dotAppearDuration * 1000);
    
    // First animate dot appearing (scale up)
    this.currentTween = LSTween.scaleToLocal(
      this.initialDot.getTransform(),
      vec3.one(),
      durationMs * 0.3 // 30% of duration for appearance
    )
      .onComplete(() => {
        // After dot appears, animate bounce up
        this.animateDotBounce(startWorldPos);
      });
    this.currentTween.start();
  }

  private animateDotBounce(startWorldPos: vec3) {
    if (!this.initialDot) {
      this.completePhase1();
      return;
    }

    const bounceHeight = 0.1; // How high to bounce (in world units)
    const bounceUpPos = startWorldPos.add(new vec3(0, bounceHeight, 0));
    const bounceDuration = Math.max(1, this.dotAppearDuration * 500); // Half duration for bounce

    // Animate bounce up
    this.currentTween = LSTween.moveToWorld(
      this.initialDot.getTransform(),
      bounceUpPos,
      bounceDuration
    )
      .onComplete(() => {
        // Animate bounce down
        this.currentTween = LSTween.moveToWorld(
          this.initialDot.getTransform(),
          startWorldPos,
          bounceDuration
        )
          .onComplete(() => {
            // After bounce, make dot disappear and start line if available
            this.animateDotDisappear(startWorldPos);
          });
        this.currentTween.start();
      });
    this.currentTween.start();
  }

  private animateDotDisappear(startWorldPos: vec3) {
    if (!this.initialDot) {
      this.completePhase1();
      return;
    }

    const disappearDuration = Math.max(1, this.dotAppearDuration * 300); // 30% of duration for disappearing

    // Scale down to disappear
    this.currentTween = LSTween.scaleToLocal(
      this.initialDot.getTransform(),
      vec3.zero(),
      disappearDuration
    )
      .onComplete(() => {
        // Hide the dot completely
        this.initialDot.enabled = false;
        
        // After dot disappears, start line expansion if provided
        if (this.lineVisual) {
          this.animateLineFromDot(startWorldPos);
        } else {
          this.completePhase1();
        }
      });
    this.currentTween.start();
  }
  
  private animateLineFromDot(startWorldPos: vec3) {
    if (!this.lineVisual) {
      this.completePhase1();
      return;
    }
    
    // position line at dot (assumes line's pivot is at its left end)
    const lineT = this.lineVisual.getTransform();
    lineT.setWorldPosition(startWorldPos);
    lineT.setLocalScale(new vec3(0.001, 1, 1));
    this.lineVisual.enabled = true;
    if (this.statusDisplay) this.statusDisplay.text = "Extending line...";
    
    const durationMs = Math.max(1, this.lineExpandDuration * 1000);
    this.currentTween = LSTween.scaleToLocal(
      lineT,
      new vec3(this.lineTargetLength, 1, 1),
      durationMs
    )
      .onComplete(() => {
        if (this.statusDisplay) this.statusDisplay.text = "Phase 1 complete";
        this.completePhase1();
      });
    this.currentTween.start();
  }
  
  private completePhase1() {
    this.isAnimating = false;
    if (this.buttonText) this.buttonText.text = "Start Story";
    if (this.statusDisplay) this.statusDisplay.text = "Ready";
    this.currentTween = null;
    // keep visuals visible for now; later phases will continue sequence
  }
  
  // optional: a reset helper
  public resetPhase1() {
    if (this.currentTween && this.currentTween.cancel) this.currentTween.cancel();
    this.isAnimating = false;
    if (this.initialDot) {
      this.initialDot.enabled = false;
      this.initialDot.getTransform().setLocalScale(vec3.zero());
    }
    if (this.lineVisual) {
      this.lineVisual.enabled = false;
      this.lineVisual.getTransform().setLocalScale(new vec3(0.001,1,1));
    }
    if (this.buttonText) this.buttonText.text = "Start Story";
    if (this.statusDisplay) this.statusDisplay.text = "Ready";
  }
}