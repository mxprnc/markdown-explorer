/**
 * Utilities for Markdown processing
 */

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extracts a Table of Contents from markdown content.
 * Matches headings even if they are nested in blockquotes or lists.
 */
export function extractTOC(content: string): TOCItem[] {
  if (!content) return [];
  
  const lines = content.split('\n');
  const toc: TOCItem[] = [];
  let inCodeBlock = false;

  // Regular expression to match headings.
  // Standard Markdown allows up to 3 spaces of indentation.
  // Group 1: The actual heading levels (###)
  // Group 2: The heading text
  const headingRegex = /^ {0,3}(#{1,6})\s+(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Ignore headings inside code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(headingRegex);
    if (match) {
      const level = match[1].length;
      const rawText = match[2];
      
      // Clean up markdown formatting from the text (links, bold, etc.)
      const cleanText = rawText
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // [Text](url) -> Text
        .replace(/[*_~`]/g, '')                   // Formatting characters
        .trim();

      if (cleanText) {
        toc.push({
          id: `toc-${i}`,
          level: level,
          text: cleanText
        });
      }
    }
  }
  
  return toc;
}

/**
 * Finds the best matching heading among multiple candidates based on proximity to a target index.
 */
export function findBestHeadingMatch<T extends { index: number }>(
  matches: T[],
  targetIndex: number
): T | null {
  if (matches.length === 0) return null;
  
  let minDistance = Infinity;
  let bestMatch = matches[0];
  
  for (const m of matches) {
    const dist = Math.abs(m.index - targetIndex);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = m;
    }
  }
  
  return bestMatch;
}
