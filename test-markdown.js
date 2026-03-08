const { Editor } = require('@tiptap/core');
const { Node } = require('@tiptap/core');
const { Markdown } = require('tiptap-markdown');

const CustomNode = Node.create({
  name: 'customNode',
  group: 'inline',
  inline: true,
  addAttributes() { return { src: { default: null } } },
});

const editor = new Editor({
  extensions: [Markdown, CustomNode],
  content: '<p>Hello</p>'
});
console.log(editor.storage.markdown.getMarkdown());
