import { setTimeout } from "SpectaclesInteractionKit.lspkg/Utils/FunctionTimingUtils";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

@component
export class PanelLoader extends BaseScriptComponent {
  @ui.separator
  @ui.label("Panel Loader - Animation Pipeline")
  @ui.separator
  
  @ui.group_start("Scene References")
  @input
  private galleryRoot: SceneObject;
  
  @input
  private screenImagePrefab: SceneObject;
  
  @input
  private videoPlayerPrefab: SceneObject;
  
  @input
  private textTitle: Text;
  
  @input
  private textDesc: Text;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Animation Settings")
  @input
  private defaultDuration: number = 4.0;
  
  @input
  private defaultZoom: number = 1.08;
  
  @input
  private defaultPanX: number = 0.0;
  
  @input
  private defaultPanY: number = 0.02;
  
  @input
  private depthScale: number = 0.02;
  @ui.group_end
  
  @ui.separator
  @ui.group_start("Performance Settings")
  @input
  private maxTextureSize: number = 2048;
  
  @input
  private enableParallax: boolean = true;
  
  @input
  private enableKenBurns: boolean = true;
  @ui.group_end

  // Events
  public onPanelChanged: Event<{ index: number; panel: any }> = new Event<{ index: number; panel: any }>();
  public onAnimationComplete: Event<{ panelIndex: number }> = new Event<{ panelIndex: number }>();
  public onError: Event<string> = new Event<string>();

  private panels: any[] = [];
  private currentIndex: number = 0;
  private isAnimating: boolean = false;
  private currentPanel: any = null;
  private animationTween: any = null;

  async onAwake() {
    // Initialize with sample data for testing
    this.panels = this.getSamplePanels();
    await this.showPanel(0);
  }

  /**
   * Load story data from RSG endpoint
   */
  public async loadStoryFromRSG(storyUrl: string): Promise<void> {
    try {
      const storyMeta = await this.fetchJSONViaRSG(storyUrl);
      this.panels = storyMeta.panels || [];
      await this.showPanel(0);
    } catch (error) {
      this.onError.invoke("Failed to load story: " + error);
    }
  }

  /**
   * Show specific panel by index
   */
  public async showPanel(index: number): Promise<void> {
    if (this.panels.length === 0) return;
    
    this.currentIndex = (index + this.panels.length) % this.panels.length;
    this.currentPanel = this.panels[this.currentIndex];
    
    // Update UI
    if (this.textTitle) {
      this.textTitle.text = this.currentPanel.title || "";
    }
    if (this.textDesc) {
      this.textDesc.text = this.currentPanel.description || "";
    }

    // Stop current animation
    this.stopCurrentAnimation();

    // Load and display panel
    if (this.currentPanel.videoUrl) {
      await this.spawnVideo(this.currentPanel.videoUrl, this.currentPanel.anim?.duration ?? this.defaultDuration);
    } else {
      await this.spawnImage(this.currentPanel);
    }

    this.onPanelChanged.invoke({ index: this.currentIndex, panel: this.currentPanel });
  }

  /**
   * Navigate to next panel
   */
  public async nextPanel(): Promise<void> {
    await this.showPanel(this.currentIndex + 1);
  }

  /**
   * Navigate to previous panel
   */
  public async prevPanel(): Promise<void> {
    await this.showPanel(this.currentIndex - 1);
  }

  /**
   * Toggle animation play/pause
   */
  public toggleAnimation(): void {
    if (this.isAnimating) {
      this.pauseAnimation();
    } else {
      this.resumeAnimation();
    }
  }

  /**
   * Pause current animation
   */
  public pauseAnimation(): void {
    if (this.animationTween) {
      // Pause animation tween
      this.isAnimating = false;
    }
  }

  /**
   * Resume current animation
   */
  public resumeAnimation(): void {
    if (this.animationTween) {
      // Resume animation tween
      this.isAnimating = true;
    }
  }

  /**
   * Stop current animation
   */
  public stopCurrentAnimation(): void {
    if (this.animationTween) {
      // Stop animation tween
      this.animationTween = null;
    }
    this.isAnimating = false;
  }

  /**
   * Get current panel index
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get total panel count
   */
  public getPanelCount(): number {
    return this.panels.length;
  }

  /**
   * Check if currently animating
   */
  public isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  // Private methods

