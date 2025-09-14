import { PanelLoader } from "./PanelLoader";

@component
export class ParallaxMaterial extends BaseScriptComponent {
  @ui.separator
  @ui.label("Parallax Material Controller")
  @ui.separator
  
  @ui.group_start("Material References")
  @input
  private imageComponent: Image;
  
  @input
  private parallaxMaterial: Material;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Parallax Settings")
  @input
  private depthScale: number = 0.02;
  
  @input
  private parallaxStrength: number = 1.0;
  
  @input
  private enableDepthParallax: boolean = true;
  
  @input
  private enableMaskParallax: boolean = true;
  
  @input
  private enableKenBurns: boolean = true;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Animation Settings")
  @input
  private animationSpeed: number = 1.0;
  
  @input
  private panOffset: vec2 = new vec2(0.0, 0.0);
  
  @input
  private zoomLevel: number = 1.0;
  
  @input
  private rotationAngle: number = 0.0;
  @ui.group_end

  // Private properties
  private baseUVOffset: vec2 = new vec2(0.5, 0.5);
  private currentUVOffset: vec2 = new vec2(0.5, 0.5);
  private currentScale: number = 1.0;
  private currentRotation: number = 0.0;
  private animationTime: number = 0.0;
  private isAnimating: boolean = false;

  onStart() {
    this.initializeMaterial();
  }

  onUpdate() {
    if (this.isAnimating) {
      this.updateAnimation();
    }
  }

  /**
   * Initialize the parallax material with default settings
   */
  private initializeMaterial(): void {
    if (!this.imageComponent || !this.parallaxMaterial) return;

    // Set up material properties
    this.imageComponent.mainPass.material = this.parallaxMaterial;
    
    // Set default uniforms
    this.setMaterialUniforms();
  }

  /**
   * Set up material uniforms
   */
  private setMaterialUniforms(): void {
    if (!this.imageComponent) return;

    const pass = this.imageComponent.mainPass;
    
    // Set parallax parameters
    pass.setFloat("depthScale", this.depthScale);
    pass.setFloat("parallaxStrength", this.parallaxStrength);
    pass.setFloat("animationSpeed", this.animationSpeed);
    pass.setFloat("zoomLevel", this.zoomLevel);
    pass.setFloat("rotationAngle", this.rotationAngle);
    
    // Set UV offset
    pass.setVec2("uvOffset", this.currentUVOffset);
    pass.setVec2("panOffset", this.panOffset);
  }

  /**
   * Update animation parameters
   */
  private updateAnimation(): void {
    this.animationTime += getDeltaTime() * this.animationSpeed;
    
    // Update UV offset based on animation
    this.updateUVOffset();
    
    // Update material uniforms
    this.setMaterialUniforms();
  }

  /**
   * Update UV offset for parallax effect
   */
  private updateUVOffset(): void {
    // Base UV offset
    this.currentUVOffset = this.baseUVOffset.copy();
    
    // Add pan offset
    this.currentUVOffset.x += this.panOffset.x;
    this.currentUVOffset.y += this.panOffset.y;
    
    // Add Ken Burns effect if enabled
    if (this.enableKenBurns) {
      this.updateKenBurnsEffect();
    }
    
    // Add parallax effect if enabled
    if (this.enableDepthParallax) {
      this.updateDepthParallax();
    }
  }

  /**
   * Update Ken Burns pan and zoom effect
   */
  private updateKenBurnsEffect(): void {
    // Gentle pan animation
    const panX = Math.sin(this.animationTime * 0.1) * 0.01;
    const panY = Math.cos(this.animationTime * 0.15) * 0.005;
    
    this.currentUVOffset.x += panX;
    this.currentUVOffset.y += panY;
    
    // Gentle zoom animation
    const zoomVariation = Math.sin(this.animationTime * 0.05) * 0.02;
    this.currentScale = this.zoomLevel + zoomVariation;
  }

