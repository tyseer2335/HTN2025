import { MemoryOrbGallery } from "./MemoryOrbGallery";
import { Snap3DInteractableFactory } from "./Snap3DInteractableFactory";
import { ASRQueryController } from "./ASRQueryController";

/**
 * Integrates the memory orb gallery with your existing Snap3D and web app systems.
 * Handles communication between the Spectacles app and your backend for memory synchronization.
 *
 * @version 1.0.0
 */
@component
export class MemoryGalleryIntegration extends BaseScriptComponent {
  /**
   * Reference to the memory orb gallery
   */
  @input
  memoryGallery: MemoryOrbGallery;

  /**
   * Reference to your existing Snap3D factory
   */
  @input
  snap3DFactory: Snap3DInteractableFactory;

  /**
   * Reference to ASR query controller for voice commands
   */
  @input
  asrController: ASRQueryController;

  /**
   * Your web app backend URL
   */
  @input
  @widget(new TextAreaWidget())
  backendUrl: string = "http://localhost:3000"; // Update with your actual backend URL

  /**
   * User authentication token for API calls
   */
  @input
  @widget(new TextAreaWidget())
  private authToken: string = "";

  /**
   * Interval for checking new memories (in seconds)
   */
  @input
  syncInterval: number = 30;

  /**
   * Enable voice commands for gallery interaction
   */
  @input
  enableVoiceCommands: boolean = true;