  private async fetchJSONViaRSG(url: string): Promise<any> {
    try {
      // Use Remote Service Gateway to fetch JSON data
      // Note: This would use the actual RSG API in production
      // For now, we'll use sample data
      return this.getSamplePanels();
    } catch (error) {
      // Fallback to sample data for demo
      return this.getSamplePanels();
    }
  }

  private async spawnVideo(url: string, duration: number): Promise<void> {
    if (!this.galleryRoot || !this.videoPlayerPrefab) return;

    // Clear existing content
    // Note: This would use the actual SceneObject API in production
    // For now, we'll simulate the behavior
    
    // Create video player
    // Note: This would use the actual prefab system in production
    // For now, we'll simulate the behavior
    
    // Auto-advance after duration
    setTimeout(() => {
      this.nextPanel();
    }, duration * 1000);
  }

  private async spawnImage(panel: any): Promise<void> {
    if (!this.galleryRoot || !this.screenImagePrefab) return;

    // Clear existing content
    // Note: This would use the actual SceneObject API in production
    // For now, we'll simulate the behavior
    
    // Create image object
    // Note: This would use the actual prefab system in production
    // For now, we'll simulate the behavior
    const imageComponent = null as any;
    
    if (!imageComponent) return;

    try {
      // Load main image
      const mainTexture = await this.loadTextureViaRSG(panel.imageUrl);
      if (mainTexture) {
        imageComponent.mainPass.baseTex = mainTexture;
      }

      // Load depth map if available
      if (panel.depthUrl && this.enableParallax) {
        const depthTexture = await this.loadTextureViaRSG(panel.depthUrl);
        if (depthTexture) {
          imageComponent.mainPass.setTexture("depthTex", depthTexture);
          imageComponent.mainPass.setFloat("depthScale", this.depthScale);
        }
      }

      // Load mask if available
      if (panel.maskUrl) {
        const maskTexture = await this.loadTextureViaRSG(panel.maskUrl);
        if (maskTexture) {
          imageComponent.mainPass.setTexture("maskTex", maskTexture);
        }
      }

      // Start animation
      this.runAnimation(imageComponent, panel.anim || {});

    } catch (error) {
      this.onError.invoke("Failed to load image: " + error);
    }
  }

  private async loadTextureViaRSG(url: string): Promise<Texture | null> {
    try {
      // Use Remote Service Gateway to load texture
      // Note: This would use the actual RSG API in production
      // For now, we'll return null for demo purposes
      return null;
    } catch (error) {
      print("Failed to load texture: " + error);
      // Return a default texture for demo purposes
      return null;
    }
  }

  private runAnimation(imageComponent: Image, animConfig: any): void {
    if (!this.enableKenBurns && !this.enableParallax) return;

    const duration = animConfig.duration || this.defaultDuration;
    const zoom = animConfig.zoom || this.defaultZoom;
    const panX = animConfig.pan?.[0] ?? this.defaultPanX;
    const panY = animConfig.pan?.[1] ?? this.defaultPanY;

    // Create animation tween using Lens Studio tween system
    // Note: This would use the actual tween system in production
    this.animationTween = {
      startScale: 1.0,
      endScale: zoom,
      panX: panX,
      panY: panY,
      duration: duration
    };

    this.isAnimating = true;

    // Set up completion callback
    setTimeout(() => {
      this.isAnimating = false;
      this.onAnimationComplete.invoke({ panelIndex: this.currentIndex });
    }, duration * 1000);
  }

  private getSamplePanels(): any[] {
    return [
      {
        title: "Lost in Shibuya",
        description: "The neon lights of Tokyo's busiest intersection",
        imageUrl: "https://example.com/shibuya_1.png",
        depthUrl: "https://example.com/shibuya_1_d.png",
        maskUrl: "https://example.com/shibuya_1_fg.png",
        anim: { 
          type: "parallax", 
          zoom: 1.08, 
          pan: [0.0, 0.03], 
          duration: 4.5 
        }
      },
      {
        title: "Bullet Train to Kyoto",
        description: "High-speed journey through the Japanese countryside",
        imageUrl: "https://example.com/kyoto_2.png",
        anim: { 
          type: "kenburns", 
          zoom: 1.12, 
          pan: [0.02, 0.0], 
          duration: 5.0 
        }
      },
      {
        title: "Temple Garden",
        description: "Peaceful moments in a traditional Japanese garden",
        videoUrl: "https://example.com/temple_3_loop.mp4",
        anim: { 
          type: "video", 
          duration: 6.0 
        }
      }
    ];
  }

  onDestroy() {
    this.stopCurrentAnimation();
  }
}
