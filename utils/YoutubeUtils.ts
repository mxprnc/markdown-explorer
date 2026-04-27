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

export async function fetchPlaylistItems(
  playlistId: string,
  maxResults: number = 20,
  includeStats: boolean = false,
  apiKey?: string
): Promise<YoutubePlaylistItem[]> {
  const key = apiKey || API_KEY;
  if (!key) {
    console.error('YouTube API Key is missing');
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return [];

    const items: YoutubePlaylistItem[] = data.items.map((item: any) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
      videoId: item.contentDetails.videoId,
      channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
      publishedAt: item.snippet.publishedAt,
    }));

    if (includeStats) {
      const videoIds = items.map(item => item.videoId).join(',');
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${key}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (statsData.items) {
        statsData.items.forEach((statItem: any) => {
          const index = items.findIndex(i => i.videoId === statItem.id);
          if (index !== -1) {
            items[index].viewCount = statItem.statistics.viewCount;
            items[index].likeCount = statItem.statistics.likeCount;
          }
        });
      }
    }

    return items;
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    return [];
  }
}

export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^#&?]+)/);
  return match ? match[1] : null;
}
