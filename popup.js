document.addEventListener('DOMContentLoaded', async () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const retryBtn = document.getElementById('retryBtn');
  const setupBtn = document.getElementById('setupBtn');

  settingsBtn.addEventListener('click', openSettings);
  analyzeBtn.addEventListener('click', analyzeCurrentPage);
  retryBtn.addEventListener('click', analyzeCurrentPage);
  setupBtn.addEventListener('click', openSettings);

  // Check if settings are configured and show appropriate state
  await checkInitialState();
});

async function openSettings() {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
}

async function checkInitialState() {
  try {
    // Check if settings are configured
    const settings = await chrome.storage.sync.get(['portfolioUrl', 'geminiApiKey']);

    if (!settings.portfolioUrl || !settings.geminiApiKey) {
      showState('setup');
    } else {
      showState('idle');
    }
  } catch (error) {
    showState('idle');
  }
}

async function analyzeCurrentPage() {
  showState('loading');
  updateLoadingMessage('Preparing analysis...');

  try {
    // Check if settings are configured
    const settings = await chrome.storage.sync.get(['portfolioUrl', 'geminiApiKey', 'geminiModel', 'enableThinking', 'manualHoldings']);

    if (!settings.portfolioUrl || !settings.geminiApiKey) {
      showState('setup');
      return;
    }

    // Get current page content
    updateLoadingMessage('Extracting page content...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const pageContent = await getPageContent(tab.id);

    if (!pageContent || pageContent.content.length < 100) {
      showError('Unable to extract meaningful content from this page');
      return;
    }

    // Get portfolio data
    updateLoadingMessage('Fetching your portfolio holdings...');
    const portfolioData = await getPortfolioData(settings.portfolioUrl);

    if (!portfolioData || portfolioData.length === 0) {
      showError('Unable to fetch portfolio data. Please check your portfolio URL or add manual holdings in settings.');
      return;
    }

    // Show data source information
    const isManualData = settings.manualHoldings && settings.manualHoldings.trim();
    const dataSource = isManualData ? 'manual holdings' : 'portfolio scraping';
    updateLoadingMessage(`Found ${portfolioData.length} holdings from ${dataSource}...`);

    // Show thinking mode status if enabled
    if (settings.enableThinking) {
      document.getElementById('loadingMessage').textContent = 'Thinking deeply about portfolio impact...';
    }

    // Analyze with Gemini
    const analysis = await analyzeWithGemini(pageContent, portfolioData, settings.geminiApiKey, settings.geminiModel || 'gemini-1.5-flash', settings.enableThinking);

    displayResults(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    showError(error.message || 'An error occurred during analysis');
  }
}

async function getPageContent(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    function: () => {
      // Extract page content
      const title = document.title;
      const url = window.location.href;

      // Remove script and style elements
      const clonedDoc = document.cloneNode(true);
      const scripts = clonedDoc.querySelectorAll('script, style, nav, footer, aside');
      scripts.forEach(el => el.remove());

      // Get main content
      let content = '';
      const mainContent = clonedDoc.querySelector('main, article, .content, .post, .article');
      if (mainContent) {
        content = mainContent.innerText;
      } else {
        content = clonedDoc.body.innerText;
      }

      // Clean up content
      content = content.replace(/\s+/g, ' ').trim();

      return {
        title,
        url,
        content: content.substring(0, 3000) // Limit content length
      };
    }
  });

  return results[0].result;
}

