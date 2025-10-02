// Content script for extracting page data
(function() {
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      sendResponse(getPageContent());
    }
  });

  function getPageContent() {
    const title = document.title;
    const url = window.location.href;

    // Remove unwanted elements
    const clonedDoc = document.cloneNode(true);
    const unwanted = clonedDoc.querySelectorAll('script, style, nav, footer, aside, .advertisement, .ads');
    unwanted.forEach(el => el.remove());

    // Try to get main content
    let content = '';
    const selectors = [
      'main',
      'article',
      '.content',
      '.post',
      '.article',
      '[role="main"]',
      '.main-content'
    ];

    for (const selector of selectors) {
      const element = clonedDoc.querySelector(selector);
      if (element && element.innerText.length > 200) {
        content = element.innerText;
        break;
      }
    }

    // Fallback to body if no main content found
    if (!content) {
      content = clonedDoc.body.innerText;
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    return {
      title,
      url,
      content: content.substring(0, 4000) // Limit to 4000 characters
    };
  }
})();