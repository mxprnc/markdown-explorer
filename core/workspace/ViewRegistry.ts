import React from 'react';

export interface ViewEntry {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
}

/**
 * 플러그인이 제공하는 UI 뷰(View)를 관리하는 레지스트리입니다.
 */
export class ViewRegistry {
  private views: Map<string, ViewEntry> = new Map();
  private sidebarViews: string[] = []; // 사이드바에 표시될 뷰 ID 목록

  /**
   * 새로운 뷰를 등록합니다.
   */
  registerView(entry: ViewEntry) {
    this.views.set(entry.id, entry);
    console.log(`[ViewRegistry] View registered: ${entry.name} (${entry.id})`);
  }

  /**
   * 특정 슬롯(예: 사이드바)에 뷰를 배치합니다.
   */
  addToSidebar(viewId: string) {
    if (this.views.has(viewId) && !this.sidebarViews.includes(viewId)) {
      this.sidebarViews.push(viewId);
    }
  }

  /**
   * 사이드바에서 뷰를 제거합니다.
   */
  removeFromSidebar(viewId: string) {
    this.sidebarViews = this.sidebarViews.filter(id => id !== viewId);
  }

  /**
   * 등록된 모든 뷰 엔트리를 가져옵니다.
   */
  getSidebarViews(): ViewEntry[] {
    return this.sidebarViews
      .map(id => this.views.get(id))
      .filter((v): v is ViewEntry => !!v);
  }

  /**
   * 뷰 ID로 엔트리를 찾습니다.
   */
  getView(id: string): ViewEntry | undefined {
    return this.views.get(id);
  }
}
