/**
 * Utilities for Link Card metadata extraction and URL processing
 */

// Global cache to persist metadata
const metadataCache = new Map<string, LinkMetadata>();

export const clearMetadataCache = () => metadataCache.clear();

/**
 * Extracts YouTube ID from various YouTube URL formats
 * @param url The URL to check
 * @returns The YouTube ID if found, otherwise null
 */
export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  // More robust regex for various YouTube URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(shorts\/))([^#\&\?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[8].length === 11) ? match[8] : null;
  return id;
};

export interface LinkMetadata {
  title: string;
  siteName: string;
  image?: string;
}

/**
 * Derives metadata for a link based on its URL and type
 * @param url The URL of the link
 * @param type The type of link card (thumb, video, link, plain)
 * @param alt The alternative text (title) provided by the user
 * @returns Metadata object containing title, siteName, and optional image
 */
export const deriveMetadata = (
  url: string,
  type: string,
  alt: string
): LinkMetadata => {
  if (!url) return { title: '', siteName: '' };

  const cacheKey = `${url}-${type}-${alt}`;
  if (metadataCache.has(cacheKey)) {
    return metadataCache.get(cacheKey)!;
  }

  const youtubeId = getYoutubeId(url);
  const metadata: LinkMetadata = {
    title: alt || '',
    siteName: ''
  };

  if (type === 'thumb' || type === 'video') {
    if (youtubeId) {
      metadata.image = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      metadata.siteName = 'YouTube';
    } else {
      // Basic domain extraction
      try {
        const domain = url.split('//')[1]?.split('/')[0] || '';
        metadata.siteName = domain;
      } catch (e) {
        metadata.siteName = '';
      }
    }
  }

  metadataCache.set(cacheKey, metadata);
  return metadata;
};

/**
 * Regular expression to match mx- link card syntax in Markdown
 * Format: [mx-type#alt](url)
 */
export const MX_LINK_CARD_REGEX = /\[mx-(thumb|link|video|plain)#?([^\]]*)\]\(([^)]+)\)/g;
