// RSGGeminiHelper.js
// Requires Remote Service Gateway package installed and token set in RemoteServiceGatewayCredentials

var Gemini = require('Remote Service Gateway.lspkg/HostedExternal/Gemini').Gemini;

function _extractInlineImageDataUrl(resp) {
    var cand = resp && resp.candidates && resp.candidates[0];
    if (!cand || !cand.content || !cand.content.parts) return null;

    for (var i = 0; i < cand.content.parts.length; i++) {
        var part = cand.content.parts[i];
        if (part.inlineData) {
            var mime = part.inlineData.mimeType || 'image/png';
            return 'data:' + mime + ';base64,' + part.inlineData.data;
        }
        if (part.text && part.text.indexOf('data:image') === 0) {
            // If the model returns a data URL as text (fallback)
            return part.text.trim();
        }
    }
    return null;
}

function generatePanelImage(description, panelIndex, theme) {
    var style = theme || 'watercolor';
    var req = {
        model: 'gemini-2.0-flash',
        type: 'models',
        body: {
            contents: [{
                role: 'user',
                parts: [{
                    text:
                        'Create a ' + style + ' storyboard illustration with cinematic composition.\n' +
                        'No text in the image. 16:9 aspect ratio.\n' +
                        'Panel ' + (panelIndex + 1) + ' scene: ' + description
                }]
            }]
        }
    };

    return Gemini.models(req).then(function(resp){
        var dataUrl = _extractInlineImageDataUrl(resp);
        if (!dataUrl) throw 'No image in Gemini response';
        return dataUrl;
    });
}

function generateIcon(iconCategory, theme) {
    var t = theme || 'low-poly';
    var req = {
        model: 'gemini-2.0-flash',
        type: 'models',
        body: {
            contents: [{
                role: 'user',
                parts: [{
                    text:
                        'Create a ' + t + ' icon for "' + iconCategory + '". ' +
                        '512x512, bold silhouette, AR-friendly, no text.'
                }]
            }]
        }
    };

    return Gemini.models(req).then(function(resp){
        var dataUrl = _extractInlineImageDataUrl(resp);
        if (!dataUrl) throw 'No image in Gemini response';
        return dataUrl;
    });
}

function enhanceTitle(blurb) {
    var req = {
        model: 'gemini-2.0-flash',
        type: 'models',
        body: {
            contents: [{
                role: 'user',
                parts: [{
                    text:
                        'Create a catchy 3–5 word travel memory title. ' +
                        'Avoid generic words (trip/journey). Return ONLY the title.\n\n' +
                        'Blurb: ' + blurb
                }]
            }]
        }
    };

    return Gemini.models(req).then(function(resp){
        var cand = resp && resp.candidates && resp.candidates[0];
        var textPart = cand && cand.content && cand.content.parts && cand.content.parts[0] && cand.content.parts[0].text;
        return (textPart || '').trim();
    });
}

script.api = {
    generatePanelImage: generatePanelImage,
    generateIcon: generateIcon,
    enhanceTitle: enhanceTitle
};