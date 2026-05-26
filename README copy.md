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
