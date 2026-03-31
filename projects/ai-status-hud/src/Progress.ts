/**
 * Progress Indicator Component
 */

import type { ProgressIndicator, SubtaskDisplay, TaskPhase, AgentHUDStatus } from './index.ts';

const PHASE_LABELS: Record<TaskPhase, string> = {
  init: '初始化',
  decompose: '分解任务',
  execute: '执行中',
  aggregate: '汇总结果',
  complete: '完成',
};

const SUBTASK_COLORS: Record<AgentHUDStatus, string> = {
  pending: '⏳',
  running: '🔄',
  completed: '✅',
  failed: '❌',
  idle: '⚪',
  thinking: '🟡',
  executing: '🟢',
  waiting: '🔵',
};

export class ProgressComponent {
  private data: ProgressIndicator | null = null;
  private listeners: ((progress: ProgressIndicator | null) => void)[] = [];
  
  /**
   * Start tracking a task
   */
  startTask(taskId: string, taskName: string): void {
    this.data = {
      taskId,
      taskName,
      phase: 'init',
      phaseProgress: 0,
      overallProgress: 0,
      elapsed: 0,
      estimatedRemaining: 0,
    };
    this.notifyListeners();
  }
  
  /**
   * Update phase
   */
  setPhase(phase: TaskPhase, phaseProgress?: number): void {
    if (!this.data) return;
    
    this.data.phase = phase;
    if (phaseProgress !== undefined) {
      this.data.phaseProgress = phaseProgress;
    }
    
    this.calculateOverallProgress();
    this.notifyListeners();
  }
  
  /**
   * Update subtasks
   */
  updateSubtasks(subtasks: SubtaskDisplay[]): void {
    if (!this.data) return;
    
    this.data.subtasks = subtasks;
    this.calculateOverallProgress();
    this.notifyListeners();
  }
  
  /**
   * Update timing
   */
  updateTiming(elapsed: number, estimatedRemaining?: number): void {
    if (!this.data) return;
    
    this.data.elapsed = elapsed;
    if (estimatedRemaining !== undefined) {
      this.data.estimatedRemaining = estimatedRemaining;
    }
    this.notifyListeners();
  }
  
  /**
   * Complete task
   */
  completeTask(): void {
    if (!this.data) return;
    
    this.data.phase = 'complete';
    this.data.phaseProgress = 100;
    this.data.overallProgress = 100;
    this.notifyListeners();
  }
  
  /**
   * Get current data
   */
  getData(): ProgressIndicator | null {
    return this.data;
  }
  
  /**
   * Subscribe to changes
   */
  subscribe(listener: (progress: ProgressIndicator | null) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * Render as text
   */
  render(): string {
    if (!this.data) return '';
    
    const lines: string[] = [];
    
    // Task header
    lines.push(`\n📋 任务: "${this.data.taskName.slice(0, 35)}"`);
    
    // Overall progress
    const filled = Math.round(this.data.overallProgress / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const eta = this.formatTime(this.data.estimatedRemaining);
    lines.push(`总进度: ${bar} ${this.data.overallProgress}%  ${eta}`);
    
    // Phase
    lines.push(`\n📊 阶段: ${PHASE_LABELS[this.data.phase]}`);
    
    // Subtasks
    if (this.data.subtasks && this.data.subtasks.length > 0) {
      lines.push('');
      for (const st of this.data.subtasks.slice(0, 5)) {
        const icon = SUBTASK_COLORS[st.status];
        const agent = st.agent ? ` (${st.agent})` : '';
        const progress = st.status === 'running' ? ` ${st.progress}%` : '';
        const duration = st.duration ? ` ${st.duration}s` : '';
        lines.push(`  ${icon} ${st.name.slice(0, 20)}${agent}${progress}${duration}`);
      }
    }
    
    // Timing
    lines.push(`\n⏱️ 已用时: ${this.formatTime(this.data.elapsed)}`);
    
    return lines.join('\n');
  }
  
  /**
   * Render compact progress bar
   */
  renderCompact(): string {
    if (!this.data) return '';
    
    const filled = Math.round(this.data.overallProgress / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    return `${bar} ${this.data.overallProgress}%`;
  }
  
  private calculateOverallProgress(): void {
    if (!this.data) return;
    
    const phaseWeights: Record<TaskPhase, number> = {
      init: 5,
      decompose: 15,
      execute: 60,
      aggregate: 15,
      complete: 5,
    };
    
    // Base from phase
    let base = 0;
    const phases: TaskPhase[] = ['init', 'decompose', 'execute', 'aggregate', 'complete'];
    for (const p of phases) {
      if (p === this.data.phase) {
        base += phaseWeights[p] * (this.data.phaseProgress / 100);
        break;
      }
      base += phaseWeights[p];
    }
    
    // Adjust from subtasks if available
    if (this.data.subtasks && this.data.subtasks.length > 0) {
      const subtaskAvg = this.data.subtasks.reduce((sum, st) => {
        const weight = st.status === 'completed' ? 100 : st.progress || 0;
        return sum + weight;
      }, 0) / this.data.subtasks.length;
      
      this.data.overallProgress = Math.round((base * 0.3 + subtaskAvg * 0.7));
    } else {
      this.data.overallProgress = Math.round(base);
    }
  }
  
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.data);
    }
  }
}