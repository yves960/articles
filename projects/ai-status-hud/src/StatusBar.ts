/**
 * Status Bar Component
 */

import type { AIStatusBar, AgentStatusDisplay, AgentHUDStatus } from './index.ts';

const STATUS_COLORS: Record<AgentHUDStatus, string> = {
  idle: '🔵',
  thinking: '🟡',
  executing: '🟢',
  waiting: '⚪',
  completed: '✅',
  failed: '🔴',
};

export class StatusBarComponent {
  private data: AIStatusBar;
  private listeners: ((data: AIStatusBar) => void)[] = [];
  
  constructor() {
    this.data = {
      currentAction: '准备中...',
      tokensUsed: 0,
      tokensLimit: 32000,
      contextPercent: 0,
      expanded: false,
    };
  }
  
  /**
   * Update status bar data
   */
  update(data: Partial<AIStatusBar>): void {
    this.data = { ...this.data, ...data };
    this.notifyListeners();
  }
  
  /**
   * Get current data
   */
  getData(): AIStatusBar {
    return this.data;
  }
  
  /**
   * Set current action
   */
  setAction(action: string, tool?: string): void {
    this.update({
      currentAction: action,
      currentTool: tool,
    });
  }
  
  /**
   * Set progress
   */
  setProgress(progress: number, estimatedTime?: number): void {
    this.update({
      progress,
      estimatedTime,
    });
  }
  
  /**
   * Update token usage
   */
  updateTokens(used: number, limit?: number): void {
    this.update({
      tokensUsed: used,
      tokensLimit: limit || this.data.tokensLimit,
      contextPercent: Math.round((used / (limit || this.data.tokensLimit)) * 100),
    });
  }
  
  /**
   * Update agent statuses
   */
  updateAgents(agents: AgentStatusDisplay[]): void {
    this.update({ agents });
  }
  
  /**
   * Toggle expanded state
   */
  toggleExpanded(): void {
    this.update({ expanded: !this.data.expanded });
  }
  
  /**
   * Subscribe to changes
   */
  subscribe(listener: (data: AIStatusBar) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * Render as text
   */
  render(): string {
    const lines: string[] = [];
    
    // Header
    lines.push('┌─────────────────────────────────────────────────────┐');
    lines.push('│ 🤖 AI 状态                                          │');
    lines.push('│                                                     │');
    
    // Current action
    const actionIcon = this.data.currentTool ? '🔄' : '⏳';
    lines.push(`│ ${actionIcon} ${this.data.currentAction.slice(0, 40).padEnd(40)}│`);
    
    // Progress bar
    if (this.data.progress !== undefined) {
      const filled = Math.round(this.data.progress / 5);
      const empty = 20 - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      const eta = this.data.estimatedTime ? `~${this.data.estimatedTime}s` : '';
      lines.push(`│ 📊 进度: ${bar} ${this.data.progress}% ${eta.padEnd(8)}│`);
    }
    
    // Token usage
    const tokenPercent = Math.round((this.data.tokensUsed / this.data.tokensLimit) * 100);
    lines.push(`│ 💾 Token: ${this.data.tokensUsed.toLocaleString()} / ${this.data.tokensLimit.toLocaleString()} (${tokenPercent}%)`.padEnd(56) + '│');
    
    // Agents (if expanded)
    if (this.data.expanded && this.data.agents && this.data.agents.length > 0) {
      lines.push('│                                                     │');
      lines.push('│ 👥 Agent 状态:                                      │');
      for (const agent of this.data.agents.slice(0, 4)) {
        const icon = STATUS_COLORS[agent.status];
        const progressStr = agent.progress ? ` ${agent.progress}%` : '';
        lines.push(`│   ${icon} ${agent.name}: ${agent.status}${progressStr}`.slice(0, 55).padEnd(55) + '│');
      }
    }
    
    // Toggle hint
    const toggleHint = this.data.expanded ? '[收起 ▲]' : '[展开 ▼]';
    lines.push('│                                                     │');
    lines.push(`│ ${toggleHint}`.padEnd(55) + '│');
    
    lines.push('└─────────────────────────────────────────────────────┘');
    
    return lines.join('\n');
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.data);
    }
  }
}