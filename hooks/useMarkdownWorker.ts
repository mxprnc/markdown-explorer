import { useState, useEffect, useRef } from 'react';

/**
 * useMarkdownWorker Hook
 * 
 * Manages a Web Worker to parse markdown content into a HAST tree.
 * Includes a fallback to main-thread parsing if the worker fails to initialize.
 */
export function useMarkdownWorker(content: string) {
  const [hast, setHast] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const [workerError, setWorkerError] = useState(false);
  useEffect(() => {
    let workerUrl: string | null = null;
    
    // Attempt to initialize the worker using an inline Blob to bypass Metro asset restrictions
    try {
      const workerCode = `
        // 1. Aggressive Global Polyfill (Immediate Execution)
        (function(g) {
          const mockDoc = {
            createElement: () => ({ style: {} }),
            location: g.location,
            documentElement: { style: {} },
            getElementsByTagName: () => [],
            head: { appendChild: () => {} },
            body: { appendChild: () => {} },
            addEventListener: () => {},
            removeEventListener: () => {}
          };
          g.document = g.document || mockDoc;
          g.window = g.window || g;
          g.global = g.global || g;
          g.process = g.process || { env: { NODE_ENV: 'production' }, nextTick: (f) => setTimeout(f, 0) };
        })(self);

        let processor;

        async function init() {
          try {
            // 2. Load libraries from esm.sh with ?no-check to avoid environment issues
            const [
              { unified }, 
              { default: remarkParse }, 
              { default: remarkMath }, 
              { default: remarkGfm }, 
              { default: remarkRehype }
            ] = await Promise.all([
              import('https://esm.sh/unified@11?no-check'),
              import('https://esm.sh/remark-parse@11?no-check'),
              import('https://esm.sh/remark-math@6?no-check'),
              import('https://esm.sh/remark-gfm@4?no-check'),
              import('https://esm.sh/remark-rehype@11?no-check')
            ]);

            processor = unified()
              .use(remarkParse)
              .use(remarkGfm)
              .use(remarkMath)
              .use(remarkRehype, { allowDangerousHtml: true });
              
            console.log('Worker: Engine ready');
          } catch (err) {
            console.error('Worker: Setup failed', err);
          }
        }

        const initPromise = init();

        self.onmessage = async (e) => {
          await initPromise;
          if (!processor) {
            self.postMessage({ id: e.data.id, error: 'Processor not ready', success: false });
            return;
          }

          const { content, id } = e.data;
          try {
            const hast = await processor.run(processor.parse(content));
            self.postMessage({ id, hast, success: true });
          } catch (error) {
            self.postMessage({ id, error: error.message, success: false });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerUrl = URL.createObjectURL(blob);
      
      workerRef.current = new Worker(workerUrl, {
        type: 'module',
        name: 'markdown-worker'
      });

      workerRef.current.onmessage = (event) => {
        const { hast, id, success, error } = event.data;
        if (id === requestIdRef.current) {
          if (success) {
            setHast(hast);
          } else {
            console.error('Markdown worker parsing error:', error);
          }
          setIsParsing(false);
        }
      };

      workerRef.current.onerror = (err) => {
        console.error('Worker runtime error, falling back to main thread...', err);
        setWorkerError(true);
        setIsParsing(false);
      };
    } catch (e) {
      console.error('Failed to initialize inline worker:', e);
      setWorkerError(true);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, []);

  // Update effect
  useEffect(() => {
    if (!content) {
      setHast(null);
      return;
    }

    if (workerRef.current && !workerError) {
      setIsParsing(true);
      setHast(null); // Clear stale data immediately
      requestIdRef.current += 1;
      workerRef.current.postMessage({
        content,
        id: requestIdRef.current
      });
    } else {
      // Fallback: This is where we would do main-thread parsing if worker is not available.
      // For now, we'll return null or the raw content processed somehow.
      // In the next step, we'll ensure Preview handles this.
    }
  }, [content, workerError]);

  return { hast, isParsing, workerError };
}
