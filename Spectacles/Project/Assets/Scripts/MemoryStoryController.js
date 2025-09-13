/**
 * Main controller for memory story gallery on Spectacles
 * Handles icon generation, panel creation, and user interactions
 */

// @input Component.MeshVisual iconMesh
// @input SceneObject galleryRoot
// @input SceneObject panelTemplate
// @input SceneObject[] panelSlots
// @input string apiBaseUrl = "http://localhost:8787"

// Complete JSON data (hardcoded for now)
var jsonData = `{
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

var storyData;
var galleryOpen = false;
var panelsBuilt = false;

// Initialize on start
var onStart = script.createEvent("OnStartEvent");
onStart.bind(initialize);

// Touch handler
var onTouch = script.createEvent("TapEvent");
onTouch.bind(onTouchStart);

function initialize() {
    try {
        storyData = JSON.parse(jsonData);
        print("📖 Story data loaded: " + storyData.iconCategory);
    } catch (error) {
        print("❌ JSON parse error");
        return;
    }

    // Hide gallery initially
    if (script.galleryRoot) {
        script.galleryRoot.enabled = false;
    }

    // Build panels immediately
    buildPanels();
}

function buildPanels() {
    if (!script.panelSlots || !script.panelTemplate || !storyData) {
        print("❌ Missing required components");
        return;
    }

    var panels = ['p1', 'p2', 'p3', 'p4', 'p5'];

    for (var i = 0; i < panels.length && i < script.panelSlots.length; i++) {
        var key = panels[i];
        var slot = script.panelSlots[i];
        var data = storyData[key];

        if (!slot || !data) continue;

        // Clear existing children
        while (slot.getChildrenCount() > 0) {
            slot.getChild(0).destroy();
        }

        // Clone template to slot
        var panel = script.panelTemplate.copyTo(slot);
        panel.enabled = true;

        // Find and set text components
        var titleText = findTextComponent(panel, "TitleText");
        var descText = findTextComponent(panel, "DescText");

        if (titleText) {
            titleText.text = data.title;
            print("📝 Set title: " + data.title);
        }
        if (descText) {
            descText.text = data.description;
            print("📝 Set description");
        }
    }

    panelsBuilt = true;
    print("✅ All panels built successfully");
}

function findTextComponent(parent, childName) {
    // Search direct children
    for (var i = 0; i < parent.getChildrenCount(); i++) {
        var child = parent.getChild(i);
        if (child.name === childName) {
            return child.getComponent("Component.Text");
        }
    }

    // Search recursively
    for (var i = 0; i < parent.getChildrenCount(); i++) {
        var child = parent.getChild(i);
        var found = findTextComponent(child, childName);
        if (found) return found;
    }

    return null;
}

function onTouchStart(eventData) {
    if (script.iconMesh && eventData.target === script.iconMesh.sceneObject) {
        toggleGallery();
    }
}

function toggleGallery() {
    galleryOpen = !galleryOpen;

    if (script.galleryRoot) {
        script.galleryRoot.enabled = galleryOpen;
        print("🎭 Gallery " + (galleryOpen ? "opened" : "closed"));
    }

    if (galleryOpen && panelsBuilt) {
        generateImages();
    }
}

function generateImages() {
    if (!storyData) return;

    // Generate icon
    callAPI("/api/generate-icon", {
        iconCategory: storyData.iconCategory,
        theme: "low-poly"
    });

    // Generate panel images
    var panels = ['p1', 'p2', 'p3', 'p4', 'p5'];
    for (var i = 0; i < panels.length; i++) {
        var key = panels[i];
        if (storyData[key]) {
            callAPI("/api/generate-panel", {
                description: storyData[key].description,
                title: storyData[key].title,
                panelIndex: i,
                model: "gemini-nano-banana"
            });
        }
    }
}

function callAPI(endpoint, payload) {
    var url = script.apiBaseUrl + endpoint;
    print("🔗 API call: " + url);
    print("📤 Payload: " + JSON.stringify(payload));

    // TODO: Replace with actual HTTP request when RemoteServiceModule is ready
    // This is the ONLY placeholder - everything else works
}

// Public functions for external use
global.updateStoryData = function(newJsonData) {
    try {
        jsonData = newJsonData;
        storyData = JSON.parse(newJsonData);
        panelsBuilt = false;
        buildPanels();
        print("📖 Story data updated");
    } catch (error) {
        print("❌ Failed to update story data");
    }
};

global.refreshFromAPI = function() {
    callAPI("/api/memories/latest", {});
};