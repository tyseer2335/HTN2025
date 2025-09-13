import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";

/**
 * Represents an individual memory orb that can be interacted with in the AR space.
 * Each orb displays as a glowing sphere and can be tapped to open its associated memory.
 *
 * @version 1.0.0
 */
@component
export class MemoryOrb extends BaseScriptComponent {
  /**
   * The visual representation of the orb (sphere mesh)
   */
  @input
  orbVisual: RenderMeshVisual;

  /**
   * Material for the orb glow effect
   */
  @input
  glowMaterial: Material;

  /**
   * Optional thumbnail image to display on the orb
   */
  @input
  thumbnailImage: Image;

  /**
   * Text component for displaying memory title
   */
  @input
  titleText: Text;

  /**
   * Base glow intensity
   */
  @input
  baseGlowIntensity: number = 1.0;

  /**
   * Pulse animation intensity
   */
  @input
  pulseIntensity: number = 0.3;

  /**
   * Orb scale when idle
   */
  @input
  idleScale: number = 1.0;

  /**
   * Orb scale when highlighted
   */
  @input
  highlightScale: number = 1.2;

  /**
   * Animation duration for scale changes
   */
  @input
  animationDuration: number = 0.3;

  private memoryData: any = null;
  private isHighlighted: boolean = false;
  private basePosition: vec3;
  private wcfmp = WorldCameraFinderProvider.getInstance();

  // Events
  public readonly onOrbTapped: EventWrapper = new EventWrapper();
  public readonly onOrbHighlighted: EventWrapper = new EventWrapper();
  public readonly onOrbUnhighlighted: EventWrapper = new EventWrapper();

  onAwake() {
    this.basePosition = this.sceneObject.getTransform().getLocalPosition();

    // Set up tap interaction
    this.createEvent("TapEvent").bind(() => {
      this.onTapped();
    });

    // Set up hover/highlight interaction
    this.createEvent("HoverEnterEvent").bind(() => {
      this.setHighlighted(true);
    });

    this.createEvent("HoverExitEvent").bind(() => {
      this.setHighlighted(false);
    });

    this.createEvent("OnStartEvent").bind(() => {
      this.initializeOrb();
    });
  }

  /**
   * Initializes the orb with default settings
   */
  private initializeOrb(): void {
    if (this.orbVisual && this.glowMaterial) {
      this.orbVisual.mainMaterial = this.glowMaterial;
      this.updateGlowIntensity(this.baseGlowIntensity);
    }

    // Set initial scale
    this.sceneObject.getTransform().setLocalScale(vec3.one().uniformScale(this.idleScale));
  }

  /**
   * Initializes the orb with memory data
   */
  public initializeWithMemory(memory: any): void {
    this.memoryData = memory;

    // Update visual elements with memory data
    if (this.titleText && memory.title) {
      this.titleText.text = memory.title;
    }

    // Set generated icon or fallback to thumbnail
    if (this.thumbnailImage) {
      const iconUrl = memory.storyboard?.generatedIconUrl || memory.generatedIconUrl || memory.thumbnailUrl;
      if (iconUrl) {
        this.loadThumbnailFromUrl(iconUrl);
      }
    }

    // Set orb color based on memory theme
    this.setOrbThemeColor(memory.theme || "default");
  }

  /**
   * Handles orb tap interaction
   */
  private onTapped(): void {
    this.onOrbTapped.trigger();
    this.playTapAnimation();
  }

  /**
   * Sets the highlighted state of the orb
   */
  public setHighlighted(highlighted: boolean): void {
    if (this.isHighlighted === highlighted) return;

    this.isHighlighted = highlighted;

    if (highlighted) {
      this.onOrbHighlighted.trigger();
      this.animateToScale(this.highlightScale);
      this.updateGlowIntensity(this.baseGlowIntensity * 1.5);
    } else {
      this.onOrbUnhighlighted.trigger();
      this.animateToScale(this.idleScale);
      this.updateGlowIntensity(this.baseGlowIntensity);
    }
  }

