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
  return url && (url.includes('youtube.com/playlist') || 
                (url.includes('youtube.com/watch') && url.includes('list=')));
}

// Function to show error state
function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error-container').style.display = 'block';
  document.getElementById('error-container').textContent = message || 'Not currently viewing a YouTube playlist. Please navigate to a playlist and try again.';
}

// Set a timeout to handle cases where the content script doesn't respond
function setResponseTimeout(callback, delay = 5000) {
  return setTimeout(() => {
    callback();
  }, delay);
}

// When popup loads, query the active tab and request duration calculation
document.addEventListener('DOMContentLoaded', function() {
  // Set up refresh button
  document.getElementById('refresh-btn').addEventListener('click', function() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('duration-container').style.display = 'none';
    document.getElementById('error-container').style.display = 'none';
    
    // Query for active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      if (!activeTab) {
        showError('Could not access active tab');
        return;
      }
      
      const url = activeTab.url || '';
      
      // Check if we're on a YouTube playlist page
      if (checkIfPlaylistPage(url)) {
        // Set timeout in case content script doesn't respond
        window.responseTimeout = setResponseTimeout(() => {
          showError('The content script did not respond in time. Try refreshing the YouTube page.');
        });
        
        // Send message to content script to calculate duration
        chrome.tabs.sendMessage(activeTab.id, {action: 'getDuration'}, function(response) {
          // If we get a response here, it's just an acknowledgment that the message was received
          console.log('Initial response from content script:', response);
        });
      } else {
        showError('Not currently viewing a YouTube playlist');
      }
    });
  });
  
  // Automatically trigger refresh when popup opens
  setTimeout(function() {
    document.getElementById('refresh-btn').click();
  }, 100);
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Received message in popup:', message);
  if (message.action === 'updateDuration') {
    // Clear any existing timeout
    clearTimeout(window.responseTimeout);
    clearTimeout(window.refreshTimeout);
    
    // Update popup with duration info
    updatePopupWithDuration(message.duration, message.videoCount, message.totalMinutes);
    
    // Show a warning if no videos were found
    if (message.videoCount === 0) {
      const warningElement = document.createElement('div');
      warningElement.className = 'error-message';
      warningElement.style.color = '#e69138';
      warningElement.textContent = 'No video durations could be found. YouTube may have updated its page structure.';
      document.getElementById('duration-container').appendChild(warningElement);
    }
    
    // Send acknowledge response
    sendResponse({received: true});
    return true;
  }
});