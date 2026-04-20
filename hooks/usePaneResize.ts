import { useState, useRef, useCallback, useMemo } from 'react';
import { PanResponder, Platform } from 'react-native';
import { LAYOUT } from '@/constants/Layout';

export function usePaneResize() {
  const [leftPaneWidth, setLeftPaneWidth] = useState(LAYOUT.explorerWidth);
  const [tocPaneWidth, setTocPaneWidth] = useState(LAYOUT.tocWidth);
  const [middlePaneWidth, setMiddlePaneWidth] = useState(LAYOUT.middlePaneWidth);
  const [footerHeight, setFooterHeight] = useState(LAYOUT.footerHeight);
  const [isResizing, setIsResizing] = useState(false);

  const leftPaneWidthRef = useRef(LAYOUT.explorerWidth);
  const startLeftWidthRef = useRef(LAYOUT.explorerWidth);
  const leftPaneRafRef = useRef<number | null>(null);

  const tocPaneWidthRef = useRef(LAYOUT.tocWidth);
  const startTocWidthRef = useRef(LAYOUT.tocWidth);
  const tocPaneRafRef = useRef<number | null>(null);

  const middlePaneWidthRef = useRef(LAYOUT.middlePaneWidth);
  const startMiddleWidthRef = useRef(LAYOUT.middlePaneWidth);
  const middlePaneRafRef = useRef<number | null>(null);

  const footerHeightRef = useRef(LAYOUT.footerHeight);
  const startFooterHeightRef = useRef(LAYOUT.footerHeight);
  const footerRafRef = useRef<number | null>(null);

  const leftPaneResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startLeftWidthRef.current = leftPaneWidthRef.current;
      if (Platform.OS === 'web') {
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
      }
      setIsResizing(true);
    },
    onPanResponderMove: (e, gestureState) => {
      const newWidth = Math.max(LAYOUT.minPaneWidth, Math.min(LAYOUT.maxPaneWidth, startLeftWidthRef.current + gestureState.dx));
      if (newWidth !== leftPaneWidthRef.current) {
        leftPaneWidthRef.current = newWidth;
        if (Platform.OS === 'web') {
          if (leftPaneRafRef.current) cancelAnimationFrame(leftPaneRafRef.current);
          leftPaneRafRef.current = requestAnimationFrame(() => {
            const el = document.getElementById('explorer-pane');
            if (el) el.style.width = newWidth + 'px';
          });
        }
      }
    },
    onPanResponderRelease: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setLeftPaneWidth(leftPaneWidthRef.current);
      if (leftPaneRafRef.current) cancelAnimationFrame(leftPaneRafRef.current);
    },
    onPanResponderTerminate: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setLeftPaneWidth(leftPaneWidthRef.current);
      if (leftPaneRafRef.current) cancelAnimationFrame(leftPaneRafRef.current);
    },
  }), []);

  const tocPaneResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startTocWidthRef.current = tocPaneWidthRef.current;
      if (Platform.OS === 'web') {
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
      }
      setIsResizing(true);
    },
    onPanResponderMove: (e, gestureState) => {
      const newWidth = Math.max(LAYOUT.minPaneWidth, Math.min(LAYOUT.maxPaneWidth, startTocWidthRef.current - gestureState.dx));
      if (newWidth !== tocPaneWidthRef.current) {
        tocPaneWidthRef.current = newWidth;
        if (Platform.OS === 'web') {
          if (tocPaneRafRef.current) cancelAnimationFrame(tocPaneRafRef.current);
          tocPaneRafRef.current = requestAnimationFrame(() => {
            const el = document.getElementById('toc-pane');
            if (el) el.style.width = newWidth + 'px';
          });
        }
      }
    },
    onPanResponderRelease: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setTocPaneWidth(tocPaneWidthRef.current);
      if (tocPaneRafRef.current) cancelAnimationFrame(tocPaneRafRef.current);
    },
    onPanResponderTerminate: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setTocPaneWidth(tocPaneWidthRef.current);
      if (tocPaneRafRef.current) cancelAnimationFrame(tocPaneRafRef.current);
    },
  }), []);

  const middlePaneResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startMiddleWidthRef.current = middlePaneWidthRef.current;
      if (Platform.OS === 'web') {
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
      }
      setIsResizing(true);
    },
    onPanResponderMove: (e, gestureState) => {
      const newWidth = Math.max(LAYOUT.minPaneWidth, Math.min(LAYOUT.maxPaneWidth, startMiddleWidthRef.current + gestureState.dx));
      if (newWidth !== middlePaneWidthRef.current) {
        middlePaneWidthRef.current = newWidth;
        if (Platform.OS === 'web') {
          if (middlePaneRafRef.current) cancelAnimationFrame(middlePaneRafRef.current);
          middlePaneRafRef.current = requestAnimationFrame(() => {
            const el = document.getElementById('pane-1');
            if (el) el.style.width = newWidth + 'px';
          });
        }
      }
    },
    onPanResponderRelease: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setMiddlePaneWidth(middlePaneWidthRef.current);
      if (middlePaneRafRef.current) cancelAnimationFrame(middlePaneRafRef.current);
    },
    onPanResponderTerminate: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setMiddlePaneWidth(middlePaneWidthRef.current);
      if (middlePaneRafRef.current) cancelAnimationFrame(middlePaneRafRef.current);
    },
  }), []);

  const footerResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startFooterHeightRef.current = footerHeightRef.current;
      if (Platform.OS === 'web') {
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ns-resize';
      }
      setIsResizing(true);
    },
    onPanResponderMove: (e, gestureState) => {
      const newHeight = Math.max(LAYOUT.minFooterHeight, Math.min(LAYOUT.maxFooterHeight, startFooterHeightRef.current - gestureState.dy));
      if (newHeight !== footerHeightRef.current) {
        footerHeightRef.current = newHeight;
        if (Platform.OS === 'web') {
          if (footerRafRef.current) cancelAnimationFrame(footerRafRef.current);
          footerRafRef.current = requestAnimationFrame(() => {
            const el = document.getElementById('gemini-footer');
            if (el) el.style.height = newHeight + 'px';
          });
        }
      }
    },
    onPanResponderRelease: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setFooterHeight(footerHeightRef.current);
      if (footerRafRef.current) cancelAnimationFrame(footerRafRef.current);
    },
    onPanResponderTerminate: () => {
      if (Platform.OS === 'web') {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
      setIsResizing(false);
      setFooterHeight(footerHeightRef.current);
      if (footerRafRef.current) cancelAnimationFrame(footerRafRef.current);
    },
  }), []);

  return {
    leftPaneWidth,
    tocPaneWidth,
    middlePaneWidth,
    footerHeight,
    isResizing,
    leftPaneResponder,
    tocPaneResponder,
    middlePaneResponder,
    footerResponder,
  };
}
