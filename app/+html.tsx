import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The entire file runs only in Node.js and can't use any standard React hooks or effects.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work as expected. 
        */}
        <ScrollViewStyleReset />

        {/* Add KaTeX CSS from CDN to avoid Metro bundling issues with local font assets in CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
          integrity="sha384-shhWZGRYvspvY3D+yVfO7p0d68RCN7G/W8WfI+86f78Y7A5w/G9iV0YV8pI1G1G1"
          crossOrigin="anonymous"
        />

        {/* Add custom head elements, extra scripts, and style sheets here */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background-color: transparent;
          }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
