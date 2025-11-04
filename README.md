# Tweet Replies Saver

Chrome extension to scrape and export replies of a tweet from X (Twitter) as JSON or PDF, with a built-in viewer.

- **Scrapes replies** directly from the tweet page DOM (no API token needed)
- **Infinite scrolling**: optional “No limit” mode to scroll until you stop
- **Export formats**: JSON file, printable PDF
- **Built-in viewer**: open saved JSON to browse, search, and sort replies
- **Privacy**: runs entirely in your browser; no server required

## Installation

### From source (unpacked extension)

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `chrome-extension/` folder.
5. The “Tweet Replies Saver” extension will appear in your toolbar.

## Usage

### 1. Scrape replies
- Open a tweet page on `twitter.com` or `x.com` (`.../status/<id>`).
- Click the extension icon.
- Set a limit (e.g., 500) or enable **No limit** to scroll indefinitely.
- Click **Start**. The page will auto‑scroll and collect replies.
- Click **Stop** when done or let it finish the limit.

### 2. Export
- **Save JSON**: downloads a `replies_<tweetId>.json` file.
- **Save PDF**: opens a printable page; use the browser’s “Save as PDF”.

### 3. Viewer
- Click **Open Viewer** in the popup.
- Choose a saved JSON file.
- Browse, search, and sort replies:
  - Search: filter by content or `@user`.
  - Sort: by date, likes, or retweets (ascending/descending).
  - The original tweet is pinned at the top; replies follow.

## Features

| Feature | Description |
|---------|-------------|
| **Infinite scroll** | “No limit” checkbox scrolls until you stop. |
| **JSON export** | Structured data with fields: id, date, user, display_name, content, reply_to, likeCount, retweetCount, quoteCount. |
| **PDF export** | Clean printable layout with tweet metadata. |
| **Viewer** | Load saved JSON to read, search, and sort. |
| **Dark mode support** | Viewer and print pages adapt to system theme. |
| **No API keys** | Scrapes the public DOM; works without Twitter API access. |

## File structure

```
chrome-extension/
│ manifest.json          # MV3 extension manifest
│ popup.html/js          # Extension popup UI and logic
│ content.js             # Content script that scrapes the tweet page
│ print.html/js          # Printable page for PDF export
│ viewer.html/js         # Standalone viewer for saved JSON
│ tw-lite.css            # Minimal Tailwind‑like utilities
```

## Notes & Limitations

- Only replies that appear in the page DOM are collected. Protected/private tweets may not be scraped.
- If the tweet page changes its HTML structure, selectors in `content.js` may need updates.
- The viewer works with JSON files produced by this extension; other formats may not be compatible.
- Very large JSON files may slow the viewer; pagination can be added if needed.

## Development

To modify or rebuild the extension:

1. Edit files under `chrome-extension/`.
2. In `chrome://extensions`, click **Reload** for the extension.
3. Test on a tweet page.

## License

MIT

---

**Made with ❤️ for quick tweet archiving.**
