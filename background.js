chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'addLink') {
        chrome.storage.sync.get({ links: [] }, function (data) {
            const savedLinks = data.links;
            savedLinks.push(request.link);
            chrome.storage.sync.set({ links: savedLinks }, function () {
                // Notify content script to update the list in real-time
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'updateList', list: savedLinks });
                });
            });
        });
    }
});
