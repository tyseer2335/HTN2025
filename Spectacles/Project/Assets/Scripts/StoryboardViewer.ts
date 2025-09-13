import { ContainerFrame } from "SpectaclesInteractionKit.lspkg/Components/UI/ContainerFrame/ContainerFrame";
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";

/**
 * Displays storyboard memories as comic-style panels that users can navigate through.
 * Integrates with VAPI for audio narration and provides an immersive viewing experience.
 *
 * @version 1.0.0
 */
@component
export class StoryboardViewer extends BaseScriptComponent {
  /**
   * Container frame for the storyboard panel
   */
  @input
  panelContainer: ContainerFrame;

  /**
   * Image component for displaying storyboard panels
   */
  @input
  panelImage: Image;

  /**
   * Text component for displaying captions
   */
  @input
  captionText: Text;

  /**
   * Previous button for navigation
   */
  @input
  previousButton: SceneObject;

  /**
   * Next button for navigation
   */
  @input
  nextButton: SceneObject;

  /**
   * Close button to return to gallery
   */
  @input
  closeButton: SceneObject;

  /**
   * Audio/narration button
   */
  @input
  audioButton: SceneObject;

  /**
   * Loading indicator for panel transitions
   */
  @input
  loadingIndicator: SceneObject;

  /**
   * Distance from user to place the storyboard
   */
  @input
  viewingDistance: number = 100;

  /**
   * Size of each storyboard panel
   */
  @input
  panelSize: vec2 = new vec2(80, 60);

  private currentStoryboard: any = null;
  private currentPanelIndex: number = 0;
  private isVisible: boolean = false;
  private wcfmp = WorldCameraFinderProvider.getInstance();

