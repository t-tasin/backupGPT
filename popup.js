document.addEventListener('DOMContentLoaded', function () {
  const saveButton = document.querySelector('.save-button');
  const savedChatsList = document.querySelector('.saved-chats');
  const warning = document.querySelector('.warning');
  const savedChatsHeading = document.querySelector('.saved-chats-heading');

  // Fetch and display stored bookmarks
  chrome.storage.sync.get({ bookmarks: [] }, function (data) {
    const savedBookmarks = data.bookmarks;

    savedBookmarks.forEach(function (bookmark) {
      const listItem = createListItem(bookmark.url, bookmark.title, bookmark.local);
      savedChatsList.appendChild(listItem);
    });

    // Show/hide the "Saved Chats" heading based on the list
    toggleSavedChatsHeading();
  });

  // Save current chat
  saveButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];

      // Check if the link is from chat.openai.com
      if (isChatGPTLink(currentTab.url)) {
        // Check if the link is already in the storage
        chrome.storage.sync.get({ bookmarks: [] }, function (data) {
          const savedBookmarks = data.bookmarks;

          if (!savedBookmarks.find(bookmark => bookmark.url === currentTab.url)) {
            // Link is not in the list, add it
            const listItem = createListItem(currentTab.url, currentTab.title, true);
            savedChatsList.appendChild(listItem);

            // Save the bookmark to storage
            savedBookmarks.push({ url: currentTab.url, title: currentTab.title, local: true });
            chrome.storage.sync.set({ bookmarks: savedBookmarks });

            // Show/hide the "Saved Chats" heading based on the list
            toggleSavedChatsHeading();
          } else {
            // Show a temporary warning for duplicate link
            showWarning('You have already saved this chat!');
          }
        });
      } else {
        // Show a temporary warning for non-ChatGPT link
        showWarning('Please open a valid chat and try again!');
      }
    });
  });

  // Function to create a list item with remove button
  function createListItem(url, title) {
    const listItem = document.createElement('li');
    listItem.classList.add('chat-item');

    // Create a link element for the page title
    const titleLink = document.createElement('a');
    titleLink.textContent = title;
    titleLink.href = url;
    titleLink.target = '_blank'; // Open in a new tab


    // Create a button (cross) to remove the link
    const crossButton = document.createElement('button');
    crossButton.classList.add('close-button');
    crossButton.innerHTML = '&#10006;'; // HTML entity for the "times" symbol
    crossButton.addEventListener('click', function () {
      removeBookmark(url);
      listItem.remove();

      // Show/hide the "Saved Chats" heading based on the list
      toggleSavedChatsHeading();
    });

    listItem.appendChild(titleLink);
    listItem.appendChild(crossButton);

    return listItem;
  }

  // Function to remove a bookmark from storage
  function removeBookmark(url) {
    chrome.storage.sync.get({ bookmarks: [] }, function (data) {
      const savedBookmarks = data.bookmarks;

      const updatedBookmarks = savedBookmarks.filter(bookmark => bookmark.url !== url);
      chrome.storage.sync.set({ bookmarks: updatedBookmarks });
    });
  }

  // Function to check if a link is from chat.openai.com
  function isChatGPTLink(link) {
    const chatGPTDomain = 'https://chat.openai.com/';
    return link.startsWith(chatGPTDomain);
  }

  // Function to show a temporary warning
  function showWarning(message) {
    warning.textContent = message;
    warning.classList.add('show');

    // Hide the warning after a few seconds
    setTimeout(function () {
      warning.classList.remove('show');
    }, 3000);
  }

  // Function to show/hide the "Saved Chats" heading based on the list
  function toggleSavedChatsHeading() {
    savedChatsHeading.textContent = savedChatsList.children.length > 0 ? 'Saved Chats' : 'No Saved Chats';
  }
});
