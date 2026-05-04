export type ExportMode = 'D-1' | 'D-2';

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  note: string;
}

export const extractVideoId = (url: string): string => {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?\n]+)/);
  return match ? match[1] : url;
};

export const parsePlaylistD1 = (text: string): PlaylistItem[] => {
  const items: PlaylistItem[] = [];
  // Updated regex to handle both separate URL line and URL embedded in header [Title](URL)
  const blockRegex = /##\s+(?:\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|([^\n]+))\n+(?:(https?:\/\/[^\s]+)\n+)?###\s+Note\n([\s\S]*?)(?=\n##\s|\n---|$)/g;
  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    const title = (match[1] || match[3] || '').trim();
    const url = (match[2] || match[4] || '').trim();
    if (!title || !url) continue;

    items.push({
      id: extractVideoId(url),
      title,
      url,
      note: match[5].trim()
    });
  }
  return items;
};

export const parsePlaylistD2 = (text: string): PlaylistItem[] => {
  const items: PlaylistItem[] = [];
  // Updated regex to handle: 
  // 1. - **Title**\n  URL
  // 2. - [Title](URL)
  // 3. - [mx-thumb#Title](URL)
  const blockRegex = /-\s+(?:\*\*([^\*]+)\*\*\n\s+(https?:\/\/[^\s]+)|\[(?:mx-(?:thumb|video)#)?([^\]]+)\]\((https?:\/\/[^\s\)]+)\))([\s\S]*?)(?=\n-\s+|(?:\n|^)#|$)/g;
  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    const title = (match[1] || match[3] || '').trim();
    const url = (match[2] || match[4] || '').trim();
    if (!title || !url) continue;

    const noteRaw = match[5] || '';
    const noteLines = noteRaw.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('>'))
      .map(line => line.substring(1).trim());
    
    items.push({
      id: extractVideoId(url),
      title,
      url,
      note: noteLines.join('\n')
    });
  }
  return items;
};

export const parsePlaylistFromMarkdown = (text: string, mode: ExportMode): PlaylistItem[] => {
  if (mode === 'D-1') return parsePlaylistD1(text);
  if (mode === 'D-2') return parsePlaylistD2(text);
  return [];
};

export type ExportFormat = 'Text' | 'URL' | 'Card' | 'Video';
export type ExportListType = 'Numbered' | 'Bulleted' | 'Plain';

export const formatYoutubeLink = (item: PlaylistItem, format: ExportFormat): string => {
  const sanitizedTitle = item.title.replace(/\[/g, '(').replace(/\]/g, ')');
  if (format === 'URL') return `[${sanitizedTitle}](${item.url})`;
  if (format === 'Text') return item.url;
  if (format === 'Card') return `[mx-thumb#${sanitizedTitle}](${item.url})`;
  if (format === 'Video') return `[mx-video#${sanitizedTitle}](${item.url})`;
  return item.url;
};

export const serializePlaylistToMarkdown = (
  items: PlaylistItem[], 
  mode: ExportMode, 
  format: ExportFormat = 'URL',
  listType: ExportListType = 'Bulleted'
): string => {
  const getPrefix = (index: number) => 
    listType === 'Numbered' ? `${index + 1}. ` : (listType === 'Bulleted' ? '- ' : '');

  if (mode === 'D-1') {
    return items.map((item, index) => {
      const prefix = getPrefix(index);
      const sanitizedTitle = item.title.replace(/\[/g, '(').replace(/\]/g, ')');
      
      let headerText = item.title;
      let bodyText = '';

      if (format === 'URL') {
        bodyText = `[${sanitizedTitle}](${item.url})\n`;
      } else if (format === 'Text') {
        bodyText = `${item.url}\n`;
      } else {
        bodyText = `${formatYoutubeLink(item, format)}\n`;
      }

      return `## ${prefix}${headerText}
${bodyText}
### Note
${item.note || ''}
---`;
    }).join('\n\n');
  } else if (mode === 'D-2') {
    return items.map((item, index) => {
      const prefix = getPrefix(index);
      const noteContent = item.note ? '\n' + item.note.split('\n').map(l => `  > ${l}`).join('\n') : '';

      if (format === 'URL') {
        return `${prefix}[${item.title.replace(/\[/g, '(').replace(/\]/g, ')')}](${item.url})${noteContent}`;
      }

      if (format === 'Text') {
        return `${prefix}${item.url}${noteContent}`;
      }
      
      if (format === 'Card' || format === 'Video') {
        return `${prefix}${formatYoutubeLink(item, format)}${noteContent}`;
      }
      
      // Default (URL)
      return `${prefix}**${item.title}**\n  ${item.url}${noteContent}`;
    }).join('\n\n');
  }
  return '';
};

export const diffPlaylistItems = (existingItems: PlaylistItem[], apiItems: any[]): PlaylistItem[] => {
  const existingIds = new Set(existingItems.map(item => item.id));
  const newItems: PlaylistItem[] = [];
  
  apiItems.forEach(apiItem => {
    const id = extractVideoId(apiItem.url || apiItem.id);
    if (!existingIds.has(id)) {
      newItems.push({
        id,
        title: apiItem.title || '',
        url: apiItem.url || `https://www.youtube.com/watch?v=${id}`,
        note: ''
      });
    }
  });
  
  return newItems;
};
