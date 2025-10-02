// Background service worker for Portfolio Impact Analyzer
console.log('Background service worker starting...');

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Portfolio Impact Analyzer installed/updated:', details.reason);

  // Set default settings on first install
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      geminiModel: 'gemini-1.5-flash',
      enableThinking: false
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Portfolio Impact Analyzer service worker started');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  // Handle async responses properly
  if (request.action === 'ping') {
    sendResponse({ status: 'pong' });
    return false; // Synchronous response
  }

  // For async operations, return true to keep the message channel open
  return false;
});

// Handle extension errors
chrome.runtime.onSuspend.addListener(() => {
  console.log('Portfolio Impact Analyzer service worker suspending');
});

// Optional: Handle keyboard shortcuts (if defined in manifest)
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    console.log('Command received:', command);

    if (command === 'analyze-page') {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'analyze'}).catch(error => {
            console.log('Failed to send message to tab:', error);
          });
        }
      });
    }
  });
}

console.log('Background service worker initialized successfully');