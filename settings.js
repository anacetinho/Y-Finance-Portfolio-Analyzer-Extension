document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await initializeModelDropdown();
});

document.getElementById('settingsForm').addEventListener('submit', saveSettings);
document.getElementById('testBtn').addEventListener('click', testConfiguration);

// Listen for API key changes to refresh models
document.getElementById('geminiApiKey').addEventListener('blur', async function() {
  const apiKey = this.value.trim();
  if (apiKey && apiKey.length > 20) {
    await populateModelDropdown(apiKey);
  }
});

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

// Fallback models in case API fetch fails
const DEFAULT_MODELS = [
  { name: 'models/gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', description: 'Recommended' },
  { name: 'models/gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'High Quality' },
  { name: 'models/gemini-1.5-flash-8b', displayName: 'Gemini 1.5 Flash-8B', description: 'Fast' },
  { name: 'models/gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash', description: 'Experimental' }
];

// Fetch available models from Gemini API
async function fetchAvailableModels(apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.error('Failed to fetch models:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Filter for models that support generateContent
    const models = data.models
      .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
      .map(model => ({
        name: model.name,
        displayName: model.displayName || model.name.replace('models/', ''),
        description: getModelDescription(model.name)
      }));
    
    return models;
  } catch (error) {
    console.error('Error fetching models:', error);
    return null;
  }
}

// Get friendly description for known models
function getModelDescription(modelName) {
  const name = modelName.replace('models/', '');
  
  if (name.includes('flash-8b')) return 'Fast';
  if (name.includes('flash') && !name.includes('exp')) return 'Recommended';
  if (name.includes('pro')) return 'High Quality';
  if (name.includes('exp')) return 'Experimental';
  
  return '';
}

// Populate model dropdown with available models
async function populateModelDropdown(apiKey) {
  const select = document.getElementById('geminiModel');
  const currentValue = select.value;
  
  // Show loading state
  select.disabled = true;
  select.innerHTML = '<option>Loading models...</option>';
  
  let models = null;
  
  // Try to fetch models if API key is provided
  if (apiKey) {
    models = await fetchAvailableModels(apiKey);
    
    // Cache the models with timestamp
    if (models) {
      await chrome.storage.local.set({
        cachedModels: models,
        modelsCacheTime: Date.now()
      });
    }
  }
  
  // Use cached models if fetch failed
  if (!models) {
    const cached = await chrome.storage.local.get(['cachedModels', 'modelsCacheTime']);
    const cacheAge = Date.now() - (cached.modelsCacheTime || 0);
    
    // Use cache if less than 24 hours old
    if (cached.cachedModels && cacheAge < 24 * 60 * 60 * 1000) {
      models = cached.cachedModels;
    } else {
      // Fall back to default models
      models = DEFAULT_MODELS;
    }
  }
  
  // Populate dropdown
  select.innerHTML = '';
  models.forEach(model => {
    const option = document.createElement('option');
    const modelId = model.name.replace('models/', '');
    option.value = modelId;
    option.textContent = model.description 
      ? `${model.displayName} (${model.description})`
      : model.displayName;
    select.appendChild(option);
  });
  
  // Restore previous selection or default to first option
  if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
    select.value = currentValue;
  } else if (models.length > 0) {
    // Try to select flash model as default
    const flashModel = models.find(m => m.name.includes('flash') && !m.name.includes('8b') && !m.name.includes('exp'));
    select.value = flashModel ? flashModel.name.replace('models/', '') : models[0].name.replace('models/', '');
  }
  
  select.disabled = false;
}

// Initialize model dropdown on page load
async function initializeModelDropdown() {
  const settings = await chrome.storage.sync.get(['geminiApiKey']);
  await populateModelDropdown(settings.geminiApiKey || null);
}