async function getPortfolioData(portfolioUrl) {
  // Extract portfolio ID from URL
  const match = portfolioUrl.match(/portfolio\/(p_\d+)/);
  if (!match) {
    throw new Error('Invalid portfolio URL format');
  }

  const portfolioId = match[1];

  // Get portfolio data using Yahoo Finance API
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v6/finance/quote?symbols=${portfolioId}`);

    if (!response.ok) {
      // Fallback: try to get individual symbols if portfolio API doesn't work
      return await getPortfolioFromPage(portfolioUrl);
    }

    const data = await response.json();
    return data.quoteResponse.result;
  } catch (error) {
    // Fallback to scraping
    return await getPortfolioFromPage(portfolioUrl);
  }
}

async function getPortfolioFromPage(portfolioUrl) {
  try {
    // Create a new tab with the portfolio URL to scrape data
    const tab = await chrome.tabs.create({ url: portfolioUrl, active: false });

    // Wait for the page to load completely
    await new Promise(resolve => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });

    // Additional wait for Yahoo Finance to fully load and authenticate
    // This ensures the portfolio data is rendered in the DOM
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Execute script to extract portfolio data
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPortfolioData
    });

    // Close the tab
    chrome.tabs.remove(tab.id);

    const portfolioData = results[0].result;

    if (portfolioData && portfolioData.length > 0) {
      // Store successfully extracted data for future fallback use
      await chrome.storage.local.set({ lastKnownHoldings: portfolioData, lastUpdated: Date.now() });
      return portfolioData;
    } else {
      throw new Error('No portfolio data found');
    }

  } catch (error) {
    console.error('Portfolio scraping failed:', error);

    // Enhanced fallback hierarchy (NO MORE MOCK DATA):
    // 1. Try manual holdings from settings
    // 2. Try stored/cached holdings from previous successful scraping
    // 3. Throw error to prompt user to fix their setup

    const settings = await chrome.storage.sync.get(['manualHoldings']);
    if (settings.manualHoldings && settings.manualHoldings.trim()) {
      console.log('Using manual holdings from settings');
      const manualSymbols = settings.manualHoldings.split('\n')
        .map(symbol => symbol.trim())
        .filter(symbol => symbol.length > 0);

      if (manualSymbols.length > 0) {
        return manualSymbols.map(symbol => ({
          symbol: symbol,
          regularMarketPrice: 0, // Will be fetched from individual APIs if needed
          regularMarketChange: 0,
          regularMarketChangePercent: 0
        }));
      }
    }

    // Try stored holdings from previous successful scraping
    const storedHoldings = await chrome.storage.local.get(['lastKnownHoldings']);
    if (storedHoldings.lastKnownHoldings && storedHoldings.lastKnownHoldings.length > 0) {
      console.log('Using cached holdings from previous successful extraction');
      return storedHoldings.lastKnownHoldings;
    }

    // No more mock data - force user to fix their setup
    throw new Error(`Portfolio data extraction failed.

Possible solutions:
1. Add your holdings manually in extension settings
2. Make sure you're logged into Yahoo Finance in this browser
3. Check that your portfolio URL is correct: ${portfolioUrl}
4. Try reloading the extension

Error details: ${error.message}`);
  }
}

// Function to extract portfolio data from Yahoo Finance page
function extractPortfolioData() {
  console.log('Starting portfolio data extraction...');
  const portfolioData = [];

  // Method 1: Look for modern Yahoo Finance portfolio table (2024+ layout)
  const modernTable = document.querySelector('table[data-testid="portfolio-holdings-table"], table[data-test="holdings-table"]');

  if (modernTable) {
    console.log('Found modern portfolio table');
    const rows = modernTable.querySelectorAll('tbody tr');

    for (const row of rows) {
      try {
        // Modern Yahoo Finance uses these patterns
        const symbolElement = row.querySelector('a[data-testid="quote-symbol"], a[href*="/quote/"], td:first-child a');
        const priceElement = row.querySelector('[data-testid="quote-price"], [data-field="regularMarketPrice"]');
        const changeElement = row.querySelector('[data-testid="quote-change"], [data-field="regularMarketChange"]');
        const changePercentElement = row.querySelector('[data-testid="quote-change-percent"], [data-field="regularMarketChangePercent"]');

        if (symbolElement) {
          const symbol = symbolElement.textContent.trim();
          const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^\d.-]/g, '')) : 0;
          const change = changeElement ? parseFloat(changeElement.textContent.replace(/[^\d.-]/g, '')) : 0;
          const changePercent = changePercentElement ? parseFloat(changePercentElement.textContent.replace(/[%\s]/g, '')) : 0;

          if (symbol && symbol.length > 1 && !symbol.toLowerCase().includes('symbol')) {
            portfolioData.push({
              symbol: symbol,
              regularMarketPrice: price || 0,
              regularMarketChange: change || 0,
              regularMarketChangePercent: changePercent || 0
            });
            console.log(`Extracted: ${symbol} - ${price}`);
          }
        }
      } catch (e) {
        console.log('Error parsing row:', e);
      }
    }
  }

  // Method 2: Legacy portfolio table selectors
  if (portfolioData.length === 0) {
    console.log('Trying legacy portfolio table selectors...');
    const legacyTable = document.querySelector('table, .portfolio-table, .holdings-table');

    if (legacyTable) {
      const rows = legacyTable.querySelectorAll('tbody tr, tr');

      for (const row of rows) {
        try {
          const symbolCell = row.querySelector('a[href*="/quote/"], .symbol a, td:first-child a, td:first-child');
          const priceCell = row.querySelector('.price, td:nth-child(2), .Fw\\(600\\)');
          const changeCell = row.querySelector('.change, .Fw\\(500\\)');

          if (symbolCell && symbolCell.textContent.trim().length > 1) {
            const symbol = symbolCell.textContent.trim();
            const price = priceCell ? parseFloat(priceCell.textContent.replace(/[^\d.-]/g, '')) : 0;
            const change = changeCell ? parseFloat(changeCell.textContent.replace(/[^\d.-]/g, '')) : 0;

            if (!symbol.toLowerCase().includes('symbol') && !symbol.toLowerCase().includes('ticker')) {
              portfolioData.push({
                symbol: symbol,
                regularMarketPrice: price || 0,
                regularMarketChange: change || 0,
                regularMarketChangePercent: 0
              });
              console.log(`Legacy extracted: ${symbol} - ${price}`);
            }
          }
        } catch (e) {
          console.log('Error parsing legacy row:', e);
        }
      }
    }
  }

  // Method 3: Advanced DOM search for symbols
  if (portfolioData.length === 0) {
    console.log('Trying advanced DOM search...');

    // Look for any links that contain stock symbols
    const stockLinks = document.querySelectorAll('a[href*="/quote/"]');

    for (const link of stockLinks) {
      try {
        // Extract symbol from href or text
        const href = link.getAttribute('href');
        const symbolFromHref = href.match(/\/quote\/([^/?]+)/)?.[1];
        const symbolFromText = link.textContent.trim();

        const symbol = symbolFromHref || symbolFromText;

        if (symbol && symbol.length > 1 && symbol.length < 20) {
          // Look for price in nearby elements
          const container = link.closest('tr, div, li');
          let price = 0;

          if (container) {
            const priceElements = container.querySelectorAll('span, td, div');
            for (const elem of priceElements) {
              const text = elem.textContent.trim();
              // Look for price patterns (numbers with decimal points)
              if (/^\d+\.\d{2}$/.test(text) || /^\d+,\d{3}\.\d{2}$/.test(text)) {
                price = parseFloat(text.replace(/,/g, ''));
                break;
              }
            }
          }

          portfolioData.push({
            symbol: symbol,
            regularMarketPrice: price,
            regularMarketChange: 0,
            regularMarketChangePercent: 0
          });
          console.log(`Advanced search found: ${symbol} - ${price}`);
        }
      } catch (e) {
        console.log('Error in advanced search:', e);
      }
    }
  }

  // Method 4: Look for any text that looks like stock symbols
  if (portfolioData.length === 0) {
    console.log('Trying text pattern matching...');

    // Get all text content and look for stock symbol patterns
    const bodyText = document.body.textContent;
    const symbolPattern = /\b[A-Z]{2,6}(?:\.[A-Z]{2,3})?\b/g;
    const potentialSymbols = bodyText.match(symbolPattern) || [];

    // Filter to likely stock symbols (remove common words)
    const excludeWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BUT', 'SHE', 'HIM', 'HIS', 'NOW', 'WHO', 'DID', 'YES', 'GET', 'MAY', 'HIM', 'OLD', 'SEE', 'TWO', 'WAY', 'ITS', 'NEW', 'USE', 'TOP', 'END'];

    const likelySymbols = [...new Set(potentialSymbols)]
      .filter(symbol => !excludeWords.includes(symbol))
      .slice(0, 15); // Limit to avoid too many false positives

    for (const symbol of likelySymbols) {
      portfolioData.push({
        symbol: symbol,
        regularMarketPrice: 0,
        regularMarketChange: 0,
        regularMarketChangePercent: 0
      });
      console.log(`Pattern match found: ${symbol}`);
    }
  }

  console.log(`Portfolio extraction complete. Found ${portfolioData.length} holdings:`, portfolioData.map(h => h.symbol));
  return portfolioData;
}

async function analyzeWithGemini(pageContent, portfolioData, apiKey, model, enableThinking = false) {
  const portfolioSymbols = portfolioData.map(stock => stock.symbol).join(', ');

  const prompt = `
As a financial analyst with access to web search capabilities, analyze how the following news/content affects the given investment portfolio:

**Current Page Content:**
Title: ${pageContent.title}
URL: ${pageContent.url}
Content: ${pageContent.content}

**Portfolio Holdings:**
${portfolioData.map(stock => `${stock.symbol}: €${stock.regularMarketPrice} (${stock.regularMarketChangePercent > 0 ? '+' : ''}${stock.regularMarketChangePercent?.toFixed(2)}%)`).join('\n')}

**IMPORTANT INSTRUCTIONS:**
1. For EACH holding company, search the web to find:
   - Countries of operation and geographic exposure
   - Main business areas, sectors, and revenue sources
   - Recent financial performance and market position

2. Use this research to provide more accurate impact analysis based on:
   - Geographic exposure to the news location/region
   - Business sector relevance to the news content
   - Competitive positioning in affected markets

Please provide analysis in the following JSON format:
{
  "summary": "Brief summary of the news and overall portfolio impact",
  "affectedHoldings": [
    {
      "symbol": "STOCK_SYMBOL",
      "impact": "positive/negative/neutral",
      "riskLevel": "low/medium/high",
      "explanation": "Why this stock is affected",
      "potentialChange": "Estimated percentage impact range (e.g., +2% to +5%)"
    }
  ],
  "overallRisk": {
    "direction": "upside/downside/mixed",
    "level": "low/medium/high",
    "timeHorizon": "short-term/medium-term/long-term",
    "keyFactors": ["factor1", "factor2"]
  },
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on:
1. Direct industry connections
2. Geographic exposure (European markets)
3. Economic indicators mentioned
4. Regulatory changes
5. Market sentiment impact
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: enableThinking ? 0.2 : 0.1,
        maxOutputTokens: enableThinking ? 8192 : 4096
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 200)}...`);
  }

  const data = await response.json();
  
  // Check for content filtering or incomplete response
  if (!data.candidates || data.candidates.length === 0) {
    console.error('No candidates in response:', data);
    throw new Error('Gemini API returned no results. The content may have been filtered or the request was invalid.');
  }
  
  const candidate = data.candidates[0];
  
  // Check for finish reason indicating incomplete response
  if (candidate.finishReason === 'MAX_TOKENS' || candidate.finishReason === 'RECITATION') {
    console.warn('Response was truncated. Finish reason:', candidate.finishReason);
  }

  // Get the response text
  let text = candidate.content.parts[0].text;
  
  console.log('Raw Gemini response:', text);
  console.log('Finish reason:', candidate.finishReason);

  // In thinking mode, we'll get a longer, more detailed response
  // but we still parse the JSON the same way

  // Try multiple methods to extract JSON from response
  let jsonText = null;
  
  // Method 1: Extract JSON from markdown code blocks (```json ... ```)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const extracted = codeBlockMatch[1].trim();
    // Check if it starts with { or [ (valid JSON)
    if (extracted.startsWith('{') || extracted.startsWith('[')) {
      jsonText = extracted;
    }
  }
  
  // Method 2: Find complete JSON object by counting braces
  if (!jsonText) {
    const firstBrace = text.indexOf('{');
    if (firstBrace !== -1) {
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;
      
      for (let i = firstBrace; i < text.length; i++) {
        const char = text[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonText = text.substring(firstBrace, i + 1);
              break;
            }
          }
        }
      }
    }
  }
  
  // Method 3: Try simple regex as last resort
  if (!jsonText) {
    const cleanText = text.replace(/```(?:json)?/g, '').trim();
    const simpleMatch = cleanText.match(/\{[\s\S]*\}/);
    if (simpleMatch) {
      jsonText = simpleMatch[0];
    }
  }
  
  if (jsonText) {
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse:', jsonText);
      throw new Error('Invalid JSON format in AI response: ' + parseError.message);
    }
  }

  console.error('No JSON found in response:', text);
  
  // Check if response seems truncated
  if (text.includes('```json') && !text.includes('```\n') && !text.endsWith('```')) {
    throw new Error('AI response was truncated (incomplete JSON). Try enabling "Thinking Mode" in settings or use a shorter article.');
  }
  
  throw new Error('Invalid AI response format - no JSON found in response. Check console for details.');
}

