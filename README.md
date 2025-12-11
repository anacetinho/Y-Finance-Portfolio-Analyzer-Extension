# Portfolio Impact Analyzer Chrome Extension

A Chrome extension that analyzes how current web page content affects your Yahoo Finance portfolio using Google's Gemini AI.

## Features

- 📊 Extract and analyze current webpage content
- 💼 Fetch live portfolio data from Yahoo Finance
- 🤖 AI-powered impact analysis using latest Gemini models
- 🧠 Optional thinking mode for deeper analysis
- 🌍 Enhanced company research with geographic and sector analysis
- ⚙️ Manual analysis control - analyze when you want
- 🎯 Manual holdings configuration as backup
- 🎨 Clean, professional UI with improved user experience
- 📌 **Side Panel Support** - Stays open while you browse and switch tabs
- 🔄 **Dynamic Model Loading** - Automatically fetches latest available Gemini models

## Installation

### 1. Download/Clone the Extension
Download or clone this repository to your local machine.

### 2. Get Required API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for later use

### 3. Get Your Yahoo Finance Portfolio URL
1. Go to [Yahoo Finance](https://finance.yahoo.com)
2. Sign in to your account
3. Navigate to your portfolio
4. Copy the full URL (should look like: `https://finance.yahoo.com/portfolio/p_12/view/v1`)

### 4. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top right
3. Click "Load unpacked"
4. Select the `portfolio-analyzer-extension` folder
5. The extension should now appear in your Chrome toolbar

### 5. Configure Settings
1. Click the extension icon in your Chrome toolbar to open the side panel
2. Click the settings button (⚙️) in the side panel
3. Enter your Yahoo Finance portfolio URL
4. Enter your Gemini API key
5. Select your preferred Gemini model (automatically loaded from Gemini API):
   - Models are fetched dynamically and cached for 24 hours
   - Default recommended models include Gemini 1.5 Flash, Gemini 2.5 Flash, etc.
   - New models appear automatically as Google releases them
6. **Optional**: Enable "Thinking Mode" for more detailed analysis
   - Shows the AI's reasoning process
   - Takes longer but provides deeper insights
   - Increases token limit for more complete responses
7. **Optional**: Enter your holdings manually in the "Manual Holdings" field (one symbol per line)
   - This provides a reliable fallback if automatic portfolio fetching fails
   - Use the exact symbols as they appear in Yahoo Finance
8. Click "Save Settings"
9. Click "Test Configuration" to verify everything works

## Usage

1. **Navigate to any financial news website** (Bloomberg, Financial Times, Reuters, etc.)
2. **Click the extension icon** in your Chrome toolbar to open the side panel
3. **Click "📊 Analyze Page"** button to start analysis
4. **Wait for analysis** - The extension will:
   - Extract the current page content
   - Fetch your portfolio data
   - Research each company's geographic exposure and business areas
   - Send all data to Gemini AI for comprehensive analysis
   - Display detailed results with company research
5. **View results in side panel** - The panel stays open while you:
   - Read the analyzed article
   - Switch to other tabs
   - Continue browsing
   - Click anywhere on the page

### Side Panel Benefits
- ✨ **Persistent Display**: Results stay visible until you manually close the panel
- ✨ **Multi-Tab Support**: Panel remains open when switching between tabs
- ✨ **Resizable**: Adjust the panel width to your preference
- ✨ **Non-Intrusive**: Doesn't block page content or close accidentally

### Example Analysis

The extension provides:
- **Impact Summary** - Overview of how the news affects your portfolio
- **Affected Holdings** - Specific stocks that may be impacted
- **Risk Assessment** - Overall risk direction and time horizon
- **Recommendations** - AI-generated suggestions

## Supported Models

The extension dynamically fetches the latest available Gemini models from Google's API. Models are automatically updated and may include:
- **Gemini 1.5 Flash** - Balanced quality and speed
- **Gemini 1.5 Pro** - High-quality detailed analysis
- **Gemini 2.0 Flash / 2.5 Flash** - Latest generation models
- **Gemini Flash-8B** - Fastest option for quick analysis
- **Experimental Models** - Cutting-edge features as they're released

Models are cached for 24 hours and automatically refreshed when you enter your API key in settings.

## New Features

### Enhanced Company Research
The extension now automatically researches each company in your portfolio to provide:
- **Geographic Exposure**: Countries and regions where each company operates
- **Business Sectors**: Main business areas and revenue sources
- **Market Position**: Competitive positioning and recent performance

### Thinking Mode
Enable thinking mode in settings for:
- **Deeper Analysis**: AI shows its reasoning process
- **More Detailed Insights**: Step-by-step analysis of each holding
- **Better Accuracy**: More thorough consideration of all factors

### Manual Control
- **No Auto-Start**: Extension waits for you to click "Analyze Page"
- **Better User Experience**: You control when analysis begins
- **Clear States**: Idle, loading, results, and error states

## Troubleshooting

### "Please configure your settings first"
- Make sure you've entered both your portfolio URL and Gemini API key
- Test your configuration in the settings page

### "Unable to extract meaningful content"
- Try refreshing the page and running the analysis again
- Some pages may have content protection that prevents extraction

### "Unable to fetch portfolio data"
- Check that your Yahoo Finance portfolio URL is correct
- Make sure you're signed in to Yahoo Finance
- Try accessing your portfolio directly first

### "Failed to get AI analysis"
- Verify your Gemini API key is correct
- Check your internet connection
- Ensure you haven't exceeded API rate limits
- Try a different Gemini model in settings
- Reload the extension if the service worker fails to start

### Extension Loading Issues
- If you see "Service worker registration failed", reload the extension
- Ensure all files are in the correct folder structure
- Check that manifest.json exists and is valid

## Privacy & Security

- **API Key Storage**: Your Gemini API key is stored locally in Chrome's sync storage
- **Data Processing**: Page content and portfolio data are sent to Google's Gemini API for analysis
- **No Data Collection**: The extension doesn't collect or store any personal data
- **Local Processing**: All data extraction happens locally in your browser

## File Structure

```
portfolio-analyzer-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.js               # Core analysis logic
├── settings.html          # Configuration page
├── settings.js            # Settings management
├── content.js             # Page content extraction
├── background.js          # Service worker
├── styles.css             # UI styling
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── TROUBLESHOOTING.md     # Detailed troubleshooting guide
└── README.md              # This file
```

## Development

### Permissions
The extension requires:
- `activeTab` - Access current webpage content
- `storage` - Save settings locally
- `scripting` - Execute content extraction scripts
- `cookies` - Access Yahoo Finance portfolio data
- `tabs` - Tab management for analysis
- `sidePanel` - Display results in persistent side panel
- Host permissions for Yahoo Finance and Gemini APIs

### Modifying the Extension
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Recent Updates

### Version 1.2 - Latest Features
- ✅ **Side Panel Support**: Results stay open while browsing and switching tabs
- ✅ **Dynamic Model Loading**: Automatically fetches latest Gemini models from API
- ✅ **Model Caching**: 24-hour cache for faster loading
- ✅ **Improved JSON Parsing**: Better handling of Gemini 2.5 Flash responses
- ✅ **Increased Token Limits**: 4096 tokens (normal), 8192 tokens (thinking mode)
- ✅ **Truncation Detection**: Warns when responses are incomplete

### Version 1.1 - Previous Fixes
- ✅ **Fixed Gemini API Integration**: Resolved "Failed to get AI analysis" errors
- ✅ **Fixed Service Worker**: Resolved "Service worker registration failed" issues
- ✅ **Updated Model Support**: Using actual available Gemini models
- ✅ **Enhanced Error Handling**: Better error messages and debugging info
- ✅ **Improved Portfolio Extraction**: Better Yahoo Finance data scraping
- ✅ **Manual Holdings Support**: Reliable fallback when auto-extraction fails

### Key Improvements
- **Thinking Mode**: Optional deeper analysis with AI reasoning
- **Company Research**: Automatic web search for geographic and sector data
- **Manual Control**: No auto-start, user-controlled analysis
- **Better UX**: Clear loading states and error messages

## Support

For issues or questions:
1. Check the troubleshooting section above
2. See TROUBLESHOOTING.md for detailed solutions
3. Verify your API key and portfolio URL are correct
4. Test the configuration in settings
5. Try the extension on different financial news websites