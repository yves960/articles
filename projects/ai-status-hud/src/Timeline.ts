/**
 * Activity Timeline Component
 */

import type { ActivityTimeline, ActivityEntry, ActivityType } from './index.ts';

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  tool_call: '🔧',
  api_request: '🌐',
  file_read: '📖',
  file_write: '✏️',
  thinking: '🧠',
  decision: '💡',
  error: '❌',
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  tool_call: 'blue',
  api_request: 'green',
  file_read: 'cyan',
  file_write: 'yellow',
  thinking: 'magenta',
  decision: 'bright',
  error: 'red',
};

const generateId = () => `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export class TimelineComponent {
  private entries: ActivityEntry[] = [];
  private maxEntries: number = 10;
  private listeners: ((timeline: ActivityTimeline) => void)[] = [];
  
  constructor(maxEntries?: number) {
    if (maxEntries) this.maxEntries = maxEntries;
  }
  
  /**
   * Add an activity entry
   */
  add(entry: Partial<ActivityEntry>): ActivityEntry {
    const fullEntry: ActivityEntry = {
      id: entry.id || generateId(),
      timestamp: entry.timestamp || new Date(),
      type: entry.type || 'tool_call',
      tool: entry.tool,
      input: entry.input,
      result: entry.result,
      duration: entry.duration,
      icon: ACTIVITY_ICONS[entry.type || 'tool_call'],
      color: ACTIVITY_COLORS[entry.type || 'tool_call'],
      summary: this.generateSummary(entry),
    };
    
    this.entries.push(fullEntry);
    
    // Trim to max entries
    while (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    
    this.notifyListeners();
    
    return fullEntry;
  }
  
  /**
   * Add tool call
   */
  addToolCall(tool: string, input: any, duration?: number, result?: any): ActivityEntry {
    return this.add({
      type: 'tool_call',
      tool,
      input,
      result,
      duration,
    });
  }
  
  /**
   * Add file read
   */
  addFileRead(path: string, duration?: number): ActivityEntry {
    return this.add({
      type: 'file_read',
      tool: 'read',
      input: { path },
      duration,
    });
  }
  
  /**
   * Add file write
   */
  addFileWrite(path: string, duration?: number): ActivityEntry {
    return this.add({
      type: 'file_write',
      tool: 'write',
      input: { path },
      duration,
    });
  }
  
  /**
   * Add decision
   */
  addDecision(summary: string, reasoning?: string): ActivityEntry {
    return this.add({
      type: 'decision',
      summary,
      input: reasoning ? { reasoning } : undefined,
    });
  }
  
  /**
   * Add error
   */
  addError(message: string, context?: any): ActivityEntry {
    return this.add({
      type: 'error',
      summary: message,
      input: context,
    });
  }
  
  /**
   * Get timeline data
   */
  getData(): ActivityTimeline {
    return {
      entries: this.entries,
      maxEntries: this.maxEntries,
    };
  }
  
  /**
   * Clear timeline
   */
  clear(): void {
    this.entries = [];
    this.notifyListeners();
  }
  
  /**
   * Subscribe to changes
   */
  subscribe(listener: (timeline: ActivityTimeline) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * Render as text
   */
  render(): string {
    const lines: string[] = [];
    
    lines.push('│ ───────────────────────────────────────────────────│');
    lines.push('│ 🕐 最近活动:                                        │');
    
    if (this.entries.length === 0) {
      lines.push('│   (无活动记录)                                      │');
    } else {
      for (const entry of this.entries.slice(-5)) {
        const time = entry.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const status = entry.duration ? ` (${entry.duration}ms)` : '';
        const text = `${entry.icon} ${entry.summary.slice(0, 35)}${status}`;
        lines.push(`│   ${time} ${text}`.slice(0, 55).padEnd(55) + '│');
      }
    }
    
    return lines.join('\n');
  }
  
  /**
   * Render full details for a specific entry
   */
  renderEntryDetail(entryId: string): string {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return 'Entry not found';
    
    const lines: string[] = [];
    lines.push(`\n=== Activity: ${entry.id} ===\n`);
    lines.push(`Type: ${entry.type}`);
    lines.push(`Time: ${entry.timestamp.toLocaleString()}`);
    lines.push(`Duration: ${entry.duration || 0}ms`);
    
    if (entry.tool) {
      lines.push(`Tool: ${entry.tool}`);
    }
    
    if (entry.input) {
      lines.push(`\nInput:\n${JSON.stringify(entry.input, null, 2)}`);
    }
    
    if (entry.result) {
      lines.push(`\nResult:\n${JSON.stringify(entry.result, null, 2)}`);
    }
    
    return lines.join('\n');
  }
  
  private generateSummary(entry: Partial<ActivityEntry>): string {
    switch (entry.type) {
      case 'tool_call':
        return `${entry.tool}: ${this.truncateInput(entry.input)}`;
      case 'file_read':
        return `read: ${entry.input?.path || 'file'}`;
      case 'file_write':
        return `write: ${entry.input?.path || 'file'}`;
      case 'api_request':
        return `API: ${entry.input?.endpoint || 'request'}`;
      case 'thinking':
        return entry.summary || 'processing...';
      case 'decision':
        return entry.summary || 'decision made';
      case 'error':
        return entry.summary || 'error occurred';
      default:
        return 'activity';
    }
  }
  
  private truncateInput(input: any): string {
    if (!input) return '';
    
    if (typeof input === 'string') {
      return input.slice(0, 30);
    }
    
    if (typeof input === 'object') {
      const keys = Object.keys(input);
      if (keys.length === 1) {
        const val = input[keys[0]];
        if (typeof val === 'string') {
          return val.slice(0, 25);
        }
      }
      return keys.join(', ').slice(0, 25);
    }
    
    return '';
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.getData());
    }
  }
}