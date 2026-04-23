import { preprocessMarkdown, postprocessMarkdown, processTemplateVariables } from '../MarkdownUtils';

describe('MarkdownUtils', () => {
  describe('preprocessMarkdown', () => {
    test('should restore escaped headings', () => {
      const input = '\\# Heading\nText';
      expect(preprocessMarkdown(input)).toBe('# Heading\nText');
    });

    test('should restore escaped lists', () => {
      const input = '\\- Item 1\n\\- Item 2';
      expect(preprocessMarkdown(input)).toBe('- Item 1\n- Item 2');
    });

    test('should restore escaped link brackets', () => {
      const input = 'Click \\[[Link](url)\\]';
      expect(preprocessMarkdown(input)).toBe('Click [[Link](url)]');
    });
  });

  describe('postprocessMarkdown', () => {
    test('should remove escapes from multiple markdown symbols', () => {
      const input = '\\# Heading\n\\*bold\\*\n\\- list';
      const output = postprocessMarkdown(input);
      expect(output).toBe('# Heading\n*bold*\n- list');
    });

    test('should restore YouTube iframe to its original URL', () => {
      const input = '<iframe src="https://www.youtube.com/embed/123" originalurl="https://youtube.com/watch?v=123"></iframe>';
      expect(postprocessMarkdown(input)).toBe('https://youtube.com/watch?v=123');
    });
  });

  describe('processTemplateVariables', () => {
    test('should correctly replace {{variable}} style text', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const variables = { name: 'Alice', place: 'Wonderland' };
      expect(processTemplateVariables(template, variables)).toBe('Hello Alice, welcome to Wonderland!');
    });

    test('should leave non-existent variables as is', () => {
      const template = 'Keep {{this}} and replace {{that}}';
      const variables = { that: 'replaced' };
      expect(processTemplateVariables(template, variables)).toBe('Keep {{this}} and replace replaced');
    });
  });
});
