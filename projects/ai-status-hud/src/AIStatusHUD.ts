/**
 * AI Status HUD - Main Controller
 */

import { StatusBarComponent } from './StatusBar.ts';
import { TimelineComponent } from './Timeline.ts';
import { ProgressComponent } from './Progress.ts';
import type { HUDConfig, HUDOutput, AgentStatusDisplay, SubtaskDisplay } from './index.ts';

export interface AIStatusHUDConfig extends HUDConfig {
  autoExpandThreshold?: number;  // seconds
  outputMode?: 'terminal' | 'websocket' | 'silent';
}

export class AIStatusHUD {
  private statusBar: StatusBarComponent;
  private timeline: TimelineComponent;
  private progress: ProgressComponent;
  
  private config: AIStatusHUDConfig;
  private startTime: Date | null = null;
  private currentTaskId: string | null = null;
  private updateInterval: Timer | null = null;
  
  // Event hooks
  private onUpdate: ((output: HUDOutput) => void) | null = null;
  
  constructor(config: AIStatusHUDConfig = {}) {
    this.config = {
      maxTimelineEntries: config.maxTimelineEntries || 10,
      autoExpandThreshold: config.autoExpandThreshold || 5,
      outputMode: config.outputMode || 'terminal',
      ...config,
    };
    
    this.statusBar = new StatusBarComponent();
    this.timeline = new TimelineComponent(this.config.maxTimelineEntries);
    this.progress = new ProgressComponent();
    
    // Subscribe to component changes
    this.statusBar.subscribe(() => this.render());
    this.timeline.subscribe(() => this.render());
    this.progress.subscribe(() => this.render());
  }
  
  /**
   * Start a new task
   */
  startTask(taskId: string, taskName: string): void {
    this.currentTaskId = taskId;
    this.startTime = new Date();
    
    this.progress.startTask(taskId, taskName);
    this.statusBar.setAction(`开始任务: ${taskName}`);
    
    // Start timing updates
    this.updateInterval = setInterval(() => {
      if (this.startTime) {
        const elapsed = (Date.now() - this.startTime.getTime()) / 1000;
        this.progress.updateTiming(elapsed);
      }
    }, 1000);
  }
  
  /**
   * Set current action
   */
  setAction(action: string, tool?: string): void {
    this.statusBar.setAction(action, tool);
    
    // Auto-expand for long operations
    const elapsed = this.startTime ? (Date.now() - this.startTime.getTime()) / 1000 : 0;
    if (elapsed > this.config.autoExpandThreshold!) {
      this.statusBar.update({ expanded: true });
    }
  }
  
  /**
   * Record a tool call
   */
  recordToolCall(tool: string, input: any, duration?: number, result?: any): void {
    this.timeline.addToolCall(tool, input, duration, result);
    this.statusBar.setAction(`使用工具: ${tool}`, tool);
    
    // Update token usage if provided
    if (result?.tokensUsed) {
      this.statusBar.updateTokens(result.tokensUsed);
    }
  }
  
  /**
   * Record file read
   */
  recordFileRead(path: string, duration?: number): void {
    this.timeline.addFileRead(path, duration);
    this.statusBar.setAction(`读取文件: ${path.split('/').pop()}`, 'read');
  }
  
  /**
   * Record file write
   */
  recordFileWrite(path: string, duration?: number): void {
    this.timeline.addFileWrite(path, duration);
    this.statusBar.setAction(`写入文件: ${path.split('/').pop()}`, 'write');
  }
  
  /**
   * Record decision
   */
  recordDecision(summary: string, reasoning?: string): void {
    this.timeline.addDecision(summary, reasoning);
    this.statusBar.setAction(`决策: ${summary.slice(0, 30)}`);
  }
  
  /**
   * Record error
   */
  recordError(message: string, context?: any): void {
    this.timeline.addError(message, context);
    this.statusBar.update({ expanded: true });
  }
  
  /**
   * Update phase
   */
  setPhase(phase: 'init' | 'decompose' | 'execute' | 'aggregate' | 'complete', progress?: number): void {
    this.progress.setPhase(phase, progress);
    
    const phaseLabels = {
      init: '初始化',
      decompose: '分解任务',
      execute: '执行中',
      aggregate: '汇总结果',
      complete: '完成',
    };
    
    this.statusBar.setAction(`阶段: ${phaseLabels[phase]}`);
  }
  
  /**
   * Update subtask progress
   */
  updateSubtasks(subtasks: SubtaskDisplay[]): void {
    this.progress.updateSubtasks(subtasks);
    
    // Update agent statuses
    const agents: AgentStatusDisplay[] = subtasks
      .filter(st => st.agent)
      .map(st => ({
        id: st.agent!,
        name: st.agent!,
        status: st.status,
        currentTask: st.name,
        progress: st.progress,
        color: this.getStatusColor(st.status),
      }));
    
    this.statusBar.updateAgents(agents);
  }
  
  /**
   * Update token usage
   */
  updateTokens(used: number, limit?: number): void {
    this.statusBar.updateTokens(used, limit);
  }
  
  /**
   * Complete task
   */
  completeTask(summary?: string): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.progress.completeTask();
    this.statusBar.setAction(summary || '任务完成');
    this.statusBar.update({
      progress: 100,
      expanded: false,
    });
    
    // Auto-collapse after 3 seconds
    setTimeout(() => {
      this.statusBar.update({ expanded: false });
    }, 3000);
  }
  
  /**
   * Get current output
   */
  getOutput(): HUDOutput {
    return {
      statusBar: this.statusBar.getData(),
      timeline: this.timeline.getData(),
      progress: this.progress.getData(),
      renderedAt: new Date(),
    };
  }
  
  /**
   * Set update callback
   */
  onUpdateCallback(callback: (output: HUDOutput) => void): void {
    this.onUpdate = callback;
  }
  
  /**
   * Render to output
   */
  render(): void {
    const output = this.getOutput();
    
    if (this.onUpdate) {
      this.onUpdate(output);
    }
    
    if (this.config.outputMode === 'terminal') {
      this.renderTerminal();
    }
  }
  
  /**
   * Render to terminal
   */
  private renderTerminal(): void {
    const statusBarText = this.statusBar.render();
    const timelineText = this.timeline.render();
    const progressText = this.progress.render();
    
    console.clear();
    console.log(statusBarText);
    console.log(timelineText);
    
    if (progressText) {
      console.log(progressText);
    }
  }
  
  /**
   * Toggle expanded state
   */
  toggleExpanded(): void {
    this.statusBar.toggleExpanded();
  }
  
  /**
   * Get entry detail
   */
  getEntryDetail(entryId: string): string {
    return this.timeline.renderEntryDetail(entryId);
  }
  
  /**
   * Clear timeline
   */
  clearTimeline(): void {
    this.timeline.clear();
  }
  
  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'gray',
      running: 'green',
      completed: 'bright',
      failed: 'red',
      idle: 'gray',
      thinking: 'yellow',
      executing: 'green',
      waiting: 'blue',
    };
    return colors[status] || 'gray';
  }
}