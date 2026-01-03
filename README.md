# Link Tracking Remover

A lightweight Chrome extension that automatically detects and removes tracking parameters from copied URLs.

## Overview
Websites often append analytics tags and unique identifiers (e.g., `utm_source`, `ref`, `fbclid`) to URLs. These parameters track user behavior, session history, and social sharing patterns.

**Link Tracking Remover** passively monitors the clipboard for URLs containing known tracking patterns. When a dirty link is detected, it prompts the user via a minimal UI to copy a sanitized version of the link.

## Demo

**Input (Tracking Link):**
```
https://www.instagram.com/p/C6xyz123abc/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==
```

**Output (Clean Link):**
```
https://www.instagram.com/p/C6xyz123abc/
```

## Universal Tracking Removal
The extension detects and eliminates tracking parameters universally across the web. It is designed to function with any platform—including social media, e-commerce, and digital publishers—ensuring that shared links contain only the essential resource identifier.

The cleaning engine combines specialized heuristics for major services with a robust generic processor to guarantee broad operational coverage.

## Privacy & Security

**Zero-Data Collection**
The extension operates entirely on your device ("client-side"). It does not collect, store, or transmit your browsing history or copied links to any external server or cloud service. Your data remains strictly under your control at all times.

**Transparent Permissions**
The extension requests only the permissions strictly necessary for its functionality:
*   **Clipboard Access**: Used exclusively to update your clipboard with the cleaned link when you approve the action.
*   **Site Access**: Used to passively detect when you copy a link on a webpage, enabling the extension to offer immediate protection.
