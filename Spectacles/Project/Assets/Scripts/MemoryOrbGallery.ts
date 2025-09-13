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
   * Loads memories from MongoDB Atlas via the web app API
   */
  private async loadMemoriesFromStorage(): Promise<void> {
    try {
      // This would connect to your web app backend to fetch memories
      // For now, we'll use placeholder data
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
          panels: [
            {
              imageUrl: "placeholder_beach_1.jpg",
              caption: "The sun was shining as we arrived at the pristine beach.",
              audioUrl: "placeholder_audio_1.mp3"
            },
            {
              imageUrl: "placeholder_beach_2.jpg",
              caption: "Building sandcastles became our afternoon adventure.",
              audioUrl: "placeholder_audio_2.mp3"
            }
          ]
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
          panels: [
            {
              imageUrl: "placeholder_mountain_1.jpg",
              caption: "The trail began steep and challenging.",
              audioUrl: "placeholder_audio_3.mp3"
            }
          ]
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
}

interface Storyboard {
  panels: StoryPanel[];
}

interface StoryPanel {
  imageUrl: string;
  caption: string;
  audioUrl: string;
}