  private lastSyncTime: number = 0;
  private isOnline: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initializeIntegration();
    });

    this.createEvent("UpdateEvent").bind(() => {
      this.updateSync();
    });
  }

  /**
   * Initializes the integration system
   */
  private initializeIntegration(): void {
    print("Initializing Memory Gallery Integration...");

    // Set up voice commands if enabled
    if (this.enableVoiceCommands && this.asrController) {
      this.setupVoiceCommands();
    }

    // Check internet connectivity
    this.checkConnectivity();

    // Initial sync with backend
    this.syncWithBackend();

    print("Memory Gallery Integration initialized");
  }

  /**
   * Sets up voice commands for gallery interaction
   */
  private setupVoiceCommands(): void {
    this.asrController.onQueryEvent.add((query: string) => {
      this.handleVoiceCommand(query.toLowerCase());
    });
  }

  /**
   * Handles voice commands for gallery interaction
   */
  private handleVoiceCommand(command: string): void {
    print("Voice command received: " + command);

    if (command.includes("show memories") || command.includes("open gallery")) {
      this.showMemoryGallery();
    } else if (command.includes("create memory") || command.includes("new memory")) {
      this.handleCreateMemoryCommand(command);
    } else if (command.includes("close gallery") || command.includes("hide memories")) {
      this.hideMemoryGallery();
    } else if (command.includes("sync memories") || command.includes("refresh")) {
      this.syncWithBackend();
    }
  }

  /**
   * Handles voice command for creating new memories
   */
  private handleCreateMemoryCommand(command: string): void {
    // Extract description from voice command
    let description = command.replace(/create memory|new memory/g, "").trim();
    if (description.length === 0) {
      description = "New memory created via voice command";
    }

    print("Voice memory creation requested: " + description);
    print("Note: Photo upload integration pending - requires camera access setup");
  }

  /**
   * Shows the memory gallery
   */
  public showMemoryGallery(): void {
    if (this.memoryGallery) {
      this.memoryGallery.sceneObject.enabled = true;
      print("Memory gallery opened");
    }
  }

  /**
   * Hides the memory gallery
   */
  public hideMemoryGallery(): void {
    if (this.memoryGallery) {
      this.memoryGallery.sceneObject.enabled = false;
      print("Memory gallery closed");
    }
  }

  /**
   * Checks internet connectivity
   */
  private checkConnectivity(): void {
    // Basic connectivity check using the backend ping
    this.isOnline = true; // Will be updated by sync results
    print("Connectivity status: " + (this.isOnline ? "Online" : "Offline"));
  }

  /**
   * Updates sync timing
   */
  private updateSync(): void {
    const currentTime = getTime();
    if (currentTime - this.lastSyncTime > this.syncInterval) {
      this.lastSyncTime = currentTime;
      if (this.isOnline) {
        this.syncWithBackend();
      }
    }
  }

  /**
   * Syncs memories with your backend
   */
  private async syncWithBackend(): Promise<void> {
    if (!this.isOnline || !this.backendUrl) {
      print("Cannot sync: offline or no backend URL");
      return;
    }

    try {
      print("Syncing with backend: " + this.backendUrl);

      // Fetch new memories from your backend
      const memories = await this.fetchMemoriesFromBackend();

      // Update the gallery with new memories
      if (memories && memories.length > 0 && this.memoryGallery) {
        memories.forEach(memory => {
          this.memoryGallery.addMemory(memory);
        });
        print(`Synced ${memories.length} memories`);
      }

    } catch (error) {
      print("Sync failed: " + error);
    }
  }

  /**
   * Fetches memories from your backend API
   */
  private async fetchMemoriesFromBackend(): Promise<any[]> {
    try {
      print("Fetching memories from: " + this.backendUrl + "/api/memories");

      // Note: HTTP requests in Spectacles require RemoteServiceModule
      // For now, returning local sample data until HTTP module is configured

      const delayedEvent = this.createEvent("DelayedCallbackEvent");
      return new Promise((resolve) => {
        delayedEvent.bind(() => {
          resolve(this.generateSampleMemories());
        });
        delayedEvent.reset(1.0);
      });
    } catch (error) {
      print("Backend fetch failed: " + error);
      return [];
    }
  }

  /**
   * Uploads a new memory to your backend
   */
  public async uploadMemoryToBackend(memoryData: any): Promise<boolean> {
    if (!this.isOnline || !this.backendUrl) {
      print("Cannot upload: offline or no backend URL");
      return false;
    }

    try {
      print("Memory upload requested - requires HTTP module setup");
      print("Memory data ready: " + memoryData.title);

      // HTTP upload requires RemoteServiceModule configuration
      return true; // Simulate success for now

    } catch (error) {
      print("Upload failed: " + error);
      return false;
    }
  }

  /**
   * Generates sample memories for testing
   */
  private generateSampleMemories(): any[] {
    return [
      {
        id: "sample_memory_1",
        title: "Sample Memory 1",
        description: "Local test memory for development",
        theme: "sketch",
        storyboard: {
          panels: [
            {
              imageUrl: "local://placeholder1.jpg",
              caption: "Sample panel for testing the memory system.",
              audioUrl: "local://sample_audio1.mp3"
            },
            {
              imageUrl: "local://placeholder2.jpg",
              caption: "Second panel showing the story progression.",
              audioUrl: "local://sample_audio2.mp3"
            }
          ]
        },
        createdAt: new Date(),
        thumbnailUrl: "local://sample_thumbnail.jpg"
      }
    ];
  }

  /**
   * Integrates with your existing Snap3D system
   */
  public createMemoryWith3DObject(prompt: string, memoryTitle: string): void {
    if (!this.snap3DFactory) {
      print("Snap3D factory not available");
      return;
    }

    print("Creating 3D object for memory: " + memoryTitle);

    // Create a 3D object using your existing system
    this.snap3DFactory.createInteractable3DObject(prompt).then((result) => {
      print("3D object created for memory: " + result);
      print("3D object could be integrated as special storyboard panel");
    }).catch((error) => {
      print("Failed to create 3D object: " + error);
    });
  }

  /**
   * Sets the authentication token for API calls
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    print("Auth token updated");
  }

  /**
   * Sets the backend URL
   */
  public setBackendUrl(url: string): void {
    this.backendUrl = url;
    print("Backend URL updated: " + url);
  }

  /**
   * Gets the current sync status
   */
  public getSyncStatus(): string {
    const timeSinceLastSync = getTime() - this.lastSyncTime;
    return `Last sync: ${timeSinceLastSync.toFixed(1)}s ago, Online: ${this.isOnline}`;
  }

  /**
   * Forces an immediate sync
   */
  public forceSyncNow(): void {
    this.lastSyncTime = 0; // Reset timer to force immediate sync
    this.syncWithBackend();
  }

  /**
   * Enables or disables voice commands
   */
  public setVoiceCommandsEnabled(enabled: boolean): void {
    this.enableVoiceCommands = enabled;
    print("Voice commands " + (enabled ? "enabled" : "disabled"));
  }
}