  /**
   * Update depth-based parallax effect
   */
  private updateDepthParallax(): void {
    // This would use depth map data to create parallax
    // For now, we'll simulate it with a gentle sway
    const swayX = Math.sin(this.animationTime * 0.2) * 0.005;
    const swayY = Math.cos(this.animationTime * 0.25) * 0.003;
    
    this.currentUVOffset.x += swayX * this.parallaxStrength;
    this.currentUVOffset.y += swayY * this.parallaxStrength;
  }

  /**
   * Start parallax animation
   */
  public startAnimation(): void {
    this.isAnimating = true;
    this.animationTime = 0.0;
  }

  /**
   * Stop parallax animation
   */
  public stopAnimation(): void {
    this.isAnimating = false;
  }

  /**
   * Pause parallax animation
   */
  public pauseAnimation(): void {
    this.isAnimating = false;
  }

  /**
   * Resume parallax animation
   */
  public resumeAnimation(): void {
    this.isAnimating = true;
  }

  /**
   * Set depth scale for parallax effect
   */
  public setDepthScale(scale: number): void {
    this.depthScale = scale;
    if (this.imageComponent) {
      this.imageComponent.mainPass.setFloat("depthScale", scale);
    }
  }

  /**
   * Set parallax strength
   */
  public setParallaxStrength(strength: number): void {
    this.parallaxStrength = strength;
    if (this.imageComponent) {
      this.imageComponent.mainPass.setFloat("parallaxStrength", strength);
    }
  }

  /**
   * Set animation speed
   */
  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
    if (this.imageComponent) {
      this.imageComponent.mainPass.setFloat("animationSpeed", speed);
    }
  }

  /**
   * Set zoom level
   */
  public setZoomLevel(zoom: number): void {
    this.zoomLevel = zoom;
    this.currentScale = zoom;
    if (this.imageComponent) {
      this.imageComponent.mainPass.setFloat("zoomLevel", zoom);
    }
  }

  /**
   * Set pan offset
   */
  public setPanOffset(offset: vec2): void {
    this.panOffset = offset.copy();
    if (this.imageComponent) {
      this.imageComponent.mainPass.setVec2("panOffset", offset);
    }
  }

  /**
   * Set rotation angle
   */
  public setRotationAngle(angle: number): void {
    this.rotationAngle = angle;
    this.currentRotation = angle;
    if (this.imageComponent) {
      this.imageComponent.mainPass.setFloat("rotationAngle", angle);
    }
  }

  /**
   * Enable/disable depth parallax
   */
  public setDepthParallaxEnabled(enabled: boolean): void {
    this.enableDepthParallax = enabled;
  }

  /**
   * Enable/disable mask parallax
   */
  public setMaskParallaxEnabled(enabled: boolean): void {
    this.enableMaskParallax = enabled;
  }

  /**
   * Enable/disable Ken Burns effect
   */
  public setKenBurnsEnabled(enabled: boolean): void {
    this.enableKenBurns = enabled;
  }

  /**
   * Apply Ken Burns animation with specific parameters
   */
  public applyKenBurnsAnimation(config: {
    startScale: number;
    endScale: number;
    panX: number;
    panY: number;
    duration: number;
  }): void {
    // This would integrate with the tween system
    // For now, we'll set the parameters directly
    this.zoomLevel = config.endScale;
    this.panOffset.x = config.panX;
    this.panOffset.y = config.panY;
    
    this.setMaterialUniforms();
  }

  /**
   * Reset to default state
   */
  public resetToDefault(): void {
    this.currentUVOffset = new vec2(0.5, 0.5);
    this.currentScale = 1.0;
    this.currentRotation = 0.0;
    this.animationTime = 0.0;
    this.panOffset = new vec2(0.0, 0.0);
    this.zoomLevel = 1.0;
    
    this.setMaterialUniforms();
  }

  /**
   * Get current animation state
   */
  public getAnimationState(): {
    isAnimating: boolean;
    animationTime: number;
    uvOffset: vec2;
    scale: number;
    rotation: number;
  } {
    return {
      isAnimating: this.isAnimating,
      animationTime: this.animationTime,
      uvOffset: this.currentUVOffset.copy(),
      scale: this.currentScale,
      rotation: this.currentRotation
    };
  }

  onDestroy() {
    this.stopAnimation();
  }
}