  // Events
  public readonly onStoryboardOpened: EventWrapper = new EventWrapper();
  public readonly onStoryboardClosed: EventWrapper = new EventWrapper();
  public readonly onPanelChanged: EventWrapper = new EventWrapper();

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initializeViewer();
      this.setupButtonInteractions();
    });

    // Initially hide the viewer
    this.setVisibility(false);
  }

  /**
   * Initializes the storyboard viewer
   */
  private initializeViewer(): void {
    if (this.panelContainer) {
      this.panelContainer.innerSize = this.panelSize;
      this.panelContainer.renderOrder = -20; // Render in front
    }

    // Position the viewer in front of the user
    this.positionInFrontOfUser();
  }

  /**
   * Sets up button interactions for navigation and audio
   */
  private setupButtonInteractions(): void {
    // Previous button
    if (this.previousButton) {
      this.previousButton.createComponent("InteractionComponent");
      this.createEvent("TapEvent").bind((eventArgs) => {
        if (eventArgs.target === this.previousButton) {
          this.showPreviousPanel();
        }
      });
    }

    // Next button
    if (this.nextButton) {
      this.nextButton.createComponent("InteractionComponent");
      this.createEvent("TapEvent").bind((eventArgs) => {
        if (eventArgs.target === this.nextButton) {
          this.showNextPanel();
        }
      });
    }

    // Close button
    if (this.closeButton) {
      this.closeButton.createComponent("InteractionComponent");
      this.createEvent("TapEvent").bind((eventArgs) => {
        if (eventArgs.target === this.closeButton) {
          this.closeStoryboard();
        }
      });
    }

    // Audio button
    if (this.audioButton) {
      this.audioButton.createComponent("InteractionComponent");
      this.createEvent("TapEvent").bind((eventArgs) => {
        if (eventArgs.target === this.audioButton) {
          this.playCurrentPanelAudio();
        }
      });
    }
  }

  /**
   * Displays a storyboard with its panels
   */
  public displayStoryboard(storyboard: any): void {
    this.currentStoryboard = this.normalizeStoryboard(storyboard);
    this.currentPanelIndex = 0;

    if (!this.currentStoryboard || !this.currentStoryboard.panels || this.currentStoryboard.panels.length === 0) {
      print("Error: Invalid storyboard data");
      return;
    }

    this.setVisibility(true);
    this.positionInFrontOfUser();
    this.displayCurrentPanel();
    this.updateNavigationButtons();

    this.onStoryboardOpened.trigger();
  }

  /**
   * Closes the storyboard and returns to gallery view
   */
  public closeStoryboard(): void {
    this.setVisibility(false);
    this.currentStoryboard = null;
    this.currentPanelIndex = 0;

    this.onStoryboardClosed.trigger();
  }

  /**
   * Shows the previous panel in the storyboard
   */
  private showPreviousPanel(): void {
    if (!this.currentStoryboard || this.currentPanelIndex <= 0) return;

    this.currentPanelIndex--;
    this.displayCurrentPanel();
    this.updateNavigationButtons();
    this.onPanelChanged.trigger();
  }

  /**
   * Shows the next panel in the storyboard
   */
  private showNextPanel(): void {
    if (!this.currentStoryboard ||
        this.currentPanelIndex >= this.currentStoryboard.panels.length - 1) return;

    this.currentPanelIndex++;
    this.displayCurrentPanel();
    this.updateNavigationButtons();
    this.onPanelChanged.trigger();
  }

  /**
   * Displays the current panel's content
   */
  private displayCurrentPanel(): void {
    if (!this.currentStoryboard || !this.currentStoryboard.panels) return;

    const currentPanel = this.currentStoryboard.panels[this.currentPanelIndex];
    if (!currentPanel) return;

    // Show loading indicator
    this.setLoadingVisible(true);

    // Load panel image
    this.loadPanelImage(currentPanel.imageUrl).then(() => {
      this.setLoadingVisible(false);
    });

    // Update caption
    if (this.captionText && currentPanel.caption) {
      this.captionText.text = currentPanel.caption;
    }

    print(`Displaying panel ${this.currentPanelIndex + 1} of ${this.currentStoryboard.panels.length}`);
  }

  /**
   * Loads and displays a panel image
   */
  private async loadPanelImage(imageUrl: string): Promise<void> {
    try {
      print("Panel image requested: " + imageUrl);

      // Texture loading requires RemoteMediaModule setup
      await this.simulateImageLoad();

      if (this.panelImage) {
        print("Panel image component ready for texture assignment");
      }
    } catch (error) {
      print("Failed to load panel image: " + error);
      this.setLoadingVisible(false);
    }
  }

  /**
   * Simulates image loading delay (placeholder)
   */
  private async simulateImageLoad(): Promise<void> {
    return new Promise((resolve) => {
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => {
        resolve();
      });
      delayedEvent.reset(1.0); // 1 second delay
    });
  }

  /**
   * Plays audio narration for the current panel using VAPI
   */
  private playCurrentPanelAudio(): void {
    if (!this.currentStoryboard || !this.currentStoryboard.panels) return;

    const currentPanel = this.currentStoryboard.panels[this.currentPanelIndex];
    if (!currentPanel || !currentPanel.caption) return;

    // In a real implementation, this would:
    // 1. Call VAPI to generate speech from the caption text
    // 2. Play the generated audio
    // 3. Show visual feedback during playback

    print("Playing audio for: " + currentPanel.caption);

    // Placeholder for VAPI integration
    this.callVAPIForNarration(currentPanel.caption);
  }

  /**
   * Calls VAPI for text-to-speech narration
   */
  private callVAPIForNarration(text: string): void {
    print("VAPI narration requested: " + text);
    print("Note: Audio streaming requires backend integration");

    // Show visual feedback during simulated playback
    this.showAudioPlaybackFeedback();
  }

  /**
   * Shows visual feedback during audio playback
   */
  private showAudioPlaybackFeedback(): void {
    if (this.audioButton) {
      // Change button appearance to show it's playing
      // This could involve changing color, adding animation, etc.

      // Simulate 3-second audio duration
      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      delayedEvent.bind(() => {
        // Reset button appearance
        print("Audio playback completed");
      });
      delayedEvent.reset(3.0);
    }
  }

  /**
   * Updates the visibility and state of navigation buttons
   */
  private updateNavigationButtons(): void {
    if (!this.currentStoryboard) return;

    const totalPanels = this.currentStoryboard.panels.length;

    // Previous button
    if (this.previousButton) {
      this.previousButton.enabled = this.currentPanelIndex > 0;
    }

    // Next button
    if (this.nextButton) {
      this.nextButton.enabled = this.currentPanelIndex < totalPanels - 1;
    }
  }

  /**
   * Sets the visibility of the loading indicator
   */
  private setLoadingVisible(visible: boolean): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.enabled = visible;
    }
  }

  /**
   * Sets the overall visibility of the storyboard viewer
   */
  private setVisibility(visible: boolean): void {
    this.isVisible = visible;
    this.sceneObject.enabled = visible;
  }

  /**
   * Positions the storyboard viewer in front of the user
   */
  private positionInFrontOfUser(): void {
    if (!this.isVisible) return;

    const cameraTransform = this.wcfmp.getCamera().getTransform();
    const cameraPosition = cameraTransform.getWorldPosition();
    const cameraForward = cameraTransform.forward;

    // Position the storyboard at the specified distance in front of the camera
    const targetPosition = cameraPosition.add(cameraForward.uniformScale(this.viewingDistance));
    this.sceneObject.getTransform().setWorldPosition(targetPosition);

    // Make the storyboard face the camera
    const lookDirection = cameraPosition.sub(targetPosition).normalize();
    const lookRotation = quat.lookRotation(lookDirection, vec3.up());
    this.sceneObject.getTransform().setWorldRotation(lookRotation);
  }

  /**
   * Gets the current panel index
   */
  public getCurrentPanelIndex(): number {
    return this.currentPanelIndex;
  }

  /**
   * Gets the total number of panels in the current storyboard
   */
  public getTotalPanels(): number {
    return this.currentStoryboard ? this.currentStoryboard.panels.length : 0;
  }

  /**
   * Checks if the viewer is currently visible
   */
  public isViewerVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Updates the viewer position to always face the user
   */
  public updateViewerPosition(): void {
    if (this.isVisible) {
      this.positionInFrontOfUser();
    }
  }

  /**
   * Normalizes storyboard format (supports both new p1-p5 format and legacy panels array)
   */
  private normalizeStoryboard(storyboard: any): any {
    if (!storyboard) return null;

    // If it already has panels array, it's already normalized or legacy format
    if (storyboard.panels && Array.isArray(storyboard.panels)) {
      return storyboard;
    }

    // Convert new p1-p5 format to panels array for compatibility
    if (storyboard.p1) {
      const panels = [storyboard.p1, storyboard.p2, storyboard.p3, storyboard.p4, storyboard.p5]
        .filter(panel => panel) // Remove any undefined panels
        .map(panel => ({
          // Use new format fields, fall back to legacy fields
          imageUrl: panel.generatedImageUrl || panel.imageUrl || "placeholder.jpg",
          caption: panel.description || panel.caption || panel.title || "",
          audioUrl: panel.audioUrl || ""
        }));

      return {
        ...storyboard,
        panels: panels
      };
    }

    print("Warning: Unrecognized storyboard format");
    return storyboard;
  }
}