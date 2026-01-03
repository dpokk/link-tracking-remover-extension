
/**
 * Cleans a link.
 * @param {String} link - The URL for the link to clean.
 * @returns The cleaned URL.
 */
function cleanLink(link) {
    // Default settings for extension (could be made configurable later)
    const youtubeShortenEnabled = false;
    const fixTwitterEnabled = false;
    const walmartShortenEnabled = true;
    const amazonTrackingId = ""; // No affiliate ID by default

    try {
        var oldLink = new URL(link);
    } catch (e) {
        // TypeError rasied if not identified as URL, try stripping "Page Title" or any other non-link text
        if (e instanceof TypeError) {
            var extractedURL = link.match(/https?:\/\/\S+/);
            if (extractedURL) {
                var oldLink = new URL(extractedURL[0]);
            } else {
                console.log('Link Cleaner: No valid URL found in the string.');
                return link; // Return original if fail
            }
        }
    }

    // Fixes for various link shorteners
    if ((oldLink.host === 'l.facebook.com') && oldLink.searchParams.has('u')) {
        // Fix for Facebook shared links
        var facebookLink = decodeURI(oldLink.searchParams.get('u'));
        oldLink = new URL(facebookLink);
    } else if ((oldLink.host === 'href.li')) {
        // Fix for href.li links
        var hrefLink = oldLink.href.split('?')[1];
        oldLink = new URL(hrefLink);
    } else if ((oldLink.host === 'www.google.com') && (oldLink.pathname === '/url') && (oldLink.searchParams.has('url'))) {
        // Fix for redirect links from Google Search (#29)
        oldLink = new URL(oldLink.searchParams.get('url'));
    }
    // Generate new link
    var newLink = new URL(oldLink.origin + oldLink.pathname);
    // Don't remove 'q' parameter
    if (oldLink.searchParams.has('q')) {
        newLink.searchParams.append('q', oldLink.searchParams.get('q'));
    }
    // Don't remove ID parameter for Google Play links (#34)
    if ((oldLink.host === 'play.google.com') && oldLink.searchParams.has('id')) {
        newLink.searchParams.append('id', oldLink.searchParams.get('id'));
    }

    // YouTube links
    // This matches known domains like https://youtube.com, https://m.youtube.com, and https://www.youtube.com
    if (oldLink.host.endsWith('youtube.com') && oldLink.searchParams.has('v')) {
        // Shorten link if setting is enabled
        if (oldLink.searchParams.has('v') && youtubeShortenEnabled) {
            // Use to find the video ID: https://regex101.com/r/0Plpyd/1
            var regex = /^.*(youtu\.be\/|embed\/|shorts\/|\?v=|\&v=)(?<videoID>[^#\&\?]*).*/;
            var videoId = regex.exec(oldLink.href)['groups']['videoID'];
            newLink = new URL('https://youtu.be/' + videoId);
        } else if (oldLink.searchParams.has('v')) {
            // If the video link won't be in the main path, the 'v' (video ID) parameter needs to be added
            newLink.searchParams.append('v', oldLink.searchParams.get('v'));
        }
        // Never remove the 't' (time position) for YouTube video links
        if (oldLink.searchParams.has('t')) {
            newLink.searchParams.append('t', oldLink.searchParams.get('t'));
        }
    } else if (oldLink.host.endsWith('youtube.com') && oldLink.pathname.includes('playlist') && oldLink.searchParams.has('list')) {
        // Don't remove list ID for YouTube playlist links (#37)
        newLink.searchParams.append('list', oldLink.searchParams.get('list'));
    } else if ((oldLink.host === 'youtu.be') && oldLink.searchParams.has('t')) {
        // Don't remove video timestamp for shortened YouTube links (#49)
        newLink.searchParams.append('t', oldLink.searchParams.get('t'));
    }
    // Don't remove required variables for Facebook links
    if ((oldLink.host === 'www.facebook.com') && oldLink.pathname.includes('story.php')) {
        newLink.searchParams.append('story_fbid', oldLink.searchParams.get('story_fbid'));
        newLink.searchParams.append('id', oldLink.searchParams.get('id'));
    }
    // Remove extra information for Amazon shopping links
    // Amazon has a lot of country-specific domains that are subject to change, so this just matches "amazon" along with a known product URL path
    if (oldLink.host.includes('amazon') && (oldLink.pathname.includes('/dp/') || oldLink.pathname.includes('/d/') || oldLink.pathname.includes('/product/'))) {
        // Amazon doesn't need the www subdomain
        newLink.hostname = newLink.hostname.replace('www.', '');
        // Find product ID
        var regex = /(?:\/dp\/|\/product\/|\/d\/)(\w*|\d*)/g;
        var match = regex.exec(oldLink.pathname);
        if (match && match[1]) {
            newLink.pathname = '/dp/' + match[1];
        }
    }



    // Fix Apple Weather alert links (#46)
    if (oldLink.host === 'weatherkit.apple.com') {
        newLink.searchParams.append('lang', oldLink.searchParams.get('lang'));
        newLink.searchParams.append('party', oldLink.searchParams.get('party'));
        newLink.searchParams.append('ids', oldLink.searchParams.get('ids'));
    }


    // Shorten Twitter/X links with FixTwitter if enabled
    if (fixTwitterEnabled && ((oldLink.host === 'twitter.com') || (oldLink.host === 'x.com'))) {
        newLink.host = 'fxtwitter.com';
    }
    // Shorten Walmart links if enabled (#41)
    if (walmartShortenEnabled && (oldLink.host === 'www.walmart.com') && oldLink.pathname.includes('/ip/')) {
        var regex = /\/ip\/.*\/(\d+)/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/ip/' + productID[1];
        }
    }
    // Add Amazon affiliate code if enabled
    if (oldLink.host.includes('amazon') && amazonTrackingId) {
        newLink.searchParams.append('tag', amazonTrackingId);
    }

    // Flipkart: Keep pid and lid (#NewRequest)
    if (oldLink.host.includes('flipkart.com')) {
        if (oldLink.searchParams.has('pid')) {
            newLink.searchParams.append('pid', oldLink.searchParams.get('pid'));
        }
        if (oldLink.searchParams.has('lid')) {
            newLink.searchParams.append('lid', oldLink.searchParams.get('lid'));
        }
        if (oldLink.searchParams.has('marketplace')) {
            newLink.searchParams.append('marketplace', oldLink.searchParams.get('marketplace'));
        }
    }

    // Spotify: Keep 'context' (e.g. playlist) but remove 'si' and 'utm' (#NewRequest)
    if (oldLink.host.includes('spotify.com')) {
        if (oldLink.searchParams.has('context')) {
            newLink.searchParams.append('context', oldLink.searchParams.get('context'));
        }
    }

    // The following services are covered by the generic cleaning (stripping all query params):
    // - Amazon.in / Amazon (handled by existing amazon block + generic strip)
    // - Pinterest (invite_code, sender, etc. are stripped)
    // - LinkedIn (trk, lipi, etc. are stripped)
    // - Medium (source, sk, etc. are stripped)
    // - TikTok (_t, _r, etc. are stripped)
    // - Snapchat (share_id, sc_referrer are stripped)

    return newLink.toString();
}

// Ensure function is available globally for the content script
window.cleanLink = cleanLink;
