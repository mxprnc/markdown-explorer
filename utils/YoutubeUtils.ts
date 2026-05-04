/**
 * YouTube Data API v3 utility for fetching playlist items.
 */

export interface YoutubePlaylistItem {
  title: string;
  url: string;
  videoId: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
}

export interface PlaylistMetadata {
  title: string;
  channelTitle: string;
  itemCount: number;
}

// In a real app, this should be in an environment variable
const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';

export async function fetchPlaylistMetadata(playlistId: string, apiKey?: string): Promise<PlaylistMetadata | null> {
  const key = apiKey || API_KEY;
  if (!key) {
    console.error('YouTube API Key is missing');
    return null;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        itemCount: item.contentDetails.itemCount,
      };
    }
  } catch (error) {
    console.error('Error fetching playlist metadata:', error);
  }
  return null;
}

export interface PlaylistResponse {
  items: YoutubePlaylistItem[];
  nextPageToken?: string;
}

export async function fetchPlaylistItems(
  playlistId: string,
  maxResults: number = 20,
  includeStats: boolean = false,
  apiKey?: string,
  pageToken?: string
): Promise<PlaylistResponse> {
  const key = apiKey || API_KEY;
  if (!key) {
    console.error('YouTube API Key is missing');
    return { items: [] };
  }

  try {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${Math.min(50, maxResults)}&key=${key}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      console.error('YouTube API error:', error);
      return { items: [] };
    }
    
    const data = await response.json();
    if (!data.items) return { items: [] };

    const items: YoutubePlaylistItem[] = data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
      videoId: item.contentDetails.videoId,
      channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
      publishedAt: item.snippet.publishedAt,
    }));

    if (includeStats && items.length > 0) {
      const videoIds = items.map(item => item.videoId).join(',');
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${key}`;
      const statsResponse = await fetch(statsUrl);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.items) {
          statsData.items.forEach((statItem: any) => {
            const itemIndex = items.findIndex(item => item.videoId === statItem.id);
            if (itemIndex !== -1) {
              items[itemIndex].viewCount = statItem.statistics.viewCount;
              items[itemIndex].likeCount = statItem.statistics.likeCount;
            }
          });
        }
      }
    }

    return { 
      items, 
      nextPageToken: data.nextPageToken 
    };
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    return { items: [] };
  }
}

export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^#&?]+)/);
  return match ? match[1] : null;
}