function displayResults(analysis) {
  document.getElementById('analysisContent').innerHTML = `
    <p><strong>Summary:</strong> ${analysis.summary}</p>
  `;

  document.getElementById('portfolioContent').innerHTML = analysis.affectedHoldings.map(holding => `
    <div class="holding-item ${holding.impact}">
      <div class="holding-header">
        <span class="symbol">${holding.symbol}</span>
        <span class="impact-badge ${holding.impact}">${holding.impact.toUpperCase()}</span>
      </div>
      <p class="explanation">${holding.explanation}</p>
      <p class="potential-change"><strong>Potential Impact:</strong> ${holding.potentialChange}</p>
    </div>
  `).join('');

  document.getElementById('summaryContent').innerHTML = `
    <div class="risk-overview ${analysis.overallRisk.direction}">
      <div class="risk-header">
        <span class="risk-direction">${analysis.overallRisk.direction.toUpperCase()}</span>
        <span class="risk-level">${analysis.overallRisk.level.toUpperCase()} RISK</span>
      </div>
      <p><strong>Time Horizon:</strong> ${analysis.overallRisk.timeHorizon}</p>
      <p><strong>Key Factors:</strong> ${analysis.overallRisk.keyFactors.join(', ')}</p>
    </div>
    <div class="recommendations">
      <h4>Recommendations:</h4>
      <ul>
        ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  `;

  showState('results');
}

function showState(state) {
  const states = ['idle', 'loading', 'error', 'setup', 'results'];
  states.forEach(s => {
    document.getElementById(`${s}State`).style.display = s === state ? 'block' : 'none';
  });
}

function updateLoadingMessage(message) {
  const loadingElement = document.getElementById('loadingMessage');
  if (loadingElement) {
    loadingElement.textContent = message;
  }
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  showState('error');
}