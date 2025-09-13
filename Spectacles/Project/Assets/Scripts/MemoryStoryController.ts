/**
 * Main controller for memory story gallery on Spectacles
 * Handles icon generation, panel creation, and user interactions
 * Uses Remote Service Gateway for Snap3D and Gemini APIs
 *
 * Notes:
 * - This file assumes Lens Studio's TS decorators (@component, @input) and types are available.
 * - Remote Service Gateway service names ("Snap3D", "Gemini") are placeholders; update to the exact
 *   service identifiers configured in your project if they differ.
 * - Gemini image extraction is guarded because response shapes can vary by model/version.
 */

// @input Component.MeshVisual iconMesh
// @input SceneObject galleryRoot
// @input SceneObject panelTemplate
// @input SceneObject[] panelSlots

// Ambient type fallbacks if your project lacks explicit d.ts for these
type TapEvent = any;
type MeshVisual = any;
type SceneObject = any;
type Text = any;
type Image = any;
// Base class for Lens Studio script components
declare class BaseScriptComponent {
  createEvent(eventType: string): { bind(callback: Function): void };
}

declare const require: (id: string) => any;
declare function print(msg: string): void;

// // Lens Studio decorators - match actual behavior
// declare function component<T extends new (...args: any[]) => any>(target: T): T;
// declare function input<T = any>(target: any, propertyKey: string | symbol): void;

@component
export class MemoryStoryController extends BaseScriptComponent {
  @input
  iconMesh!: MeshVisual;

  @input
  galleryRoot!: SceneObject;

  @input
  panelTemplate!: SceneObject;

  @input
  panelSlots!: SceneObject[];

  private storyData: any;
  private galleryOpen = false;
  private panelsBuilt = false;

  // Complete JSON data (hardcoded for now) — DO NOT EDIT
  private jsonData: string = `{
        "iconCategory": "torii gate",
        "p1": {
            "title": "Lost in Shibuya",
            "description": "I stepped off the train in Tokyo, overwhelmed by the neon lights and bustling crowds of Shibuya Crossing. As I tried to navigate the maze of streets, I stumbled upon a tiny ramen shop hidden in an alley. The aroma of miso broth and the warmth of the welcome drew me in, and I knew my adventure had truly begun. After slurping down the most delicious ramen, I felt ready to face the city's challenges."
        },
        "p2": {
            "title": "Bullet Train to Kyoto",
            "description": "The next morning, I boarded the sleek bullet train to Kyoto. As we sped through the countryside, I watched the landscape blur past my window, a mix of traditional and modern Japan. My anticipation grew with each passing mile, knowing that Kyoto would offer a different side of the country's rich culture."
        },
        "p3": {
            "title": "Wandering Kyoto",
            "description": "In Kyoto, I immersed myself in the city's history and beauty. I strolled through the serene bamboo forest of Arashiyama, the rustling leaves whispering ancient secrets. Golden temples gleamed in the sunlight, their intricate architecture a testament to centuries of craftsmanship. I even had the chance to wear a traditional kimono, feeling like a local as I posed for photos in front of the iconic Fushimi Inari Shrine."
        },
        "p4": {
            "title": "Onsen with Fuji",
            "description": "One of the most memorable experiences was soaking in an onsen in Hakone. The hot springs were the perfect place to relax after a day of exploring. As I sat in the steaming water, I gazed out at the majestic Mount Fuji in the distance, its snow-capped peak a stunning backdrop to my peaceful moment. It was a scene straight out of a postcard, and I knew I would cherish this memory forever."
        },
        "p5": {
            "title": "Reflection on a Journey",
            "description": "As my two weeks in Japan came to an end, I reflected on the incredible experiences I had. From the energy of Shibuya to the tranquility of Kyoto's temples, and from the thrill of the bullet train to the serenity of the onsen, Japan had shown me a world of contrasts and beauty. I left with a heart full of memories and a deeper appreciation for the country's unique blend of tradition and modernity."
        }
    }`;

  onAwake(): void {
    this.initialize();
    // Bind tap event once
    this.createEvent("TapEvent").bind(this.onTap.bind(this));
  }

  private initialize(): void {
    try {
      this.storyData = JSON.parse(this.jsonData);
      print("Story data loaded: " + (this.storyData?.iconCategory || "(no category)"));
    } catch (_e) {
      print("JSON parse error");
      return;
    }

    // Hide gallery initially
    if (this.galleryRoot) {
      this.galleryRoot.enabled = false;
    }

    // Build panels immediately
    this.buildPanels();
  }

