document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('testBtn').addEventListener('click', testConfiguration);

async function loadSettings() {
  const settings = await chrome.storage.sync.get(['portfolioUrl', 'geminiApiKey', 'geminiModel', 'enableThinking', 'manualHoldings']);

  if (settings.portfolioUrl) {
    document.getElementById('portfolioUrl').value = settings.portfolioUrl;
  }

  if (settings.geminiApiKey) {
    document.getElementById('geminiApiKey').value = settings.geminiApiKey;
  }

  if (settings.geminiModel) {
    document.getElementById('geminiModel').value = settings.geminiModel;
  }

  if (settings.enableThinking !== undefined) {
    document.getElementById('enableThinking').checked = settings.enableThinking;
  }

  if (settings.manualHoldings) {
    document.getElementById('manualHoldings').value = settings.manualHoldings;
  }
}

async function saveSettings(e) {
  e.preventDefault();

  const settings = {
    portfolioUrl: document.getElementById('portfolioUrl').value,
    geminiApiKey: document.getElementById('geminiApiKey').value,
    geminiModel: document.getElementById('geminiModel').value,
    enableThinking: document.getElementById('enableThinking').checked,
    manualHoldings: document.getElementById('manualHoldings').value
  };

  try {
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

async function testConfiguration() {
  const portfolioUrl = document.getElementById('portfolioUrl').value;
  const geminiApiKey = document.getElementById('geminiApiKey').value;
  const geminiModel = document.getElementById('geminiModel').value;

  if (!portfolioUrl || !geminiApiKey || !geminiModel) {
    showStatus('Please fill in all fields before testing', 'error');
    return;
  }

  showStatus('Testing configuration...', 'info');

  try {
    // Test Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, please respond with "API test successful"'
          }]
        }]
      })
    });

    if (response.ok) {
      showStatus('Configuration test successful!', 'success');
    } else {
      showStatus('Gemini API test failed. Please check your API key.', 'error');
    }

  } catch (error) {
    showStatus('Test failed: ' + error.message, 'error');
  }
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status-message ${type}`;

  setTimeout(() => {
    status.textContent = '';
    status.className = 'status-message';
  }, 5000);
}