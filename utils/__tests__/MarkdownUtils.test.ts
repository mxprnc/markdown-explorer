import { preprocessMarkdown, postprocessMarkdown, processTemplateVariables } from '../MarkdownUtils';

describe('MarkdownUtils', () => {
  describe('preprocessMarkdown', () => {
    test('이스케이프된 헤딩을 복구해야 한다', () => {
      const input = '\\# Heading\nText';
      expect(preprocessMarkdown(input)).toBe('# Heading\nText');
    });

    test('이스케이프된 리스트를 복구해야 한다', () => {
      const input = '\\- Item 1\n\\- Item 2';
      expect(preprocessMarkdown(input)).toBe('- Item 1\n- Item 2');
    });

    test('이스케이프된 링크 괄호를 복구해야 한다', () => {
      const input = 'Click \\[[Link](url)\\]';
      expect(preprocessMarkdown(input)).toBe('Click [[Link](url)]');
    });
  });

  describe('postprocessMarkdown', () => {
    test('여러 마크다운 기호의 이스케이프를 제거해야 한다', () => {
      const input = '\\# Heading\n\\*bold\\*\n\\- list';
      const output = postprocessMarkdown(input);
      expect(output).toBe('# Heading\n*bold*\n- list');
    });

    test('YouTube iframe을 원래의 URL로 복구해야 한다', () => {
      const input = '<iframe src="https://www.youtube.com/embed/123" originalurl="https://youtube.com/watch?v=123"></iframe>';
      expect(postprocessMarkdown(input)).toBe('https://youtube.com/watch?v=123');
    });
  });

  describe('processTemplateVariables', () => {
    test('{{변수}} 형태의 텍스트를 정확히 치환해야 한다', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const variables = { name: 'Alice', place: 'Wonderland' };
      expect(processTemplateVariables(template, variables)).toBe('Hello Alice, welcome to Wonderland!');
    });

    test('존재하지 않는 변수는 그대로 두어야 한다', () => {
      const template = 'Keep {{this}} and replace {{that}}';
      const variables = { that: 'replaced' };
      expect(processTemplateVariables(template, variables)).toBe('Keep {{this}} and replace replaced');
    });
  });
});