  private buildPanels(): void {
    if (!this.panelSlots || !this.panelTemplate || !this.storyData) {
      print("Missing required components to build panels");
      return;
    }

    const keys = ["p1", "p2", "p3", "p4", "p5"];

    for (let i = 0; i < keys.length && i < this.panelSlots.length; i++) {
      const key = keys[i];
      const slot = this.panelSlots[i];
      const data = this.storyData[key];

      if (!slot || !data) {
        continue;
      }

      // Clear existing children
      while (slot.getChildrenCount && slot.getChildrenCount() > 0) {
        const child = slot.getChild(0);
        if (child && child.destroy) child.destroy();
        else break;
      }

      // Clone template to slot
      const panel = this.panelTemplate.copyTo(slot);
      if (panel) {
        panel.enabled = true;

        // Find and set text components
        const titleText = this.findTextComponent(panel, "TitleText");
        const descText = this.findTextComponent(panel, "DescText");

        if (titleText) {
          titleText.text = data.title;
          print("Set title: " + data.title);
        } else {
          print("TitleText not found on panel " + (i + 1));
        }

        if (descText) {
          descText.text = data.description;
          print("Set description for panel " + (i + 1));
        } else {
          print("DescText not found on panel " + (i + 1));
        }
      }
    }

    this.panelsBuilt = true;
    print("All panels built");
  }

  private findTextComponent(parent: SceneObject, childName: string): Text | null {
    if (!parent || !parent.getChildrenCount) return null;

    // Search direct children
    for (let i = 0; i < parent.getChildrenCount(); i++) {
      const child = parent.getChild(i);
      if (child && child.name === childName) {
        const comp = child.getComponent("Component.Text");
        if (comp) return comp as Text;
      }
    }

    // Search recursively
    for (let i = 0; i < parent.getChildrenCount(); i++) {
      const child = parent.getChild(i);
      const found = this.findTextComponent(child, childName);
      if (found) return found;
    }

    return null;
  }

  private onTap(eventData: TapEvent): void {
    try {
      // When tapping the icon mesh object, toggle gallery
      const iconObj = this.iconMesh ? this.iconMesh.sceneObject : null;
      const isIconTap = iconObj && eventData && eventData.target === iconObj;
      if (isIconTap) {
        this.toggleGallery();
      }
    } catch (e) {
      print("Tap handler error: " + e);
    }
  }

  private toggleGallery(): void {
    this.galleryOpen = !this.galleryOpen;

    if (this.galleryRoot) {
      this.galleryRoot.enabled = this.galleryOpen;
      print("Gallery " + (this.galleryOpen ? "opened" : "closed"));
    }

    if (this.galleryOpen && this.panelsBuilt) {
      this.generateImages();
    }
  }

