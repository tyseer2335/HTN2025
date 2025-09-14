import { InteractableOutlineFeedback } from "SpectaclesInteractionKit.lspkg/Components/Helpers/InteractableOutlineFeedback";
import { ImageGenerator } from "./ImageGenerator";
import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";

@component
export class InteractableImageGenerator extends BaseScriptComponent {
  @ui.separator
  @ui.label("Example of using generative image APIs")
  @input
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("OpenAI", "OpenAI"),
      new ComboBoxItem("Gemini", "Gemini"),
    ])
  )
  private modelProvider: string = "OpenAI";
  @ui.separator
  @input
  @hint("Enter the text prompt for image generation")
  private textPrompt: string = "A beautiful sunset over mountains";
  @input
  private image: Image;
  @input
  private textDisplay: Text;
  @input
  private generateButton: PinchButton;
  @input
  private spinner: SceneObject;
  @input
  @hint("Optional: Material for button color changes")
  private buttonMaterial: Material;
  private imageGenerator: ImageGenerator = null;
  private originalButtonColor: vec4;
  private isGenerating: boolean = false;

  

  onAwake() {
    this.imageGenerator = new ImageGenerator(this.modelProvider);
    let imgMat = this.image.mainMaterial.clone();
    this.image.clearMaterials();
    this.image.mainMaterial = imgMat;

    if (this.buttonMaterial) {
      this.originalButtonColor = this.buttonMaterial.mainPass.baseColor;
    } 

    this.createEvent("OnStartEvent").bind(() => {
      this.spinner.enabled = false;
      this.updateButtonState(); // Initialize button state
      
      // Set up button click handler
      this.generateButton.onButtonPinched.add(() => {
        if (!this.isGenerating) { // Prevent multiple clicks
          this.createImage(this.textPrompt);
        }
      });
      
      // Display initial prompt
      this.textDisplay.text = this.textPrompt;
    });
  }

  private updateButtonState() {
    
    // Update button color
    if (this.buttonMaterial) {
      if (this.isGenerating) {
        this.buttonMaterial.mainPass.baseColor = new vec4(0.5, 0.5, 0.5, 1); // Gray when generating
      } else {
        this.buttonMaterial.mainPass.baseColor = this.originalButtonColor; // Original color when idle
      }
    }
    
    // Enable/disable button interaction
    this.generateButton.enabled = !this.isGenerating;
  }

  createImage(prompt: string) {
    // Start generation state
    this.isGenerating = true;
    this.spinner.enabled = true;
    this.textDisplay.text = "Generating: " + prompt;
    this.updateButtonState(); // Update visual feedback
    
    this.imageGenerator
      .generateImage(prompt)
      .then((image) => {
        print("Image generated successfully: " + image);
        this.textDisplay.text = prompt;
        this.image.mainMaterial.mainPass.baseTex = image;
        
        // End generation state
        this.isGenerating = false;
        this.spinner.enabled = false;
        this.updateButtonState(); // Update visual feedback
      })
      .catch((error) => {
        print("Error generating image: " + error);
        this.textDisplay.text = "Error Generating Image";
        
        // End generation state
        this.isGenerating = false;
        this.spinner.enabled = false;
        this.updateButtonState(); // Update visual feedback
      });
  }
}
