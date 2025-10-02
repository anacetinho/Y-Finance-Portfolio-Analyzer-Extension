# Installation Guide - Portfolio Impact Analyzer

## Prerequisites

- Google Chrome browser
- Yahoo Finance account with a portfolio
- Google account for Gemini API access

## Step-by-Step Installation

### Step 1: Prepare Your API Key

1. **Open Google AI Studio**
   - Navigate to: https://aistudio.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Choose "Create API key in new project" (recommended)
   - Copy the generated API key
   - Store it safely (you'll need it in Step 4)

### Step 2: Get Your Portfolio URL

1. **Access Yahoo Finance**
   - Go to: https://finance.yahoo.com
   - Sign in to your account

2. **Navigate to Your Portfolio**
   - Click "My Portfolio" or "Portfolios" in the navigation
   - Select the portfolio you want to analyze
   - Copy the entire URL from your browser's address bar
   - Example: `https://finance.yahoo.com/portfolio/p_12/view/v1`

### Step 3: Install the Extension

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar
   - Press Enter

2. **Enable Developer Mode**
   - Find the "Developer mode" toggle in the top right
   - Click to enable it

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the `portfolio-analyzer-extension` folder
   - Select the folder and click "Select Folder"
   - The extension should appear in your extensions list

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Portfolio Impact Analyzer"
   - Click the pin icon to keep it visible

### Step 4: Configure the Extension

1. **Open Extension Settings**
   - Click the Portfolio Impact Analyzer icon in your Chrome toolbar
   - Click the settings button (⚙️) in the popup that appears

2. **Enter Your Information**
   - **Portfolio URL**: Paste your Yahoo Finance portfolio URL
   - **Gemini API Key**: Paste your Google AI Studio API key
   - **Model**: Select "Gemini 1.5 Flash" (recommended for most users)

3. **Save and Test**
   - Click "Save Settings"
   - Click "Test Configuration" to verify everything works
   - You should see "Configuration test successful!" message

### Step 5: First Use

1. **Navigate to Financial News**
   - Go to any financial news website
   - Examples: Bloomberg.com, ft.com, reuters.com, cnbc.com

2. **Run Analysis**
   - Click the Portfolio Impact Analyzer icon
   - Wait for the analysis to complete (usually 10-30 seconds)
   - Review the results showing impact on your portfolio

## Verification Checklist

- [ ] Chrome developer mode is enabled
- [ ] Extension loads without errors in chrome://extensions/
- [ ] Settings page opens when clicking the gear icon
- [ ] API key test passes in settings
- [ ] Extension popup shows when clicking the icon
- [ ] Analysis runs successfully on a financial news page

## Common Setup Issues

### Extension Won't Load
- **Problem**: Error when loading unpacked extension
- **Solution**: Make sure you selected the `portfolio-analyzer-extension` folder, not a parent folder

### API Test Fails
- **Problem**: "Gemini API test failed" message
- **Solution**:
  - Double-check your API key (no extra spaces)
  - Verify your Google account has API access
  - Try generating a new API key

### Portfolio Data Error
- **Problem**: "Unable to fetch portfolio data"
- **Solution**:
  - Ensure you're logged into Yahoo Finance
  - Check that your portfolio URL is complete and correct
  - Try accessing your portfolio directly in Yahoo Finance first

### No Analysis Results
- **Problem**: Extension shows loading but never completes
- **Solution**:
  - Check your internet connection
  - Try a different financial news website
  - Verify your API key hasn't exceeded rate limits

## Security Notes

- Your API key is stored locally in Chrome's secure storage
- No data is sent to any servers except Google's Gemini API
- The extension only accesses the current webpage you're viewing
- You can revoke API access anytime in Google AI Studio

## Next Steps

Once installed and configured:
1. Try the extension on different financial news websites
2. Experiment with different Gemini models in settings
3. Check how different types of news affect your specific portfolio
4. Use the risk assessment to inform your investment decisions

For ongoing use, the extension will remember your settings and work automatically on any webpage.