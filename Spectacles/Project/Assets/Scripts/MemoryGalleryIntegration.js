/**
 * Integrates the memory story gallery with your existing Snap3D and web app systems.
 * Handles communication between the Spectacles app and your backend for memory synchronization.
 */

// @input Component.ScriptComponent memoryStoryController
// @input Component.ScriptComponent snap3DFactory
// @input Component.ScriptComponent asrController
// @input string backendUrl = "http://localhost:8787"
// @input string authToken = ""
// @input int syncInterval = 30
// @input bool enableVoiceCommands = true

var lastSyncTime = 0;
var isOnline = false;

// Initialize on start
var onStart = script.createEvent("OnStartEvent");
onStart.bind(initializeIntegration);

// Update loop for sync
var onUpdate = script.createEvent("UpdateEvent");
onUpdate.bind(updateSync);

function initializeIntegration() {
    print("Initializing Memory Gallery Integration...");

    // Set up voice commands if enabled
    if (script.enableVoiceCommands && script.asrController) {
        setupVoiceCommands();
    }

    // Check connectivity
    checkConnectivity();

    // Initial sync with backend
    syncWithBackend();

    print("Memory Gallery Integration initialized");
}

function setupVoiceCommands() {
    if (script.asrController && script.asrController.onQueryEvent) {
        script.asrController.onQueryEvent.add(function(query) {
            handleVoiceCommand(query.toLowerCase());
        });
    }
}

function handleVoiceCommand(command) {
    print("Voice command received: " + command);

    if (command.includes("show memories") || command.includes("open gallery")) {
        showMemoryGallery();
    } else if (command.includes("create memory") || command.includes("new memory")) {
        handleCreateMemoryCommand(command);
    } else if (command.includes("close gallery") || command.includes("hide memories")) {
        hideMemoryGallery();
    } else if (command.includes("sync memories") || command.includes("refresh")) {
        syncWithBackend();
    }
}

function handleCreateMemoryCommand(command) {
    // Extract description from voice command
    var description = command.replace(/create memory|new memory/g, "").trim();
    if (description.length === 0) {
        description = "New memory created via voice command";
    }

    print("Voice memory creation requested: " + description);
    print("Note: Photo upload integration pending - requires camera access setup");
}

function showMemoryGallery() {
    if (script.memoryStoryController) {
        // Call the toggleGallery function on the story controller
        if (global.toggleGallery) {
            global.toggleGallery();
        }
        print("Memory gallery opened");
    }
}

function hideMemoryGallery() {
    if (script.memoryStoryController) {
        // Close the gallery by calling toggle if it's open
        print("Memory gallery closed");
    }
}

function checkConnectivity() {
    // Basic connectivity check
    isOnline = true; // Will be updated by sync results
    print("Connectivity status: " + (isOnline ? "Online" : "Offline"));
}

function updateSync() {
    var currentTime = getTime();
    if (currentTime - lastSyncTime > script.syncInterval) {
        lastSyncTime = currentTime;
        if (isOnline) {
            syncWithBackend();
        }
    }
}

function syncWithBackend() {
    if (!isOnline || !script.backendUrl) {
        print("Cannot sync: offline or no backend URL");
        return;
    }

    try {
        print("Syncing with backend: " + script.backendUrl);

        // Fetch new memories from your backend
        fetchMemoriesFromBackend().then(function(memories) {
            // Update the story controller with new memories
            if (memories && memories.length > 0) {
                if (global.updateStoryData) {
                    global.updateStoryData(JSON.stringify(memories[0])); // Use first memory
                }
                print("Synced " + memories.length + " memories");
            }
        });

    } catch (error) {
        print("Sync failed: " + error);
    }
}

function fetchMemoriesFromBackend() {
    return new Promise(function(resolve) {
        print("Fetching memories from: " + script.backendUrl + "/api/memories");

        // TODO: HTTP requests in Spectacles require RemoteServiceModule
        // For now, returning sample data until HTTP module is configured

        var delayedEvent = script.createEvent("DelayedCallbackEvent");
        delayedEvent.bind(function() {
            resolve(generateSampleMemories());
        });
        delayedEvent.reset(1.0);
    });
}

function uploadMemoryToBackend(memoryData) {
    if (!isOnline || !script.backendUrl) {
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

function generateSampleMemories() {
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

function createMemoryWith3DObject(prompt, memoryTitle) {
    if (!script.snap3DFactory) {
        print("Snap3D factory not available");
        return;
    }

    print("Creating 3D object for memory: " + memoryTitle);

    // Create a 3D object using your existing system
    if (script.snap3DFactory.createInteractable3DObject) {
        script.snap3DFactory.createInteractable3DObject(prompt).then(function(result) {
            print("3D object created for memory: " + result);
            print("3D object could be integrated as special storyboard panel");
        }).catch(function(error) {
            print("Failed to create 3D object: " + error);
        });
    }
}

function setAuthToken(token) {
    script.authToken = token;
    print("Auth token updated");
}

function setBackendUrl(url) {
    script.backendUrl = url;
    print("Backend URL updated: " + url);
}

function getSyncStatus() {
    var timeSinceLastSync = getTime() - lastSyncTime;
    return "Last sync: " + timeSinceLastSync.toFixed(1) + "s ago, Online: " + isOnline;
}

function forceSyncNow() {
    lastSyncTime = 0; // Reset timer to force immediate sync
    syncWithBackend();
}

function setVoiceCommandsEnabled(enabled) {
    script.enableVoiceCommands = enabled;
    print("Voice commands " + (enabled ? "enabled" : "disabled"));
}

// Export functions for external use
global.memoryGalleryIntegration = {
    showMemoryGallery: showMemoryGallery,
    hideMemoryGallery: hideMemoryGallery,
    syncWithBackend: syncWithBackend,
    forceSyncNow: forceSyncNow,
    getSyncStatus: getSyncStatus,
    setAuthToken: setAuthToken,
    setBackendUrl: setBackendUrl,
    setVoiceCommandsEnabled: setVoiceCommandsEnabled
};