  private generateImages(): void {
    if (!this.storyData) return;

    // Generate 3D icon using Snap3D Remote Service Gateway
    this.generateSnap3DIcon(this.storyData.iconCategory);

    // Generate 2D panel images using Gemini Remote Service Gateway
    const keys = ["p1", "p2", "p3", "p4", "p5"];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const p = this.storyData[k];
      if (p && p.description && p.title) {
        this.generateGeminiPanel(p.description, p.title, i);
      }
    }
  }

  private generateSnap3DIcon(iconCategory: string): void {
    const prompt =
      "A low-poly 3D " +
      iconCategory +
      " icon optimized for AR display with clean geometric shapes";
    print("Generating 3D icon: " + prompt);

    let RemoteServiceModule: any;
    try {
      RemoteServiceModule = require("RemoteServiceModule")?.RemoteServiceModule;
    } catch (_e) {
      print("RemoteServiceModule not found. Check your modules and service names.");
      return;
    }

    const Snap3D = RemoteServiceModule?.getService?.("Snap3D");
    if (!Snap3D) {
      print("Snap3D service not available. Verify service identifier and permissions.");
      return;
    }

    Snap3D.submitAndGetStatus({
      prompt: prompt,
      format: "glb",
      refine: true,
      use_vertex_color: true,
      use_case: "memory_icon",
    })
      .then((submitGetStatusResults: any) => {
        // Some SDKs emit events, others return polling handles. Guard both.
        if (submitGetStatusResults?.event?.add) {
          submitGetStatusResults.event.add((eventData: any[]) => {
            const value = eventData?.[0];
            const assetOrError = eventData?.[1];

            if (value === "refined_mesh" || value === "base_mesh") {
              const gltfAsset = assetOrError;
              print("3D icon generated successfully");

              // Apply to icon mesh
              try {
                if (this.iconMesh && gltfAsset?.gltf) {
                  // Depending on Lens version, this could be set via .mesh or a dedicated setter.
                  this.iconMesh.mesh = gltfAsset.gltf;
                } else {
                  print("Mesh or GLTF not available on returned asset");
                }
              } catch (e) {
                print("Failed to apply GLTF to mesh: " + e);
              }
            } else if (value === "failed") {
              const err = assetOrError;
              print("3D icon generation failed: " + (err?.errorMsg || err));
            }
          });
        } else {
          print("submitAndGetStatus returned unexpected handle; implement polling if required.");
        }
      })
      .catch((error: any) => {
        print("Snap3D error: " + error);
      });
  }

  private generateGeminiPanel(description: string, title: string, panelIndex: number): void {
    print("Generating panel " + (panelIndex + 1) + ": " + title);

    let RemoteServiceModule: any;
    try {
      RemoteServiceModule = require("RemoteServiceModule")?.RemoteServiceModule;
    } catch (_e) {
      print("RemoteServiceModule not found. Check your modules and service names.");
      return;
    }

    const Gemini = RemoteServiceModule?.getService?.("Gemini");
    if (!Gemini) {
      print("Gemini service not available. Verify service identifier and permissions.");
      return;
    }

    // Model note:
    // For image generation, you may need a specific image-capable model such as:
    // "gemini-2.5-flash-image-preview" (aka "nano-banana") if your gateway supports it.
    // Keeping "gemini-2.0-flash" as a safe default; adjust as needed.
    const request = {
      model: "gemini-2.0-flash", // Using the working model we tested
      type: "generateContent",
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "Create a vibrant watercolor comic book style illustration for this travel memory panel. " +
                  "Scene description: " +
                  description +
                  ". " +
                  "Style requirements: soft watercolor painting with flowing colors, bold comic outlines, " +
                  "cinematic travel photography composition, rich visual storytelling details, " +
                  "16:9 aspect ratio optimized for AR display. " +
                  "NO text, speech bubbles, or captions in the image.",
              },
            ],
          },
        ],
      },
    };

    Gemini.models(request)
      .then((response: any) => {
        const hasCandidate = response?.candidates && response.candidates[0];
        if (!hasCandidate) {
          print("Panel " + (panelIndex + 1) + " - No candidates in response");
          return;
        }

        print("Panel " + (panelIndex + 1) + " image generation response received");
        this.applyImageToPanel(response, panelIndex);
      })
      .catch((error: any) => {
        print("Gemini panel generation failed: " + error);
      });
  }

  private applyImageToPanel(geminiResponse: any, panelIndex: number): void {
    // Attempt to extract an image blob/URL/base64 depending on Gateway shape
    // Common Gemini REST shape for inline image parts (subject to change):
    // response.candidates[0].content.parts[n].inlineData: { mimeType, data (base64) }
    let inlineData: { mimeType?: string; data?: string } | null = null;

    try {
      const parts =
        geminiResponse?.candidates?.[0]?.content?.parts ||
        geminiResponse?.candidates?.[0]?.contents?.[0]?.parts ||
        [];
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p?.inlineData?.data) {
          inlineData = p.inlineData;
          break;
        }
        // Some gateways may return generated URIs
        if (p?.fileData?.mimeType && p?.fileData?.fileUri) {
          // If you have a URI you can load as texture, handle that path here.
          inlineData = null;
          break;
        }
      }
    } catch (_e) {
      // fall through; inlineData may remain null
    }

    const slot = this.panelSlots?.[panelIndex];
    if (!slot) {
      print("Panel slot not found for index " + panelIndex);
      return;
    }

    const panel = slot.getChildrenCount && slot.getChildrenCount() > 0 ? slot.getChild(0) : null;
    if (!panel) {
      print("Panel object not found at slot " + (panelIndex + 1));
      return;
    }

    const imageComponent = this.findImageComponent(panel, "PanelImage");
    if (!imageComponent) {
      print("PanelImage component not found on panel " + (panelIndex + 1));
      return;
    }

    if (inlineData?.data && inlineData?.mimeType) {
      print("Applying generated inline image to panel " + (panelIndex + 1));
      try {
        // You may need to convert base64 to a TextureAsset via Lens Studio APIs.
        // Pseudocode (depends on your LS version/extensions):
        // const tex = Assets.createTextureFromBase64(inlineData.data, inlineData.mimeType);
        // imageComponent.mainPass.baseTex = tex;

        // Placeholder to avoid runtime crash until texture creation is wired:
        // (Leave a log so you remember to implement this)
        print("TODO: Convert base64 to Texture and assign to Image.mainPass.baseTex");
      } catch (e) {
        print("Failed applying image texture: " + e);
      }
    } else {
      print(
        "No inline image data found in Gemini response for panel " + (panelIndex + 1) + ". Check gateway mapping."
      );
    }
  }

  private findImageComponent(parent: SceneObject, childName: string): Image | null {
    if (!parent || !parent.getChildrenCount) return null;

    // Search direct children
    for (let i = 0; i < parent.getChildrenCount(); i++) {
      const child = parent.getChild(i);
      if (child && child.name === childName) {
        const comp = child.getComponent("Component.Image");
        if (comp) return comp as Image;
      }
    }

    // Search recursively
    for (let i = 0; i < parent.getChildrenCount(); i++) {
      const child = parent.getChild(i);
      const found = this.findImageComponent(child, childName);
      if (found) return found;
    }

    return null;
  }

  // Public functions for external use
  public updateStoryData(newJsonData: string): void {
    try {
      this.jsonData = newJsonData;
      this.storyData = JSON.parse(newJsonData);
      this.panelsBuilt = false;
      this.buildPanels();
      print("Story data updated");
    } catch (e) {
      print("Failed to update story data: " + e);
    }
  }

  public refreshFromAPI(): void {
    // Placeholder for a future fetch via your Remote Service Gateway HTTP proxy
    print("API refresh requested");
  }
}