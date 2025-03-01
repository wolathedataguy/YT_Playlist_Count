// Function to update the popup with duration info
function updatePopupWithDuration(duration, videoCount, totalMinutes) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('duration-container').style.display = 'block';
  document.getElementById('duration').textContent = duration;
  document.getElementById('video-count').textContent = videoCount + ' videos';
  document.getElementById('total-minutes').textContent = totalMinutes + ' total minutes';
  
  // Add a note about inline display
  const infoNote = document.getElementById('info-note');
  if (!infoNote) {
    const noteElement = document.createElement('div');
    noteElement.id = 'info-note';
    noteElement.className = 'message';
    noteElement.textContent = 'Duration is also displayed directly on the YouTube page';
    noteElement.style.color = '#2ea44f';
    noteElement.style.marginTop = '12px';
    document.getElementById('duration-container').appendChild(noteElement);
  }
}

// Function to check if we're on a YouTube playlist page
function checkIfPlaylistPage(url) {
  return url && url.includes('youtube.com/playlist');
}

// When popup loads, query the active tab
document.addEventListener('DOMContentLoaded', function() {
  // Get the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    
    if (activeTab && checkIfPlaylistPage(activeTab.url)) {
      // We're on a playlist page - send message to content script to get duration
      chrome.tabs.sendMessage(activeTab.id, {action: 'getDuration'});
    } else {
      // Not on a playlist page - show error message
      document.getElementById('loading').style.display = 'none';
      document.getElementById('not-playlist').style.display = 'block';
    }
  });
  
  // Set up refresh button
  document.getElementById('refresh-btn').addEventListener('click', function() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('duration-container').style.display = 'none';
    
    // Query active tab again for refresh
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      if (activeTab && checkIfPlaylistPage(activeTab.url)) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'getDuration'});
      } else {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('not-playlist').style.display = 'block';
      }
    });
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'updateDuration') {
    updatePopupWithDuration(message.duration, message.videoCount, message.totalMinutes);
  }
});