import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";
import { Snap3DInteractableFactory } from "./Snap3DInteractableFactory";
import { LSTween } from "LSTween.lspkg/LSTween";
/**
 * StoryViewer - Phase 1: Initial Dot Implementation with HTTP Request
 * Single dot appears at starting position when button is clicked, then fetches story data
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
  
  // Internet Module for HTTP requests
  @input
  @hint("InternetModule asset for making HTTP requests")
  private internetModule: InternetModule;
  private statusDisplayTwo: Text; 
  
  // HTTP Request Settings
  @ui.separator
  @ui.label("API Configuration")
  
  @input
  @hint("API endpoint URL to fetch story data from")
  private apiEndpoint: string = "https://jsonplaceholder.typicode.com/posts/1";

  @input
  snap3DFactory: Snap3DInteractableFactory;
    
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
  private storyData: any = null;
  private created3DObject: SceneObject = null;
private rotationTween: LSTween = null;
private rotationSpeed: number = 30; // degrees per second
private updateEvent: UpdateEvent = null;
  
  onAwake() {
    // Check internet availability first
    if (global.deviceInfoSystem.isInternetAvailable()) {
      print("StoryViewer: Internet is available");
    } else {
      print("StoryViewer: No internet connection");
      if (this.statusDisplay) {
        this.statusDisplay.text = "No internet connection";
      }
    }

    // Listen for internet status changes
    global.deviceInfoSystem.onInternetStatusChanged.add((args) => {
      if (args.isInternetAvailable) {
        print("StoryViewer: Internet connection restored");
        if (this.statusDisplay && this.statusDisplay.text === "No internet connection") {
          this.statusDisplay.text = "Ready";
        }
      } else {
        print("StoryViewer: Internet connection lost");
        if (this.statusDisplay) {
          this.statusDisplay.text = "No internet connection";
        }
      }
    });

    // attach onGenerateButtonPressed to generateButton
    this.createEvent("OnStartEvent").bind(() => {
      // Set up button click handler
      if (this.generateButton && this.generateButton.onButtonPinched) {
        this.generateButton.onButtonPinched.add(() => {
          this.onGenerateButtonPressed();
        });
      } else {
        print("StoryViewer: generateButton not properly configured");
      }
    });
    
    if (this.buttonText) this.buttonText.text = "Start Story";
    if (this.statusDisplay) this.statusDisplay.text = "Ready";
  }
  
  private onGenerateButtonPressed() {
    if (this.isAnimating) return; // Prevent multiple clicks
    
    // Check internet before starting
    if (!global.deviceInfoSystem.isInternetAvailable()) {
      print("StoryViewer: No internet connection available");
      if (this.statusDisplay) {
        this.statusDisplay.text = "No internet connection";
      }
      return;
    }
    
    this.startPhase1();
  }
  
  private startPhase1() {
    this.isAnimating = true;
    print("StoryViewer: Starting Phase 1 - fetching story data");
    
    // visual feedback
    if (this.buttonText) this.buttonText.text = "Fetching Story...";
    if (this.statusDisplay) this.statusDisplay.text = "Connecting to API...";
    
    // Make HTTP request
    this.fetchStoryData();
  }

  private async fetchStoryData() {
  try {
    if (!this.internetModule) {
      print("StoryViewer: InternetModule not configured");
      if (this.statusDisplay) this.statusDisplay.text = "Configuration error";
      this.completePhase1();
      return;
    }

    const request = new Request(this.apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await this.internetModule.fetch(request);
    
    if (response.status === 200) {
      const responseData = await response.json();
      this.storyData = responseData;
      
      print("StoryViewer: Story data fetched successfully");
      print("Story data: " + JSON.stringify(responseData));
      
      if (this.statusDisplay) this.statusDisplay.text = "Story loaded successfully!";
      if (this.buttonText) this.buttonText.text = "Story Ready";

      // print("Icon Category: " + responseData.stories[0].iconCategory);
      // this.generate3DSnap(responseData.stories[0].iconCategory);

      this.generate3DSnap(responseData.iconCategory);
      
      
    } else {
      print("StoryViewer: HTTP request failed with status: " + response.status);
      if (this.statusDisplay) this.statusDisplay.text = "Failed to load story";
      this.completePhase1();
    }
  } catch (error) {
    print("StoryViewer: Error fetching story data: " + error);
    if (this.statusDisplay) this.statusDisplay.text = "Network error";
    this.completePhase1();
  }
}

private async generate3DSnap(iconCategory: string) {
  print("StoryViewer: Generating 3D object with icon category: " + iconCategory);
  this.created3DObject = await this.snap3DFactory.createInteractable3DObject(
    iconCategory,
    this.generateButton.getTransform().getWorldPosition().add(this.dotOffset)
  );
    
    
    if (this.created3DObject) {
      print("StoryViewer: 3D object created successfully, starting rotation");
      this.startContinuousRotation(); // Add this line to start rotation
    } else {
      print("StoryViewer: Warning - 3D object creation failed");
    }
  this.completePhase1();
}

  private startContinuousRotation() {
  if (!this.created3DObject) {
    print("StoryViewer: No 3D object to rotate");
    return;
  }
  
  print("StoryViewer: Starting continuous rotation");
  
  // Create an update event that runs every frame
  this.updateEvent = this.createEvent("UpdateEvent");
  this.updateEvent.bind(() => {
    if (this.created3DObject) {
      const transform = this.created3DObject.getTransform();
      const currentRotation = transform.getLocalRotation();
      
      // Calculate rotation increment based on frame time
      const deltaTime = getDeltaTime();
      const rotationIncrement = this.rotationSpeed * deltaTime * MathUtils.DegToRad;
      
      // Create new rotation (rotating around Y-axis)
      const newRotationY = quat.angleAxis(rotationIncrement, vec3.up());
      const finalRotation = currentRotation.multiply(newRotationY); // Use the multiply method on the quat instance
      
      transform.setLocalRotation(finalRotation);
    }
  });
}
  
  private completePhase1() {
    this.isAnimating = false;
    if (this.buttonText) this.buttonText.text = "Start Story";
    this.currentTween = null;
  }

  // optional: a reset helper
  public resetPhase1() {
    if (this.currentTween && this.currentTween.cancel) this.currentTween.cancel();
    this.isAnimating = false;
    this.storyData = null;
    
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