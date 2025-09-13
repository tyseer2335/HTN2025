import { Snap3DInteractableFactory } from "./Snap3DInteractableFactory";
import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";

@component
export class InteractableSnap3DGenerator extends BaseScriptComponent {
  @ui.separator
  @ui.label("Example of using generative 3D with Snap3D")
  @input
  snap3DFactory: Snap3DInteractableFactory;
  @ui.separator
  @input
  @hint("Enter the text prompt for 3D object generation")
  private textPrompt: string = "A futuristic robot";
  @input
  private targetPosition: SceneObject;
  @input
  private generateButton: PinchButton;
  private isGenerating: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      // Generate 3D object using the text prompt on start
      this.create3DObject(this.textPrompt);
      
      // Set up button click handler
      this.generateButton.onButtonPinched.add(() => {
        if (!this.isGenerating) { // Prevent multiple clicks
          this.generateButton.enabled = !this.isGenerating;
          this.create3DObject(this.textPrompt);
          
        }
      });
    });
  }

  private create3DObject(prompt: string) {
    this.snap3DFactory.createInteractable3DObject(
      prompt,
      this.targetPosition.getTransform().getWorldPosition()
    );
  }
}
