import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import LinkCardComponent from './LinkCardComponent';

export const LinkCardExtension = Node.create({
  name: 'linkCard',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      alt: { default: '' },
      type: { default: 'plain' }, // 'plain', 'link', 'thumb', 'video'
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-mx-link-card]',
        getAttrs: dom => {
          const element = dom as HTMLElement;
          return {
            url: element.getAttribute('data-url'),
            alt: element.getAttribute('data-alt'),
            type: element.getAttribute('data-type'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-mx-link-card': 'true',
        'data-url': HTMLAttributes.url,
        'data-alt': HTMLAttributes.alt,
        'data-type': HTMLAttributes.type,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardComponent);
  },
});
