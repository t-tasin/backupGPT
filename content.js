// content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getLink') {
      var link = window.location.href;
      sendResponse({ link: link });
    }
  });
  