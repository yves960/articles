/**
 * AI Status HUD - Core Types
 */

export type AgentHUDStatus = 'idle' | 'thinking' | 'executing' | 'waiting' | 'completed' | 'failed';
export type ActivityType = 'tool_call' | 'api_request' | 'file_read' | 'file_write' | 'thinking' | 'decision' | 'error';
export type TaskPhase = 'init' | 'decompose' | 'execute' | 'aggregate' | 'complete';

// === Status Bar ===

export interface AIStatusBar {
  currentAction: string;
  currentTool?: string;
  
  progress?: number;
  estimatedTime?: number;
  
  tokensUsed: number;
  tokensLimit: number;
  contextPercent: number;
  
  agents?: AgentStatusDisplay[];
  
  expanded: boolean;
}

export interface AgentStatusDisplay {
  id: string;
  name: string;
  status: AgentHUDStatus;
  currentTask?: string;
  progress?: number;
  color: string;
}

// === Activity Timeline ===

export interface ActivityTimeline {
  entries: ActivityEntry[];
  maxEntries: number;
}

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  type: ActivityType;
  
  tool?: string;
  input?: any;
  result?: any;
  duration?: number;
  
  icon: string;
  color: string;
  summary: string;
}

// === Progress Indicator ===

export interface ProgressIndicator {
  taskId: string;
  taskName: string;
  
  phase: TaskPhase;
  phaseProgress: number;
  overallProgress: number;
  
  subtasks?: SubtaskDisplay[];
  
  elapsed: number;
  estimatedRemaining: number;
}

export interface SubtaskDisplay {
  id: string;
  name: string;
  status: AgentHUDStatus;
  agent?: string;
  progress: number;
  duration?: number;
}

// === HUD Config ===

export interface HUDConfig {
  // Display settings
  maxTimelineEntries?: number;
  autoExpandThreshold?: number;  // seconds before auto-expand
  compactMode?: boolean;
  
  // Data sources
  memoryClient?: any;  // MemoryClient
  orchestrator?: any;  // Orchestrator
}

// === Output Format ===

export interface HUDOutput {
  statusBar: AIStatusBar;
  timeline: ActivityTimeline;
  progress?: ProgressIndicator;
  renderedAt: Date;
}