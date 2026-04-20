type Callback = (...args: any[]) => void;

/**
 * 앱 전역 이벤트를 중계하는 이벤트 버스입니다.
 */
export class EventBus {
  private events: Map<string, Callback[]> = new Map();

  /**
   * 이벤트 리스너를 등록합니다.
   */
  on(event: string, callback: Callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  /**
   * 이벤트 리스너를 제거합니다.
   */
  off(event: string, callback: Callback) {
    const listeners = this.events.get(event);
    if (!listeners) return;
    this.events.set(event, listeners.filter(l => l !== callback));
  }

  /**
   * 이벤트를 발생시킵니다.
   */
  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (!listeners) return;
    listeners.forEach(callback => callback(...args));
  }
}
