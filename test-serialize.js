const { Editor } = require('@tiptap/core');
const { Node } = require('@tiptap/core');
const { Markdown } = require('tiptap-markdown');

const CustomYoutube = Node.create({
  name: 'customYoutube',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      originalUrl: { default: null }
    }
  },
  parseHTML() {
    return [{ tag: 'iframe[data-youtube]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', { ...HTMLAttributes, 'data-youtube': 'true' }]
  },
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write(node.attrs.originalUrl || node.attrs.src);
        }
      }
    }
  }
});

const editor = new Editor({
  extensions: [Markdown, CustomYoutube],
  content: '<p><iframe data-youtube="true" src="https://www.youtube.com/embed/12345678901" originalurl="https://www.youtube.com/watch?v=12345678901"></iframe></p>'
});
console.log(editor.storage.markdown.getMarkdown());
