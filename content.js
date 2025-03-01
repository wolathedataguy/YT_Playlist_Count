// Function to calculate total playlist duration
function calculatePlaylistDuration() {
  // Use multiple selectors to find time elements more reliably
  const timeElements = document.querySelectorAll('ytd-thumbnail-overlay-time-status-renderer span, .ytp-time-duration');
  
  let totalSeconds = 0;
  let videoCount = 0;
  
  // Process each time element
  timeElements.forEach(el => {
    // Get the text content which contains the time (e.g. "12:34")
    const timeText = el.textContent.trim();
    
    // Skip empty or invalid time formats
    if (!timeText || timeText.length < 3) return;
    
    // Split into components (hours, minutes, seconds)
    const timeParts = timeText.split(':').map(part => parseInt(part, 10));
    
    let seconds = 0;
    if (timeParts.length === 3) {
      // Format: H:MM:SS
      seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
    } else if (timeParts.length === 2) {
      // Format: MM:SS
      seconds = timeParts[0] * 60 + timeParts[1];
    }
    
    // Only add valid time values
    if (seconds > 0) {
      totalSeconds += seconds;
      videoCount++;
    }
  });
  
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Format the result
  let formattedDuration = '';
  if (hours > 0) {
    formattedDuration += hours + ' hour' + (hours !== 1 ? 's' : '') + ' ';
  }
  formattedDuration += minutes + ' minute' + (minutes !== 1 ? 's' : '') + ' ';
  formattedDuration += seconds + ' second' + (seconds !== 1 ? 's' : '');
  
  // Send message to popup
  chrome.runtime.sendMessage({
    action: 'updateDuration',
    duration: formattedDuration,
    totalMinutes: Math.round(totalSeconds / 60),
    videoCount: videoCount
  });
  
  console.log('Playlist duration calculated: ' + formattedDuration + ' (' + videoCount + ' videos)');
  
  // Create or update the UI indicator on the page
  displayDurationOnPage(formattedDuration, videoCount, totalSeconds);
}

