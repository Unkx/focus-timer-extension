# Focus Timer - Chrome Extension

A minimalist focus timer Chrome extension that blocks distracting websites during work sessions and automatically unblocks them during breaks.

## Features

- 🎯 **Work/Break Timer** - Customizable work and break durations
- 🔒 **Website Blocking** - Automatically block distracting sites during work
- 🔓 **Auto Unblock** - Sites are unblocked during breaks
- 🎨 **Modern UI** - Clean, dark-themed interface with animations
- ⏱️ **Real-time Timer** - Visual progress ring with live countdown
- 💾 **Persistent Settings** - Your settings are saved between sessions

## Installation

### From Chrome Web Store (Coming Soon)

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **"Load unpacked"**
5. Select the folder containing the extension files
6. The extension should now appear in your toolbar

## Usage

1. Click the extension icon in your toolbar
2. Set your preferred work and break durations (in minutes)
3. Add websites you want to block during work (e.g., `youtube.com`, `twitter.com`)
4. Click **"Save settings"**
5. Press **"Start"** to begin your focus session
6. During work, blocked sites will redirect to a focus page
7. During breaks, all sites are unblocked

## Permissions

- `declarativeNetRequest` - Required for website blocking
- `storage` - To save your settings and timer state
- `alarms` - For accurate timer functionality
- `notifications` - To notify you when sessions change

## Technologies

- JavaScript (ES6+)
- Chrome Extensions API (Manifest V3)
- HTML5/CSS3 with animations
- Chrome Storage API

## Project Structure

focus-timer-extension/
├── manifest.json # Extension configuration
├── background.js # Service worker for timer and blocking
├── popup.html # Main popup interface
├── popup.js # Popup logic
├── blocked.html # Blocked page template
├── rules.json # DNR rules (dynamic)
├── icons/ # Extension icons
└── README.md # This file


## Development

### Local Testing

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the **refresh** icon on the extension card
4. Test your changes

### Building for Distribution

```bash
# Create a ZIP file for the Chrome Web Store
zip -r focus-timer-extension.zip . -x "*.git*" -x "*.DS_Store"

License
MIT License - see LICENSE file for details

Author
Created by [Your Name]

Version History
1.0.0 - Initial release with basic timer and blocking functionality

Roadmap
Statistics dashboard (focus time tracking)

Custom redirect page

Sound notifications

Multiple work/break cycles

Cloud sync for settings


### LICENSE (MIT)
```markdown
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.