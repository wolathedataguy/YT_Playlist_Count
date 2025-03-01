# YouTube Playlist Duration Extension

This Chrome extension calculates and displays the total duration of a YouTube playlist. It provides a modern and eye-catching UI element that shows the total duration, the number of videos, and the average duration per video.

## Features

- Calculates the total duration of a YouTube playlist.
- Displays the total duration, number of videos, and average duration per video.
- Updates dynamically as more videos are loaded in long playlists.
- Blends seamlessly with the YouTube interface.

## Installation

1. Clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" using the toggle in the top right corner.
4. Click on the "Load unpacked" button and select the folder where you cloned this repository.

## Usage

1. Navigate to any YouTube playlist page.
2. Click the extension icon in your browser toolbar to initialize the duration calculation.
3. A widget will appear on the page showing the playlist duration and statistics.
4. The widget can be dragged to a different position or closed if desired.
5. If you refresh the page, you'll need to click the extension icon again to show the duration widget.

## Files

- `content.js`: Contains the main logic for calculating and displaying the playlist duration.
- `manifest.json`: The manifest file that defines the extension's properties and permissions.
- `popup.html`: The HTML file for the extension's popup interface.
- `popup.js`: The JavaScript file for handling extension popup functionality.
- `icon-info.txt`: Information about the extension's icon.

## Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
