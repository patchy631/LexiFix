// LexiFix Popup Script - The Brain of the Extension
// This handles all user interactions and coordinates with content.js

// DOM elements
const highlightToggle = document.getElementById('highlightToggle');
const colorPicker = document.getElementById('colorPicker');
const highlightBtn = document.getElementById('highlightBtn');
const statusMessage = document.getElementById('status');

// Current settings
let currentSettings = {
    isHighlightingEnabled: true,
    highlightColor: '#ffff00'
};

// Initialize popup when it loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('LexiFix Popup loaded');
    loadSettings();
    setupEventListeners();
    updateStatus('Ready to highlight!');
});

// Load saved settings from storage
function loadSettings() {
    chrome.storage.local.get(['isHighlightingEnabled', 'highlightColor'], function(result) {
        if (result.isHighlightingEnabled !== undefined) {
            currentSettings.isHighlightingEnabled = result.isHighlightingEnabled;
            highlightToggle.checked = currentSettings.isHighlightingEnabled;
        }
        
        if (result.highlightColor) {
            currentSettings.highlightColor = result.highlightColor;
            colorPicker.value = currentSettings.highlightColor;
        }
        
        // Send current settings to content script
        sendMessageToContentScript({
            action: 'updateSettings',
            settings: currentSettings
        });
    });
}

// Save settings to storage
function saveSettings() {
    chrome.storage.local.set({
        isHighlightingEnabled: currentSettings.isHighlightingEnabled,
        highlightColor: currentSettings.highlightColor
    });
}

// Send message to content script
function sendMessageToContentScript(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
                if (chrome.runtime.lastError) {
                    console.log('Content script not ready yet');
                } else {
                    console.log('Message sent to content script:', message);
                }
            });
        }
    });
}

// Setup event listeners for user interactions
function setupEventListeners() {
    // Toggle highlighting on/off
    highlightToggle.addEventListener('change', function() {
        currentSettings.isHighlightingEnabled = this.checked;
        
        // Save to storage
        saveSettings();
        
        // Send to content script
        sendMessageToContentScript({
            action: 'toggleHighlighting',
            enabled: currentSettings.isHighlightingEnabled
        });
        
        // Update status
        const status = currentSettings.isHighlightingEnabled ? 'Highlighting enabled!' : 'Highlighting disabled!';
        updateStatus(status, currentSettings.isHighlightingEnabled ? 'success' : 'warning');
    });
    
    // Change highlight color
    colorPicker.addEventListener('change', function() {
        currentSettings.highlightColor = this.value;
        
        // Save to storage
        saveSettings();
        
        // Send to content script
        sendMessageToContentScript({
            action: 'updateHighlightColor',
            color: currentSettings.highlightColor
        });
        
        // Update status
        updateStatus(`Highlight color changed to ${currentSettings.highlightColor}!`);
    });
    
    // Manual highlight button
    highlightBtn.addEventListener('click', function() {
        // Send highlight command to content script
        sendMessageToContentScript({
            action: 'highlightSelectedText'
        });
        
        // Update status
        updateStatus('Highlighting selected text...');
        
        // Reset status after a moment
        setTimeout(() => {
            updateStatus('Ready to highlight!');
        }, 2000);
    });
}

// Update status message
function updateStatus(message, type = 'success') {
    statusMessage.textContent = message;
    
    // Remove existing classes
    statusMessage.classList.remove('success', 'error', 'warning');
    
    // Add appropriate class
    if (type === 'error') {
        statusMessage.classList.add('error');
    } else if (type === 'warning') {
        statusMessage.classList.add('warning');
    } else {
        statusMessage.classList.add('success');
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'highlightSuccess') {
        updateStatus('Text highlighted successfully!');
    } else if (request.action === 'highlightError') {
        updateStatus('No text selected to highlight!', 'error');
    }
});

// Handle popup window focus (when user clicks extension icon)
window.addEventListener('focus', function() {
    // Refresh settings when popup opens
    loadSettings();
});

// Handle errors gracefully
window.addEventListener('error', function(e) {
    console.error('Popup error:', e.error);
    updateStatus('An error occurred. Please try again.', 'error');
});

console.log('LexiFix Popup Script initialized'); 