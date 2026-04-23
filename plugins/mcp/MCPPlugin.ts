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
    // 1. 명령어 등록
    this.app.commands.addCommand({
      id: 'mcp-tools',
      name: 'View MCP Tools',
      callback: () => {
        this.app.emit('mcp:show-tools');
      }
    });

    this.app.commands.addCommand({
      id: 'open-mcp-settings',
      name: 'MCP Settings',
      callback: () => this.app.emit('mcp:open-settings')
    });
  }

  addServer(id: string, url: string) {
    const client = new MCPClient(url);
    this.clients.set(id, client);
    console.log(`[MCPPlugin] Server added: ${url}`);
  }

  async onunload() {
    this.clients.clear();
    this.app.commands.removeCommand('mcp-tools');
  }
}
