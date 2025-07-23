// LexiFix Content Script - Text Highlighter
// This script runs on web pages and handles text highlighting

let isHighlightingEnabled = true;
let highlightColor = '#ffff00'; // Default yellow highlight

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleHighlighting') {
    isHighlightingEnabled = request.enabled;
    sendResponse({success: true});
  } else if (request.action === 'updateHighlightColor') {
    highlightColor = request.color;
    sendResponse({success: true});
  } else if (request.action === 'highlightSelectedText') {
    highlightSelectedText();
    sendResponse({success: true});
  }
});

// Function to highlight currently selected text
function highlightSelectedText() {
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      // Create a span element to wrap the selected text
      const highlightSpan = document.createElement('span');
      highlightSpan.style.backgroundColor = highlightColor;
      highlightSpan.style.borderRadius = '2px';
      highlightSpan.className = 'lexifix-highlight';
      
      // Wrap the selected text in the highlight span
      range.surroundContents(highlightSpan);
      
      // Clear the selection
      selection.removeAllRanges();
      
      console.log('Text highlighted:', selectedText);
    }
  }
}

// Add event listener for double-click to highlight
document.addEventListener('dblclick', function(event) {
  if (isHighlightingEnabled) {
    // Small delay to let the selection complete
    setTimeout(() => {
      highlightSelectedText();
    }, 100);
  }
});

// Add keyboard shortcut (Ctrl+Shift+H) to highlight
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.shiftKey && event.key === 'H') {
    event.preventDefault();
    if (isHighlightingEnabled) {
      highlightSelectedText();
    }
  }
});

// Initialize by loading saved settings
chrome.storage.local.get(['highlightColor', 'isHighlightingEnabled'], function(result) {
  if (result.highlightColor) {
    highlightColor = result.highlightColor;
  }
  if (result.isHighlightingEnabled !== undefined) {
    isHighlightingEnabled = result.isHighlightingEnabled;
  }
});

console.log('LexiFix Content Script loaded - Text highlighting ready!'); 