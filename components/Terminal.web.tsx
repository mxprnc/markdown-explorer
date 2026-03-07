import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function Terminal({ isDark }: { isDark: boolean }) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: { background: isDark ? '#000000' : '#1e1e1e', foreground: '#A7F3D0' },
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      fontSize: 12,
      cursorBlink: true,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    
    // Slight delay to ensure DOM is ready for fit
    setTimeout(() => {
      fitAddon.fit();
      term.writeln('➜  markdown-explorer git:(main) ✗ \x1b[32m# Web Terminal Activated\x1b[0m');
      term.write('➜  markdown-explorer git:(main) ✗ ');
    }, 50);

    term.onData(e => {
        if (e === '\r') {
           term.write('\r\n➜  markdown-explorer git:(main) ✗ ');
        } else if (e === '\x7F') {
           term.write('\b \b');
        } else {
           term.write(e);
        }
    });

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [isDark]);

  return <div ref={terminalRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
}
