import { Plugin } from '@/core/plugin/Plugin';
import { MCPClient } from '@/core/mcp/MCPClient';

/**
 * 외부 MCP 서버를 연동하는 플러그인입니다.
 */
export class MCPPlugin extends Plugin {
  private clients: Map<string, MCPClient> = new Map();

  async onload() {
    console.log('[MCPPlugin] Loading...');

    // 설정에서 저장된 MCP 서버 목록을 불러와 연결 (예시)
    const servers = await this.loadData(); // [{ url: 'http://localhost:3000' }]
    
    // 초기 서버 연결 예시
    this.addServer('default-server', 'http://localhost:3000');

    this.app.commands.addCommand({
      id: 'mcp-list-tools',
      name: 'MCP 도구 목록 보기',
      callback: () => {
        this.app.emit('mcp:show-tools');
      }
    });
  }

  addServer(id: string, url: string) {
    const client = new MCPClient(url);
    this.clients.set(id, client);
    console.log(`[MCPPlugin] Server added: ${url}`);
  }

  async onunload() {
    this.clients.clear();
    this.app.commands.removeCommand('mcp-list-tools');
  }
}
