import { renderHook, act } from '@testing-library/react-native';
import { usePaneResize } from '../usePaneResize';
import { LAYOUT } from '@/constants/Layout';
import { PanResponder, Platform } from 'react-native';

// Mock PanResponder
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  reactNative.PanResponder.create = jest.fn((config) => ({
    panHandlers: {},
    _config: config,
  }));
  return reactNative;
});

describe('usePaneResize', () => {
  it('should initialize with default values from LAYOUT', () => {
    const { result } = renderHook(() => usePaneResize());

    expect(result.current.leftPaneWidth).toBe(LAYOUT.explorerWidth);
    expect(result.current.tocPaneWidth).toBe(LAYOUT.tocWidth);
    expect(result.current.middlePaneWidth).toBe(LAYOUT.middlePaneWidth);
    expect(result.current.footerHeight).toBe(LAYOUT.footerHeight);
    expect(result.current.isResizing).toBe(false);
  });

  it('should update leftPaneWidth when dragging', () => {
    const { result } = renderHook(() => usePaneResize());
    const responder = result.current.leftPaneResponder as any;

    // Simulate drag start
    act(() => {
      responder._config.onPanResponderGrant();
    });
    expect(result.current.isResizing).toBe(true);

    // Simulate drag move
    act(() => {
      responder._config.onPanResponderMove({}, { dx: 50 });
    });

    // On Web, it updates state during move
    if (Platform.OS === 'web') {
      // requestAnimationFrame is used, so we might need to wait or mock it
      // For now, let's check if the width is within limits
    }

    // Simulate release
    act(() => {
      responder._config.onPanResponderRelease();
    });

    expect(result.current.isResizing).toBe(false);
    expect(result.current.leftPaneWidth).toBe(LAYOUT.explorerWidth + 50);
  });

  it('should respect min and max limits for leftPaneWidth', () => {
    const { result } = renderHook(() => usePaneResize());
    const responder = result.current.leftPaneResponder as any;

    // Drag beyond max
    act(() => {
      responder._config.onPanResponderGrant();
      responder._config.onPanResponderMove({}, { dx: 1000 });
      responder._config.onPanResponderRelease();
    });
    expect(result.current.leftPaneWidth).toBe(LAYOUT.maxPaneWidth);

    // Drag below min
    act(() => {
      responder._config.onPanResponderGrant();
      responder._config.onPanResponderMove({}, { dx: -1000 });
      responder._config.onPanResponderRelease();
    });
    expect(result.current.leftPaneWidth).toBe(LAYOUT.minPaneWidth);
  });

  it('should update tocPaneWidth (right to left)', () => {
    const { result } = renderHook(() => usePaneResize());
    const responder = result.current.tocPaneResponder as any;

    act(() => {
      responder._config.onPanResponderGrant();
      responder._config.onPanResponderMove({}, { dx: 50 }); // Drag right
      responder._config.onPanResponderRelease();
    });

    // Dragging right on the right sidebar decreases its width
    expect(result.current.tocPaneWidth).toBe(LAYOUT.tocWidth - 50);
  });

  it('should update footerHeight (bottom up)', () => {
    const { result } = renderHook(() => usePaneResize());
    const responder = result.current.footerResponder as any;

    act(() => {
      responder._config.onPanResponderGrant();
      responder._config.onPanResponderMove({}, { dy: -50 }); // Drag up
      responder._config.onPanResponderRelease();
    });

    // Dragging up increases height
    expect(result.current.footerHeight).toBe(LAYOUT.footerHeight + 50);
  });
});