// Function to display the duration on the YouTube playlist page
function displayDurationOnPage(duration, videoCount, totalSeconds) {
  // Check if our element already exists
  let durationElement = document.getElementById('yt-playlist-duration-extension');
  
  if (!durationElement) {
    // Create new element if it doesn't exist
    durationElement = document.createElement('div');
    durationElement.id = 'yt-playlist-duration-extension';
    
    // Apply modern and eye-catching styling
    durationElement.style.padding = '8px';
    durationElement.style.background = 'rgba(0, 0, 0, 0.8)';
    durationElement.style.color = 'white';
    durationElement.style.border = '1px solid #ccc';
    durationElement.style.borderRadius = '5px';
    durationElement.style.margin = '10px 0';
    durationElement.style.fontSize = '12px';
    durationElement.style.fontWeight = '500';
    durationElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    durationElement.style.display = 'flex';
    durationElement.style.flexDirection = 'column';
    durationElement.style.gap = '4px';
    durationElement.style.fontFamily = 'Roboto, Arial, sans-serif';
    durationElement.style.position = 'relative';
    durationElement.style.zIndex = '100';
    durationElement.style.maxWidth = '200px';
    durationElement.style.width = 'calc(100% - 20px)';
    durationElement.style.backdropFilter = 'blur(5px)';
    
    // Add animation keyframes
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.02);
        }
        100% {
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    // Try multiple potential insertion points for better compatibility
    const playAllButton = document.querySelector('ytd-playlist-header-renderer #play-button');
    const playlistHeader = document.querySelector('ytd-playlist-header-renderer');
    const videoListContainer = document.querySelector('#contents');
    
    // Try inserting at the most appropriate place available
    if (playAllButton) {
      playAllButton.insertAdjacentElement('afterend', durationElement);
    } else if (playlistHeader) {
      playlistHeader.insertAdjacentElement('beforeend', durationElement);
    } else if (videoListContainer) {
      videoListContainer.insertAdjacentElement('beforebegin', durationElement);
    } else {
      // Last resort
      const targetElement = document.querySelector('#primary') || document.querySelector('ytd-app') || document.body;
      targetElement.insertAdjacentElement('afterbegin', durationElement);
    }
  }
  
  // Format time in a cleaner way for display
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Calculate video rate information (helpful for users)
  const averageSeconds = videoCount > 0 ? totalSeconds / videoCount : 0;
  const averageMinutes = (averageSeconds / 60).toFixed(1);
  
  // Create distinct sections with an improved modern design
  const durationHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; background: rgba(255, 255, 255, 0.1); padding: 5px; border-radius: 4px;">
      <span style="font-size: 14px; font-weight: 700;">YouTube Playlist Duration</span>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="background: rgba(255, 255, 255, 0.2); padding: 2px 5px; border-radius: 10px; font-size: 10px; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 2px;">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${videoCount} videos
        </span>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 5px; background: rgba(255, 255, 255, 0.08); border-radius: 4px;">
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 14px; font-weight: 700; margin-bottom: 2px; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
          ${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s
        </span>
        <span style="opacity: 0.9; font-size: 10px; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 2px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Total: ${Math.round(totalSeconds / 60)} minutes
        </span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end;">
        <span style="font-size: 10px; background: rgba(255, 255, 255, 0.15); padding: 2px 4px; border-radius: 2px;">
          ~${averageMinutes} min/video
        </span>
      </div>
    </div>
  `;
  
  // Update the content
  durationElement.innerHTML = durationHTML;
  
  // Add a subtle animation effect when updated
  durationElement.style.animation = 'pulse 1s ease-in-out';
  setTimeout(() => {
    durationElement.style.animation = '';
  }, 1000);
}

// Function to observe for changes in the DOM to recalculate when videos load
function setupObserver() {
  // Create an observer to detect when more videos are loaded (for long playlists)
  const observer = new MutationObserver(function(mutations) {
    let shouldRecalculate = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        shouldRecalculate = true;
      }
    });
    
    if (shouldRecalculate) {
      calculatePlaylistDuration();
    }
  });
  
  // Try multiple target elements to observe - different YouTube layouts might have different structures
  const potentialTargets = [
    document.querySelector('#contents'),
    document.querySelector('ytd-playlist-video-list-renderer'),
    document.querySelector('ytd-watch-flexy'),
    document.querySelector('#primary')
  ];
  
  // Observe the first valid target we find
  for (const target of potentialTargets) {
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
      console.log('Observer set up on', target);
      break;
    }
  }
}

// Check if the page is a YouTube playlist page
function isPlaylistPage() {
  return window.location.href.includes('/playlist') || 
         (window.location.href.includes('/watch') && window.location.href.includes('list='));
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDuration') {
    console.log('Received getDuration request from popup');
    calculatePlaylistDuration();
  }
  return true;
});

// Initialize when DOM is fully loaded
window.addEventListener('load', () => {
  console.log('YouTube Playlist Duration extension loaded');
  
  // Check if we're on a playlist page
  if (isPlaylistPage()) {
    // Give some time for YouTube to populate the page
    setTimeout(() => {
      calculatePlaylistDuration();
      setupObserver();
    }, 1500);
    
    // If the first attempt fails, try again after a longer delay
    setTimeout(() => {
      calculatePlaylistDuration();
    }, 3000);
  }
});

// Also run when URL changes (for YouTube's SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to', url);
    
    if (isPlaylistPage()) {
      console.log('New page is a playlist page, recalculating duration');
      setTimeout(() => {
        calculatePlaylistDuration();
        setupObserver();
      }, 1500);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Initial calculation with multiple attempts for reliability
if (isPlaylistPage()) {
  setTimeout(calculatePlaylistDuration, 1500);
  setTimeout(calculatePlaylistDuration, 3000);
}