export class DepthGuard {
  static MAX_DEPTH = 5;

  /**
   * Checks if the current depth is within the allowed limit
   * @param depth 0-based depth from the export root
   */
  static isAllowed(depth: number): boolean {
    return depth < this.MAX_DEPTH;
  }

  /**
   * Returns a warning message if the depth limit is reached
   */
  static getWarningMessage(): string {
    return `주의: ${this.MAX_DEPTH}단계를 초과하는 하위 폴더가 발견되었습니다. 사이드바 UX를 위해 해당 폴더는 내보내기에서 제외됩니다.`;
  }

  static calculateMaxDepth(node: ExportNode, currentDepth: number = 0): number {
    // Early exit if we already exceeded MAX_DEPTH
    if (currentDepth >= this.MAX_DEPTH) {
      return currentDepth;
    }

    if (!node.children || node.children.length === 0) {
      return currentDepth;
    }

    let maxChildDepth = currentDepth;
    for (const child of node.children) {
      if (child.kind === 'directory') {
        const depth = this.calculateMaxDepth(child, currentDepth + 1);
        if (depth > maxChildDepth) {
          maxChildDepth = depth;
        }
        // If any branch already hit the limit, we can stop searching other branches
        if (maxChildDepth >= this.MAX_DEPTH) {
          return maxChildDepth;
        }
      }
    }
    return maxChildDepth;
  }
}
