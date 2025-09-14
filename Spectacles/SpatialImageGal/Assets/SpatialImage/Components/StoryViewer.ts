import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";
import { Snap3DInteractableFactory } from "./Snap3DFactory";
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { ImageGenerator } from "./ImageGenerator";
import { SpatialGallery } from "./SpatialGallery";
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
  @hint("Local offset from button top where the dot should appear")
  private dotOffset: vec3 = new vec3(0, 0.06, 0);

@input private particlesObject: SceneObject;

@ui.separator
@ui.label("Image Generation Configuration")

@input
@hint("SpatialGallery component for displaying generated images")
private spatialGallery: SpatialGallery;

@input
@hint("Enable/disable spatial image conversion")
private useSpatialGallery: boolean = true;
  
  // Internal state
  private isAnimating: boolean = false;
  private currentTween: any = null;
  private storyData: any = null;
  private created3DObject: SceneObject = null;
  private rotationTween: LSTween = null;
  private rotationSpeed: number = 30; // degrees per second
  private updateEvent: UpdateEvent = null;

  private manipulateComponent: ManipulateComponent = null;
  private scaleThreshold: number = 1.5;
  private initialScale: vec3 = vec3.one(); // Store initial scale
  private hasTriggeredExpansion: boolean = false; // Prevent multiple triggers
  private imageGenerator: ImageGenerator = null;
  private isGeneratingImage: boolean = false;
  

  onAwake() {
    this.imageGenerator = new ImageGenerator('Gemini');
    // Check internet availability first
    if (global.deviceInfoSystem.isInternetAvailable()) {
      print("StoryViewer: Internet is available");
    } else {
      print("StoryViewer: No internet connection");
      if (this.statusDisplay) {
        this.statusDisplay.text = "No internet connection";
      }
    }
    this.initSpatialGallery();
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
  
  try {
    this.created3DObject = await this.snap3DFactory.createInteractable3DObject(
      iconCategory,
      this.generateButton.getTransform().getWorldPosition().add(this.dotOffset)
    );
    
    if (this.created3DObject) {
      print("StoryViewer: 3D object created successfully");
      this.setupScaleInteraction(this.created3DObject); // Add pinch interaction
      this.startContinuousRotation(); // Start rotation
    } else {
      print("StoryViewer: Warning - Could not find created 3D object");
    }
  } catch (error) {
    print("StoryViewer: Error creating 3D object: " + error);
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
  private setupScaleInteraction(sceneObject: SceneObject) {
  if (!this.created3DObject) {
    print("StoryViewer: Cannot setup scale interaction - no 3D object");
    return;
  }
  
  try {
    // Store the initial scale
    this.initialScale = this.created3DObject.getTransform().getLocalScale();
    this.hasTriggeredExpansion = false;
    
    // Add Interactable component first
    const interactable = this.created3DObject.createComponent(Interactable.getTypeName());
    
    // Add ManipulateComponent for scale detection
    this.manipulateComponent = this.created3DObject.createComponent("Component.ManipulateComponent") as ManipulateComponent;

    // Configure the manipulate component
    this.manipulateComponent.enableManipulateType(ManipulateType.Scale, true);
    
    

    this.manipulateComponent.minScale = 0.5; // Minimum 50% of original size
    this.manipulateComponent.maxScale = 5.0; // Maximum 500% of original size

    print("StoryViewer: Scale interaction setup complete");
    print("Initial scale: " + this.initialScale.toString());
    print("Scale threshold: " + this.scaleThreshold);
  
    this.setupScaleMonitoring(this.created3DObject);

    print("StoryViewer: ManipulateComponent configured successfully");
    
  } catch (error) {
    print("StoryViewer: Error setting up scale interaction: " + error);
    // Fallback to simple tap detection
    this.setupSimpleTapInteraction(sceneObject);
  }
}

private setupScaleMonitoring(sceneObject: SceneObject) {
  // Create an update event to monitor scale changes
  const scaleMonitorEvent = this.createEvent("UpdateEvent");
  scaleMonitorEvent.bind(() => {
    if (!sceneObject || this.hasTriggeredExpansion) return;
    
    const currentScale = sceneObject.getTransform().getLocalScale();
    
    // Calculate the scale factor relative to initial scale
    const scaleFactor = currentScale.x / this.initialScale.x; // Use X component as reference
    
    // Check if scale exceeds threshold
    if (scaleFactor >= this.scaleThreshold) {
      print("StoryViewer: Scale threshold reached! Scale factor: " + scaleFactor);
      this.onScaleThresholdReached();
    }
  });
}

private triggerParticleEffect(): void {
  if (!this.particlesObject) {
    print("triggerParticleEffect: assign 'particlesObject' in the Inspector");
    return;
  }

  // If you want the burst at the newly created 3D model:
  if (this.created3DObject) {
    const pos = this.created3DObject.getTransform().getWorldPosition();
    this.particlesObject.getTransform().setWorldPosition(pos);
  }

  // Turn on for a short window
  this.particlesObject.enabled = true;

  const ev = this.createEvent("DelayedCallbackEvent");
  ev.bind(() => {
    this.particlesObject.enabled = false;
    print("StoryViewer: particle effect disabled after 5 seconds");
  });
  ev.reset(1.25);  // 5 seconds delay

  print("StoryViewer: particle burst fired");
}

// Called when scale threshold is reached
private onScaleThresholdReached() {
  if (this.hasTriggeredExpansion) return; // Prevent multiple triggers
  
  this.hasTriggeredExpansion = true;
  
  print("StoryViewer: 3D object scaled big enough!");

  // Stop rotation when threshold is reached
  if (this.updateEvent) {
    this.updateEvent.enabled = false;
    print("StoryViewer: Rotation stopped");
  }
  
  // // Disable further scaling to prevent interference
  // if (this.manipulateComponent) {
  //   this.manipulateComponent.enableScale = false;
  // }

  
  // Update status
  if (this.statusDisplay) {
    this.statusDisplay.text = "Scale threshold reached! Story expanding...";
  }

  this.triggerParticleEffect();
  
  // Trigger story expansion
  const delayedExpansion = this.createEvent("DelayedCallbackEvent");
  delayedExpansion.bind(() => {
    this.expandStory();
    this.created3DObject.enabled = false;
  });
  delayedExpansion.reset(0.1); // 0.5 second delay
}

// Fallback method for devices that don't support ManipulateComponent
private setupSimpleTapInteraction(sceneObject: SceneObject) {
  print("StoryViewer: Setting up simple tap interaction as fallback");
  
  const tapEvent = this.createEvent("TapEvent");
  tapEvent.bind(() => {
    print("StoryViewer: Tap detected, treating as scale trigger");
    this.onScaleThresholdReached();
  });
  
  print("StoryViewer: Simple tap interaction setup as fallback");
}

private expandStory() {
  // This is where you can add whatever functionality you want
  // when the 3D object is pinched
  
  if (this.storyData) {
    print("StoryViewer: Expanding story with data: " + JSON.stringify(this.storyData));
    
    // Example: Show story text
    if (this.statusDisplay) {
      this.statusDisplay.text = "Story: " + (this.storyData.title || "Your story here");
    }

    this.generateImageFromStory();
    
    // You could also:
    // - Generate more 3D objects
    // - Show UI panels
    // - Trigger animations
    // - Play audio
    // - Open the StoryboardViewer component
  }  else {
    print("StoryViewer: No story data available for expansion");
    if (this.statusDisplay) {
      this.statusDisplay.text = "Story expanded (no data)";
    }
  }
}
private async generateImageFromStory() {
  if (!this.imageGenerator) {
    print("StoryViewer: ImageGenerator not configured");
    if (this.statusDisplay) {
      this.statusDisplay.text = "Image generator not configured";
    }
    return;
  }
  
  if (this.isGeneratingImage) {
    print("StoryViewer: Image generation already in progress");
    return;
  }
  
  try {
    this.isGeneratingImage = true;
    
    // Extract the prompt from your story data
    let imagePrompt = this.storyData.p1['description'];
    
    print("StoryViewer: Generating image with prompt: " + imagePrompt);
    
    if (this.statusDisplay) {
      this.statusDisplay.text = "Generating image: " + imagePrompt.substring(0, 30) + "...";
    }
    
    // Generate the image
    this.imageGenerator
      .generateImage(imagePrompt)
      .then((image) => {
        print("StoryViewer: Image generation promise resolved");
        
        // Validate the generated image
        if (!image) {
          print("StoryViewer: Error - Generated image is null");
          if (this.statusDisplay) {
            this.statusDisplay.text = "Error: Image generation failed";
          }
          this.isGeneratingImage = false;
          return;
        }
        
        print("StoryViewer: Image generated successfully!");
        this.displayGeneratedImage(image);
        this.isGeneratingImage = false;
      })
      .catch((error) => {
        print("StoryViewer: Error in image generation promise: " + error);
        if (this.statusDisplay) {
          this.statusDisplay.text = "Image generation failed: " + error;
        }
        this.isGeneratingImage = false;
      });
  } catch (error) {
    print("StoryViewer: Error generating image: " + error);
    if (this.statusDisplay) {
      this.statusDisplay.text = "Failed to generate image";
    }
  } finally {
    this.isGeneratingImage = false;
  }
}

// Update the initSpatialApis method
private initSpatialGallery(): void {
  if (!this.spatialGallery) {
    print("StoryViewer: SpatialGallery not configured");
    return;
  }
  
  if (this.spatialGallery.image?.onLoaded) {
    this.spatialGallery.image.onLoaded.add(() => {
      print("StoryViewer: Spatial image loaded in gallery");
    });
  }
}

private displayGeneratedImage(texture: Texture) {
  try {
    // Add validation before passing to spatial gallery
    if (!texture) {
      print("StoryViewer: Error - generated texture is null or undefined");
      if (this.statusDisplay) {
        this.statusDisplay.text = "Error: No image generated";
      }
      return;
    }
    
    if (this.useSpatialGallery && this.spatialGallery) {
      // Add the generated image to the spatial gallery
      if (!this.spatialGallery.gallery) {
        this.spatialGallery.gallery = [];
      }
      
      // Add the new image to the gallery
      this.spatialGallery.gallery.push(texture);
      
      // Set the gallery to display the new image with validation
      if (this.spatialGallery.frame && this.spatialGallery.frame.setImage) {
        this.spatialGallery.frame.setImage(texture, true);
        print("StoryViewer: Image added to spatial gallery successfully");
      } else {
        print("StoryViewer: Error - SpatialImageFrame not properly configured");
        return;
      }
      
      // Update status
      if (this.statusDisplay) {
        this.statusDisplay.text = "✨ 3D Story Image Ready! ✨";
      }
      
      return;
    }
    
    print("StoryViewer: SpatialGallery not configured");
    
  } catch (error) {
    print("StoryViewer: Error displaying image: " + error);
  }
}

public showNextGeneratedImage(): void {
  if (this.spatialGallery) {
    this.spatialGallery.rightPressed();
  }
}

public showPreviousGeneratedImage(): void {
  if (this.spatialGallery) {
    this.spatialGallery.leftPressed();
  }
}

// Optional: Add method to get current gallery size
public getGeneratedImageCount(): number {
  return this.spatialGallery?.gallery?.length || 0;
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