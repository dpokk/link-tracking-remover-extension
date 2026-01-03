// Main Content Script

document.addEventListener('copy', handleCopy);

function handleCopy() {
    // Get the selected text
    const selection = window.getSelection().toString().trim();
    if (!selection) return;

    // Check if it looks like a URL
    if (!isValidUrl(selection)) return;

    // Run the cleaner
    // cleanLink is defined in cleaner.js which is loaded before this script
    if (typeof cleanLink !== 'function') {
        console.error("Link Cleaner: cleanLink function not found.");
        return;
    }

    const cleanedUrl = cleanLink(selection);

    // If the cleaned URL is different, show the toast
    if (cleanedUrl !== selection) {
        showToast(cleanedUrl);
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showToast(cleanedUrl) {
    // Check if toast already exists, remove it if so
    const existingHost = document.getElementById('link-cleaner-extension-root');
    if (existingHost) {
        existingHost.remove();
    }

    // Create Shadow DOM host
    const host = document.createElement('div');
    host.id = 'link-cleaner-extension-root';
    host.style.position = 'fixed';
    host.style.top = '24px';
    host.style.right = '24px';
    host.style.zIndex = '2147483647'; // Max z-index
    // Reset basic properties to avoid inheritance issues on some sites
    host.style.fontSize = '16px';
    host.style.lineHeight = '1.5';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Styles
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: rgba(23, 23, 23, 0.95);
            color: #ffffff;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 
                0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                0 10px 15px -3px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 14px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 360px;
            box-sizing: border-box;
        }

        .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            flex-shrink: 0;
        }
        
        .content {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex-grow: 1;
        }

        .title {
            font-weight: 600;
            color: #fff;
            font-size: 14px;
        }

        .subtitle {
            color: #d1d5db;
            font-size: 13px;
        }

        button.action-btn {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        button.action-btn:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
        }

        button.action-btn:active {
            background-color: #1d4ed8;
            transform: translateY(0);
        }

        .close-btn {
            background: transparent;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            margin: -4px;
            margin-left: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
        }
        
        .close-btn:hover {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
        }

        @keyframes slideIn {
            from { transform: translateY(-20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
    `;

    // UI Content
    const container = document.createElement('div');
    container.className = 'toast-container';

    // Icon (Shield Check)
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'icon-wrapper';
    iconWrapper.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M9 12l2 2 4-4"></path>
        </svg>
    `;

    // Text Content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = 'Tracking link detected';

    const subtitle = document.createElement('span');
    subtitle.className = 'subtitle';
    subtitle.textContent = 'Clean tracking parameters?';

    contentDiv.appendChild(title);
    contentDiv.appendChild(subtitle);

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn';
    copyBtn.textContent = 'Copy Clean';

    // Close Button (X icon)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    closeBtn.onclick = removeToast;

    container.appendChild(iconWrapper);
    container.appendChild(contentDiv);
    container.appendChild(copyBtn);
    container.appendChild(closeBtn);

    shadow.appendChild(style);
    shadow.appendChild(container);

    // Auto-dismiss timeout
    let timeoutId = setTimeout(() => {
        removeToast();
    }, 5000);

    // Event handlers
    copyBtn.onclick = async () => {
        try {
            await navigator.clipboard.writeText(cleanedUrl);

            // UI Feedback
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#10b981'; // Emerald 500

            // Clear the auto-dismiss timeout and set a shorter one for removal
            clearTimeout(timeoutId);
            setTimeout(() => {
                removeToast();
            }, 1200);
        } catch (err) {
            console.error('Failed to copy: ', err);
            copyBtn.textContent = 'Error';
            copyBtn.style.backgroundColor = '#ef4444';
        }
    };

    function removeToast() {
        if (host.parentNode) {
            // Optional fade out
            container.style.animation = 'fadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            setTimeout(() => {
                if (host.parentNode) host.remove();
            }, 200);
        }
    }
}