  /**
   * Updates the floating animation for the orb
   */
  public updateFloatingAnimation(time: number, orbIndex: number, speed: number): void {
    if (!this.basePosition) return;

    // Create subtle floating motion with offset based on orb index
    const offset = orbIndex * 0.5; // Stagger the animation
    const floatY = Math.sin((time * speed) + offset) * 5; // 5cm float range
    const floatX = Math.cos((time * speed * 0.7) + offset) * 2; // Subtle side-to-side

    const newPosition = new vec3(
      this.basePosition.x + floatX,
      this.basePosition.y + floatY,
      this.basePosition.z
    );

    this.sceneObject.getTransform().setLocalPosition(newPosition);

    // Update glow pulsing
    const pulseFactor = (Math.sin(time * speed * 2 + offset) + 1) * 0.5; // 0-1 range
    const glowIntensity = this.baseGlowIntensity + (this.pulseIntensity * pulseFactor);
    this.updateGlowIntensity(glowIntensity);
  }

  /**
   * Animates the orb to a target scale
   */
  private animateToScale(targetScale: number): void {
    const startScale = this.sceneObject.getTransform().getLocalScale().x;
    const targetScaleVec = vec3.one().uniformScale(targetScale);

    // Basic lerp animation
    let elapsed = 0;
    const updateEvent = this.createEvent("UpdateEvent");
    updateEvent.bind(() => {
      elapsed += getDeltaTime();
      const progress = Math.min(elapsed / this.animationDuration, 1);

      // Smooth interpolation
      const currentScale = startScale + (targetScale - startScale) * this.smoothStep(progress);
      this.sceneObject.getTransform().setLocalScale(vec3.one().uniformScale(currentScale));

      if (progress >= 1) {
        updateEvent.enabled = false;
      }
    });
  }

  /**
   * Plays a tap animation effect
   */
  private playTapAnimation(): void {
    // Quick scale pulse on tap
    const originalScale = this.sceneObject.getTransform().getLocalScale().x;
    const tapScale = originalScale * 0.9;

    this.sceneObject.getTransform().setLocalScale(vec3.one().uniformScale(tapScale));

    // Return to original scale after a short delay
    const delayedEvent = this.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(() => {
      this.sceneObject.getTransform().setLocalScale(vec3.one().uniformScale(originalScale));
    });
    delayedEvent.reset(0.1); // 100ms delay
  }

  /**
   * Updates the glow intensity of the orb
   */
  private updateGlowIntensity(intensity: number): void {
    if (this.glowMaterial && this.glowMaterial.mainPass) {
      // Assuming the material has an emission or glow property
      // This would need to be adjusted based on your actual material setup
      try {
        this.glowMaterial.mainPass.baseColor = new vec4(1, 1, 1, intensity);
      } catch (error) {
        // Fallback if material doesn't support this property
        print("Could not update glow intensity: " + error);
      }
    }
  }

  /**
   * Sets the orb color based on memory theme
   */
  private setOrbThemeColor(theme: string): void {
    let color = new vec4(1, 1, 1, 1); // Default white

    switch (theme.toLowerCase()) {
      case "watercolor":
        color = new vec4(0.4, 0.8, 1.0, 1); // Light blue
        break;
      case "sketch":
        color = new vec4(0.8, 0.8, 0.8, 1); // Light gray
        break;
      case "comic":
        color = new vec4(1.0, 0.6, 0.2, 1); // Orange
        break;
      case "vintage":
        color = new vec4(0.8, 0.6, 0.4, 1); // Sepia
        break;
      default:
        color = new vec4(0.6, 0.9, 0.6, 1); // Light green
        break;
    }

    if (this.glowMaterial && this.glowMaterial.mainPass) {
      try {
        this.glowMaterial.mainPass.baseColor = color;
      } catch (error) {
        print("Could not set theme color: " + error);
      }
    }
  }

  /**
   * Loads thumbnail from URL
   */
  private loadThumbnailFromUrl(url: string): void {
    print("Thumbnail loading requested: " + url);
    print("Note: Texture loading requires RemoteMediaModule setup in Lens Studio");
  }

  /**
   * Smooth step interpolation function
   */
  private smoothStep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  /**
   * Gets the memory data associated with this orb
   */
  public getMemoryData(): any {
    return this.memoryData;
  }

  /**
   * Updates the orb's position smoothly to look at the camera
   */
  public lookAtCamera(): void {
    const cameraPos = this.wcfmp.getCamera().getTransform().getWorldPosition();
    const orbPos = this.sceneObject.getTransform().getWorldPosition();
    const direction = cameraPos.sub(orbPos).normalize();

    // Make the orb face the camera (useful for thumbnail display)
    if (this.thumbnailImage) {
      const lookRotation = quat.lookRotation(direction, vec3.up());
      this.thumbnailImage.sceneObject.getTransform().setWorldRotation(lookRotation);
    }
  }
}