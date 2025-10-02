# Troubleshooting Guide - Portfolio Impact Analyzer

## Common Issues and Solutions

### 🔧 Extension Loading Issues

#### Extension Won't Load in Chrome
**Symptoms**: Error messages when trying to load the extension

**Solutions**:
1. Ensure Developer Mode is enabled in `chrome://extensions/`
2. Check that you selected the correct folder (should contain `manifest.json`)
3. Verify all required files are present
4. Try reloading the extension page and loading again

#### Missing Icons Warning
**Symptoms**: Extension loads but shows default Chrome icon

**Solutions**:
1. Icons are optional for testing - extension will still function
2. Add proper PNG icon files if needed for production use
3. Check that `icons/` folder exists in extension directory

### ⚙️ Settings and Configuration

#### "Please configure your settings first"
**Symptoms**: Popup shows setup message instead of analysis

**Solutions**:
1. Click the gear (⚙️) icon to open settings
2. Enter your Yahoo Finance portfolio URL
3. Add your Gemini API key
4. Save settings and try again

#### API Key Test Fails
**Symptoms**: "Gemini API test failed" message in settings

**Solutions**:
1. **Check API Key Format**
   - Remove any extra spaces before/after the key
   - Ensure you copied the complete key
   - Try generating a new key in Google AI Studio

2. **Verify API Access**
   - Confirm your Google account has Gemini API access
   - Check if you have any API quotas or billing setup required
   - Try the API key in Google AI Studio directly

3. **Network Issues**
   - Check your internet connection
   - Disable VPN if using one
   - Try again after a few minutes

#### Portfolio URL Issues
**Symptoms**: "Invalid portfolio URL format" error, "Portfolio data extraction failed"

**Solutions**:
1. **URL Format Check**
   - Should look like: `https://finance.yahoo.com/portfolio/p_12/view/v1`
   - Must include the `/portfolio/p_XX` part
   - Copy the full URL from your browser's address bar

2. **Access Verification**
   - Ensure you're logged into Yahoo Finance **in the same browser/profile**
   - Visit your portfolio directly to confirm access
   - Try a different portfolio if you have multiple

3. **Extension Permissions**
   - After updating the extension, Chrome may require permission confirmation
   - Go to `chrome://extensions/` and check if the extension shows permission warnings
   - Click "Details" and ensure all permissions are granted

4. **Manual Holdings Backup**
   - Add your holdings manually in extension settings as a reliable backup
   - One symbol per line (e.g., PTOTE3OE0025.LS)
   - This ensures the extension works even if portfolio scraping fails

### 📊 Analysis Issues

#### "Unable to extract meaningful content"
**Symptoms**: Analysis fails on certain websites

**Solutions**:
1. **Page Content Issues**
   - Refresh the page and try again
   - Scroll down to ensure content is loaded
   - Try a different article on the same site

2. **Website Compatibility**
   - Some sites may block content extraction
   - Try well-known financial news sites (Bloomberg, Reuters, FT)
   - Avoid sites with heavy paywalls or protection

3. **Content Length**
   - Very short articles may not have enough content
   - Try longer, more detailed articles

#### "Unable to fetch portfolio data"
**Symptoms**: Portfolio data retrieval fails

**Solutions**:
1. **Authentication Issues**
   - Ensure you're logged into Yahoo Finance in the same browser
   - Try accessing your portfolio directly first
   - Log out and log back into Yahoo Finance

2. **URL Problems**
   - Double-check your portfolio URL in settings
   - Make sure the URL includes the portfolio ID (p_XX)
   - Try copying the URL again from Yahoo Finance

3. **API Limitations**
   - Yahoo Finance may have rate limiting
   - Wait a few minutes and try again
   - The extension uses fallback mock data if API fails

#### Analysis Takes Too Long
**Symptoms**: Stuck on "Analyzing impact on your portfolio..."

**Solutions**:
1. **Network Timeout**
   - Check your internet connection
   - Try again with a shorter article
   - Wait up to 60 seconds before retrying

2. **API Rate Limits**
   - Gemini API may have usage limits
   - Wait a few minutes before trying again
   - Check your API usage in Google AI Studio

3. **Content Complexity**
   - Very long articles may take longer to process
   - Try with a shorter news article first

### 🔍 Analysis Results Issues

#### No Analysis Results Show
**Symptoms**: Extension completes but shows no results

**Solutions**:
1. Check browser console for JavaScript errors (`F12` → Console tab)
2. Verify the page content was successfully extracted
3. Try with a different financial news article
4. Refresh the extension and try again

#### Poor Quality Analysis
**Symptoms**: Analysis seems irrelevant or generic

**Solutions**:
1. **Model Selection**
   - Try "Gemini 1.5 Pro" for more detailed analysis
   - Experiment with different models in settings

2. **Content Quality**
   - Use articles from reputable financial news sources
   - Ensure articles are recent and relevant to markets
   - Try articles that mention specific companies or sectors

3. **Portfolio Relevance**
   - Analysis quality depends on your portfolio holdings
   - Results may be more generic for very diversified portfolios

### 🛠️ Advanced Troubleshooting

#### Portfolio Extraction Debugging
**If portfolio data extraction keeps failing:**

1. **Check Extension Console**
   - Open `chrome://extensions/`
   - Find "Portfolio Impact Analyzer"
   - Click "Inspect views: service worker"
   - Look for console messages starting with "Starting portfolio data extraction..."

2. **Manual Test Process**
   - Open your Yahoo Finance portfolio page manually
   - Press F12 to open developer tools
   - In Console tab, paste this test code:
   ```javascript
   // Test if we can find portfolio data
   console.log('Tables found:', document.querySelectorAll('table').length);
   console.log('Quote links found:', document.querySelectorAll('a[href*="/quote/"]').length);
   console.log('Page text contains symbols:', /\b[A-Z]{2,6}\.[A-Z]{2,3}\b/.test(document.body.textContent));
   ```
   - This will help identify if the page structure is different

3. **Permission Verification**
   - Go to `chrome://extensions/`
   - Click "Details" on Portfolio Impact Analyzer
   - Scroll to "Permissions" section
   - Should show access to "finance.yahoo.com"

#### Extension Console Debugging
1. Open `chrome://extensions/`
2. Find "Portfolio Impact Analyzer"
3. Click "Inspect views: service worker" (for background.js)
4. Check for error messages in the console

#### Network Request Debugging
1. Open browser developer tools (`F12`)
2. Go to Network tab
3. Run the extension analysis
4. Look for failed requests to Gemini API or Yahoo Finance

#### Reset Extension Settings
1. Open `chrome://extensions/`
2. Remove the extension
3. Clear browser data (optional)
4. Reload the extension
5. Reconfigure settings

#### Check Permissions
1. Verify the extension has required permissions:
   - Access to current tab
   - Storage permission
   - Access to Yahoo Finance and Gemini APIs

### 📞 Getting Help

If issues persist:

1. **Check Extension Console**: Look for JavaScript errors
2. **Verify Prerequisites**: Ensure you have valid API key and portfolio access
3. **Test Step by Step**: Try each component (settings, page extraction, API calls) individually
4. **Update Chrome**: Ensure you're using a recent version of Chrome
5. **Try Different Content**: Test with various financial news websites

### 🔒 Privacy and Security Notes

- The extension only sends data to Google's Gemini API
- Your API key is stored locally in Chrome's secure storage
- No personal data is collected or stored by the extension
- Page content and portfolio data are only used for analysis

### 📈 Performance Tips

- Use "Gemini 1.5 Flash" for faster analysis
- Test on shorter articles first
- Ensure stable internet connection
- Avoid running multiple analyses simultaneously