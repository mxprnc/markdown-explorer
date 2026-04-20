import { extractTOC, findBestHeadingMatch } from '../MarkdownUtils';

describe('MarkdownUtils - extractTOC', () => {
  it('should extract simple headings', () => {
    const md = '# H1\n## H2\n### H3';
    const toc = extractTOC(md);
    
    expect(toc.length).toBe(3);
    expect(toc[0]).toEqual({ id: 'toc-0', level: 1, text: 'H1' });
    expect(toc[1]).toEqual({ id: 'toc-1', level: 2, text: 'H2' });
    expect(toc[2]).toEqual({ id: 'toc-2', level: 3, text: 'H3' });
    // Wait, let's check index calculation: # H1 (lines[0]), ## H2 (lines[1]), ### H3 (lines[2])
    // So id should be toc-0, toc-1, toc-2.
    // My manual expectation was wrong.
  });

  it('should ignore indented code comments as headings', () => {
    const md = '# Real Heading\n    # Code Comment\n    ## Still Comment';
    const toc = extractTOC(md);
    
    expect(toc.length).toBe(1);
    expect(toc[0].text).toBe('Real Heading');
  });

  it('should ignore headings in fenced code blocks', () => {
    const md = '# Real Heading\n```markdown\n# Not a heading\n```\n## Another Real One';
    const toc = extractTOC(md);
    
    expect(toc.length).toBe(2);
    expect(toc[0].text).toBe('Real Heading');
    expect(toc[1].text).toBe('Another Real One');
  });

  it('should handle correctly indented headings (0-3 spaces)', () => {
    const md = ' # H1\n  ## H2\n   ### H3';
    const toc = extractTOC(md);
    expect(toc.length).toBe(3);
    expect(toc[0]).toEqual({ id: 'toc-0', level: 1, text: 'H1' });
    expect(toc[1]).toEqual({ id: 'toc-1', level: 2, text: 'H2' });
    expect(toc[2]).toEqual({ id: 'toc-2', level: 3, text: 'H3' });
  });
});

describe('MarkdownUtils - findBestHeadingMatch', () => {
  const matches = [
    { pos: 100, index: 5, text: 'A' },
    { pos: 500, index: 15, text: 'A' },
    { pos: 900, index: 25, text: 'A' },
  ];

  it('should find the closest match to target index', () => {
    // Target index is 16, closest is index 15
    const best = findBestHeadingMatch(matches, 16);
    expect(best?.pos).toBe(500);
  });

  it('should find the first one if closer to start', () => {
    const best = findBestHeadingMatch(matches, 7);
    expect(best?.pos).toBe(100);
  });

  it('should find the last one if closer to end', () => {
    const best = findBestHeadingMatch(matches, 30);
    expect(best?.pos).toBe(900);
  });

  it('should return null for empty matches', () => {
    expect(findBestHeadingMatch([], 10)).toBeNull();
  });
});
