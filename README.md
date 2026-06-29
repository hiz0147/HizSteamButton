# ![HizSearch icon](https://hizsearch.pages.dev/favicon-32x32.png) HizSearch Steam Button
![License](https://img.shields.io/badge/License-MIT-blue)

Search any Steam game on HizSearch with one click. Works on both Steam Store and SteamDB.

## Installation methods

### Steam Client Browser
Since Steam runs on Chromium, you can install Chrome extensions directly inside it.

1) [Download the latest extension zip](https://github.com/hiz0147/HizSteamButton/releases/latest/download/hizsteambutton.zip) and extract it.
2) While browsing Steam, middle-click any game to open a new tab.
3) In the address bar, enter `chrome://extensions` and press Enter.
4) Turn on **Developer mode** (top-right toggle).
5) Drag and drop the extracted folder onto the extensions page.
6) Click **Details** → **Extension options** to configure position, icon and more.
7) The button will appear on Steam Store and SteamDB app pages.

> [!WARNING] 
> If you plan to download content directly using this option, we recommend installing uBlock Origin Lite (since it is the only one supported in this mode).
> 
> To install it, in the same section where you dragged the folder, tap the Chrome Web Store, search for uBlock Origin Lite, and install it just as you would in a regular browser.

> [!NOTE]
> If you have issues with Cloudflare when opening HizSearch, try closing Steam completely and opening it again.

---

### Manual web browser extension
1) [Download the latest extension zip](https://github.com/hiz0147/HizSteamButton/releases/latest/download/hizsteambutton.zip) and extract it.
2) Open `chrome://extensions` (Chrome/Edge/Brave) or `about:debugging#/runtime/this-firefox` (Firefox).
3) Turn on **Developer mode** (top-right toggle in Chrome, top-left in Firefox).
4) Click **Load unpacked** and select the extracted folder.
5) The button will appear on Steam Store and SteamDB app pages.
6) Click the extension icon in your toolbar to configure position, icon and behavior.

---

### Firefox Extension (add-on store)
[HizSearch Add-on](https://addons.mozilla.org/en-US/firefox/addon/hizsearch-steam-button/)

---

### User script
1) Install [Violentmonkey](https://violentmonkey.github.io/), [ScriptCat](https://scriptcat.org/) or [Tampermonkey](https://www.tampermonkey.net/).
2) Click [this link](https://raw.githubusercontent.com/hiz0147/HizSteamButton/main/userscript/hizsearch-steam-button.user.js) — the extension will ask you to install it. Enable auto-update if prompted.
3) To change the button position, icon or new tab behavior, edit the `CONFIG` object at the top of the script. (floating-right | floating-left | native)

## Preview

![Preview](https://i.ibb.co/dsfS3s46/image.png)
<br>
![Preview](https://i.ibb.co/yByTKQDW/b.png)

## Contributing

Suggestions and contributions are welcome. Feel free to open an [issue](https://github.com/hiz0147/HizSteamButton/issues) or submit a [pull request](https://github.com/hiz0147/HizSteamButton/pulls).
