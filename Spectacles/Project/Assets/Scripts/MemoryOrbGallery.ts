import { MemoryOrb } from "./MemoryOrb";
import { StoryboardViewer } from "./StoryboardViewer";

/**
 * Manages a 3D gallery of memory orbs that users can explore in AR space.
 * Each orb represents a saved memory story and can be opened to view the storyboard.
 *
 * @version 1.0.0
 */
@component
export class MemoryOrbGallery extends BaseScriptComponent {
  /**
   * Prefab for creating individual memory orbs
   */
  @input
  orbPrefab: ObjectPrefab;

  /**
   * The storyboard viewer that displays opened memories
   */
  @input
  storyboardViewer: StoryboardViewer;

  /**
   * Container object to hold all the orbs
   */
  @input
  orbContainer: SceneObject;

  /**
   * Radius of the gallery circle where orbs are positioned
   */
  @input
  galleryRadius: number = 150;

  /**
   * Height range for orb placement (random Y positioning)
   */
  @input
  heightVariation: number = 50;

  /**
   * Maximum number of orbs to display
   */
  @input
  maxOrbs: number = 20;

  /**
   * Animation speed for orb floating effect
   */
  @input
  floatSpeed: number = 1.0;

  private memoryOrbs: MemoryOrb[] = [];
  private memories: MemoryData[] = [];
  private currentlyOpenMemory: MemoryData | null = null;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initializeGallery();
      this.loadMemoriesFromStorage();
    });

    // Add floating animation update
    this.createEvent("UpdateEvent").bind(() => {
      this.updateOrbAnimations();
    });
  }

  /**
   * Loads memories from storage
   */
  private async loadMemoriesFromStorage(): Promise<void> {
    try {
      print("Loading memories from backend...");
      // Using local placeholder data until HTTP module is configured
      this.memories = this.generatePlaceholderMemories();
      this.createOrbsForMemories();
    } catch (error) {
      print("Failed to load memories: " + error);
    }
  }

  /**
   * Creates orbs for each memory in the gallery
   */
  private createOrbsForMemories(): void {
    this.memories.forEach((memory, index) => {
      if (index < this.maxOrbs) {
        this.createMemoryOrb(memory, index);
      }
    });
  }

  /**
   * Creates a single memory orb at a calculated position
   */
  private createMemoryOrb(memory: MemoryData, index: number): void {
    const orbObject = this.orbPrefab.instantiate(this.orbContainer);
    const orbComponent = orbObject.getComponent(MemoryOrb.getTypeName()) as MemoryOrb;

    if (orbComponent) {
      // Calculate position in a circle with height variation
      const angle = (index / this.maxOrbs) * Math.PI * 2;
      const x = Math.cos(angle) * this.galleryRadius;
      const z = Math.sin(angle) * this.galleryRadius;
      const y = (Math.random() - 0.5) * this.heightVariation;

      orbObject.getTransform().setLocalPosition(new vec3(x, y, z));

      // Initialize the orb with memory data
      orbComponent.initializeWithMemory(memory);

      // Set up orb interaction
      orbComponent.onOrbTapped.add(() => {
        this.openMemory(memory);
      });

      this.memoryOrbs.push(orbComponent);
    }
  }

  /**
   * Opens a memory by displaying its storyboard
   */
  public openMemory(memory: MemoryData): void {
    this.currentlyOpenMemory = memory;
    this.storyboardViewer.displayStoryboard(memory.storyboard);

    // Hide other orbs while viewing a memory
    this.setOrbsVisibility(false);
  }

  /**
   * Closes the currently open memory and returns to gallery view
   */
  public closeMemory(): void {
    if (this.currentlyOpenMemory) {
      this.currentlyOpenMemory = null;
      this.storyboardViewer.closeStoryboard();
      this.setOrbsVisibility(true);
    }
  }

  /**
   * Sets visibility of all orbs
   */
  private setOrbsVisibility(visible: boolean): void {
    this.memoryOrbs.forEach(orb => {
      orb.sceneObject.enabled = visible;
    });
  }

  /**
   * Updates floating animations for all orbs
   */
  private updateOrbAnimations(): void {
    const time = getTime();
    this.memoryOrbs.forEach((orb, index) => {
      if (orb && orb.sceneObject.enabled) {
        orb.updateFloatingAnimation(time, index, this.floatSpeed);
      }
    });
  }

  /**
   * Adds a new memory to the gallery
   */
  public addMemory(memory: MemoryData): void {
    this.memories.push(memory);
    if (this.memoryOrbs.length < this.maxOrbs) {
      this.createMemoryOrb(memory, this.memoryOrbs.length);
    }
  }

  /**
   * Initializes the gallery setup
   */
  private initializeGallery(): void {
    if (!this.orbContainer) {
      print("Warning: No orb container specified for MemoryOrbGallery");
    }
  }

  /**
   * Generates placeholder memory data for testing
   */
  private generatePlaceholderMemories(): MemoryData[] {
    return [
      {
        id: "memory_1",
        title: "Beach Vacation",
        description: "A relaxing day at the beach with family",
        theme: "watercolor",
        storyboard: {
          iconCategory: "beach-umbrella",
          p1: {
            title: "Arrival",
            description: "The sun was shining as we arrived at the pristine beach.",
            generatedImageUrl: "data:image/png;base64,..." // Would be actual base64 from Gemini
          },
          p2: {
            title: "Building Dreams",
            description: "Building sandcastles became our afternoon adventure.",
            generatedImageUrl: "data:image/png;base64,..." // Would be actual base64 from Gemini
          },
          p3: {
            title: "Ocean Waves",
            description: "The waves called us for a refreshing swim.",
            generatedImageUrl: "data:image/png;base64,..."
          },
          p4: {
            title: "Golden Hour",
            description: "As evening approached, the sky turned golden.",
            generatedImageUrl: "data:image/png;base64,..."
          },
          p5: {
            title: "Memories Made",
            description: "We packed up with hearts full of beautiful memories.",
            generatedImageUrl: "data:image/png;base64,..."
          }
        },
        createdAt: new Date(),
        thumbnailUrl: "beach_thumbnail.jpg"
      },
      {
        id: "memory_2",
        title: "Mountain Hike",
        description: "Conquering the highest peak in the area",
        theme: "sketch",
        storyboard: {
          iconCategory: "mountain-peak",
          p1: {
            title: "The Ascent Begins",
            description: "The trail began steep and challenging.",
            generatedImageUrl: "data:image/png;base64,..."
          },
          p2: {
            title: "Rocky Terrain",
            description: "We navigated through boulder fields with determination.",
            generatedImageUrl: "data:image/png;base64,..."
          },
          p3: {
            title: "Above the Clouds",
            description: "Suddenly we broke through the cloud line.",
            generatedImageUrl: "data:image/png;base64,..."
          },
          p4: {
            title: "Summit Victory",
            description: "At the peak, the world stretched endlessly below.",
            generatedImageUrl: "data:image/png;base64,..."
          },
          p5: {
            title: "Descent & Reflection",
            description: "Coming down, we carried the mountain's spirit with us.",
            generatedImageUrl: "data:image/png;base64,..."
          }
        },
        createdAt: new Date(),
        thumbnailUrl: "mountain_thumbnail.jpg"
      }
    ];
  }
}

/**
 * Interface defining the structure of memory data
 */
interface MemoryData {
  id: string;
  title: string;
  description: string;
  theme: string;
  storyboard: Storyboard;
  createdAt: Date;
  thumbnailUrl: string;
  generatedIconUrl?: string; // AI-generated icon for the memory orb
}

interface Storyboard {
  iconCategory: string;
  p1: StoryPanel;
  p2: StoryPanel;
  p3: StoryPanel;
  p4: StoryPanel;
  p5: StoryPanel;
  // Legacy format support
  panels?: StoryPanel[];
}

interface StoryPanel {
  title: string;
  description: string;
  generatedImageUrl?: string; // Gemini-generated comic image
  imageUrl?: string; // Legacy field for compatibility
  caption?: string; // Legacy field for compatibility
  audioUrl?: string; // Legacy field for compatibility
}