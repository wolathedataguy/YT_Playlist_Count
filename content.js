// Function to calculate total playlist duration
function calculatePlaylistDuration() {
  // Use expanded selectors to find time elements more reliably across different YouTube layouts
  const timeElements = document.querySelectorAll(
    // Playlist page time indicators
    'ytd-thumbnail-overlay-time-status-renderer span, ' +
    // Watch page time indicators
    '.ytp-time-duration, ' +
    // Additional selectors for newer YouTube layouts
    'span.ytd-thumbnail-overlay-time-status-renderer, ' +
    'span.style-scope.ytd-thumbnail-overlay-time-status-renderer, ' + 
    // General time display elements
    '.ytd-video-duration-renderer, ' +
    '.ytp-time-display .ytp-time-duration, ' +
    'span[aria-label*="minutes"], ' +
    'span[aria-label*="hour"]'
  );
  
  console.log('Found ' + timeElements.length + ' time elements on the page');
  
  let totalSeconds = 0;
  let videoCount = 0;
  
  // Process each time element
  timeElements.forEach(el => {
    // Get the text content which contains the time (e.g. "12:34")
    const timeText = el.textContent.trim();
    
    // Skip empty or invalid time formats
    if (!timeText || timeText.length < 3) return;
    
    // Debug logging
    console.log('Processing time element:', timeText);
    
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
  
  console.log('Total seconds calculated: ' + totalSeconds + ' from ' + videoCount + ' videos');
  
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
  
  // Always send message to popup, even if no videos were found
  const messageData = {
    action: 'updateDuration',
    duration: videoCount > 0 ? formattedDuration : 'No video durations found',
    totalMinutes: Math.round(totalSeconds / 60),
    videoCount: videoCount
  };
  
  chrome.runtime.sendMessage(messageData, response => {
    console.log('Message sent to popup, response:', response || 'no response');
  });
  
  console.log('Playlist duration calculated: ' + formattedDuration + ' (' + videoCount + ' videos)');
  
  // Create or update the UI indicator on the page
  if (videoCount > 0) {
    displayDurationOnPage(formattedDuration, videoCount, totalSeconds);
  }
}

// Function to display the duration on the YouTube playlist page
function displayDurationOnPage(duration, videoCount, totalSeconds) {
  // Check if our element already exists
  let durationElement = document.getElementById('yt-playlist-duration-extension');
  
  if (!durationElement) {
    // Create new element if it doesn't exist
    durationElement = document.createElement('div');
    durationElement.id = 'yt-playlist-duration-extension';
    
    // Apply modern styling with sticky positioning and less intrusive design
    durationElement.style.padding = '10px';
    durationElement.style.background = 'rgba(33, 33, 33, 0.85)';
    durationElement.style.color = 'white';
    durationElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    durationElement.style.borderRadius = '8px';
    durationElement.style.fontSize = '12px';
    durationElement.style.fontWeight = '500';
    durationElement.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    durationElement.style.display = 'flex';
    durationElement.style.flexDirection = 'column';
    durationElement.style.gap = '8px';
    durationElement.style.fontFamily = 'Roboto, Arial, sans-serif';
    durationElement.style.zIndex = '9999'; // Higher z-index to ensure it's on top
    durationElement.style.position = 'fixed'; // Fixed position for stickiness
    durationElement.style.bottom = '20px'; // Position at bottom
    durationElement.style.right = '20px'; // Position at right
    durationElement.style.maxWidth = '220px';
    durationElement.style.width = 'auto';
    durationElement.style.backdropFilter = 'blur(5px)';
    durationElement.style.animation = 'slideIn 0.3s ease-out forwards';
    durationElement.style.transition = 'opacity 0.3s ease';
    durationElement.style.opacity = '0.85';
    
    // Add hover effect for better user experience
    durationElement.addEventListener('mouseenter', () => {
      durationElement.style.opacity = '1';
    });
    durationElement.addEventListener('mouseleave', () => {
      durationElement.style.opacity = '0.85';
    });
    
    // Add close button to allow users to dismiss if desired
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '3px';
    closeBtn.style.right = '6px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.lineHeight = '16px';
    closeBtn.style.opacity = '0.7';
    closeBtn.style.padding = '2px';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      durationElement.remove();
      // Store preference to not show for this session
      sessionStorage.setItem('yt-playlist-duration-hidden', 'true');
    });
    durationElement.appendChild(closeBtn);
    
    // Add animation keyframes
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 0.85;
          transform: translateY(0);
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
    
    // Append to body to avoid disrupting YouTube's layout
    document.body.appendChild(durationElement);
    
    // Add drag functionality
    makeDraggable(durationElement);
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
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; background: rgba(255, 255, 255, 0.1); padding: 8px; border-radius: 6px; position: relative;">
      <span style="font-size: 14px; font-weight: 700; display: flex; align-items: center; padding-right: 15px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Playlist Duration
      </span>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="background: rgba(255, 0, 0, 0.2); padding: 3px 6px; border-radius: 20px; font-size: 11px; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 3px;">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"></path>
            <path d="M7 10L12 15L17 10"></path>
            <path d="M12 15V3"></path>
          </svg>
          ${videoCount} videos
        </span>
      </div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: rgba(255, 255, 255, 0.08); border-radius: 6px;">
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: 16px; font-weight: 700; margin-bottom: 4px; text-shadow: 0 1px 3px rgba(0,0,0,0.2); color: #FFF;">
          ${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s
        </span>
        <span style="opacity: 0.9; font-size: 11px; display: flex; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 3px;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Total: ${Math.round(totalSeconds / 60)} minutes
        </span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end;">
        <span style="font-size: 11px; background: rgba(255, 255, 255, 0.15); padding: 3px 6px; border-radius: 4px; margin-top: 2px;">
          ~${averageMinutes} min/video
        </span>
      </div>
    </div>
  `;
  
  // Update the content (preserve the close button)
  const closeBtn = durationElement.querySelector('div[style*="position: absolute"]');
  durationElement.innerHTML = durationHTML;
  if (closeBtn) {
    durationElement.appendChild(closeBtn);
  }
  
  // Add a subtle animation effect when updated
  durationElement.style.animation = 'pulse 0.8s ease-in-out';
  setTimeout(() => {
    durationElement.style.animation = '';
  }, 800);
}

// Function to make an element draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  // Add a handle for dragging
  const handle = document.createElement('div');
  handle.style.cursor = 'move';
  handle.style.userSelect = 'none';
  handle.style.position = 'absolute';
  handle.style.top = '0';
  handle.style.left = '0';
  handle.style.right = '0';
  handle.style.height = '15px';
  handle.style.borderTopLeftRadius = '8px';
  handle.style.borderTopRightRadius = '8px';
  
  // Mouse events for dragging
  handle.onmousedown = dragMouseDown;
  
  // Touch events for mobile
  handle.ontouchstart = dragTouchStart;
  
  element.appendChild(handle);
  
  function dragMouseDown(e) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function dragTouchStart(e) {
    // Get the touch position
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementTouchDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.bottom = "auto";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = "auto";
  }
  
  function elementTouchDrag(e) {
    // Calculate the new touch position
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.bottom = "auto";
    element.style.left = (element.offsetLeft - pos1) + "px";
    element.style.right = "auto";
  }
  
  function closeDragElement() {
    // Stop movement when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// Helper function to insert the duration element at the appropriate location
function insertDurationElement(element) {
  // Different selectors to try based on YouTube's layout
  const selectors = [
    // Primary locations
    { selector: 'ytd-playlist-header-renderer #top-level-buttons-computed', method: 'afterend' },
    { selector: 'ytd-playlist-header-renderer ytd-menu-renderer', method: 'beforebegin' },
    { selector: 'ytd-playlist-header-renderer #stats', method: 'afterend' },
    { selector: 'ytd-playlist-sidebar-renderer', method: 'beforebegin' },
    
    // Watch page with playlist
    { selector: 'ytd-playlist-panel-renderer #title', method: 'afterend' },
    { selector: 'ytd-playlist-panel-renderer #playlist-action-menu', method: 'afterend' },
    
    // General locations as fallbacks
    { selector: '#top-row', method: 'beforeend' },
    { selector: '#above-the-fold', method: 'beforeend' },
    { selector: '#meta', method: 'afterbegin' },
    { selector: '#primary-inner', method: 'afterbegin' },
    { selector: '#primary', method: 'afterbegin' },
    
    // Last resort
    { selector: 'body', method: 'afterbegin' }
  ];

  // Try each selector until we find one that works
  for (const {selector, method} of selectors) {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      console.log('Inserting duration element using:', selector, method);
      targetElement.insertAdjacentElement(method, element);
      return;
    }
  }
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

// Restore the message listener for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDuration') {
    console.log('Received getDuration request from popup');
    calculatePlaylistDuration();
  }
  return true;
});

// Ensure the script calculates and displays the duration immediately on page load
window.addEventListener('load', () => {
  console.log('YouTube Playlist Duration extension loaded');
  if (isPlaylistPage() && sessionStorage.getItem('yt-playlist-duration-hidden') !== 'true') {
    console.log('Found playlist page, setting up duration calculation');
    // Calculate immediately and then again after delay to ensure all elements are loaded
    calculatePlaylistDuration();
    
    setTimeout(() => {
      calculatePlaylistDuration();
      setupObserver();
    }, 1000);
    
    // Do another calculation after a bit longer to catch any late-loading elements
    setTimeout(calculatePlaylistDuration, 3000);
  }
});

// Monitor for URL changes (single-page app navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed to', url);
    if (isPlaylistPage() && sessionStorage.getItem('yt-playlist-duration-hidden') !== 'true') {
      console.log('New page is a playlist page, recalculating duration');
      // Remove any existing widget so we can place it again in the new page context
      const existingElement = document.getElementById('yt-playlist-duration-extension');
      if (existingElement) existingElement.remove();
      
      // Calculate duration with delay to allow page to load
      setTimeout(() => {
        calculatePlaylistDuration();
        setupObserver();
      }, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Initial check and calculation on script load
if (isPlaylistPage() && sessionStorage.getItem('yt-playlist-duration-hidden') !== 'true') {
  console.log('Initial playlist detection - calculating duration immediately');
  // Set a small delay to ensure the DOM is ready
  setTimeout(calculatePlaylistDuration, 500);
}