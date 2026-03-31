/**
 * Multi-Agent Orchestration - Core Types
 */

// === Task Types ===

export type TaskType = 'code' | 'research' | 'analysis' | 'creative' | 'mixed';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'decomposed' | 'running' | 'completed' | 'failed';
export type SubTaskStatus = 'pending' | 'waiting_input' | 'running' | 'completed' | 'failed';

export interface TaskRequest {
  type: TaskType;
  description: string;
  priority: TaskPriority;
  deadline?: Date;
  constraints?: TaskConstraints;
}

export interface TaskConstraints {
  maxAgents?: number;
  requiredCapabilities?: string[];
  timeout?: number;  // seconds
  budget?: number;   // token budget
}

export interface Task {
  id: string;
  request: TaskRequest;
  
  // Decomposition
  subtasks: SubTask[];
  
  // State
  status: TaskStatus;
  progress: number;  // 0-100
  
  // Assignments
  assignments: Assignment[];
  
  // Shared context
  sharedContext: Map<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface SubTask {
  id: string;
  parentTaskId: string;
  
  // Definition
  type: string;
  description: string;
  inputRequirements: string[];  // context keys needed
  outputKeys: string[];         // context keys produced
  
  // State
  status: SubTaskStatus;
  assignedAgent?: string;
  
  // Result
  result?: SubTaskResult;
  
  // Dependencies
  dependencies: string[];  // subtask IDs that must complete first
}

export interface SubTaskResult {
  success: boolean;
  output: any;
  observations?: ObservationSummary[];
  metrics: {
    duration: number;
    tokensUsed?: number;
    apiCalls?: number;
  };
}

export interface ObservationSummary {
  type: string;
  text: string;
}

// === Agent Types ===

export type AgentRole = 'dev' | 'pm' | 'designer' | 'researcher' | 'reviewer' | 'devops';
export type AgentStatus = 'idle' | 'busy' | 'offline';

export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  
  // Capabilities
  capabilities: AgentCapabilities;
  
  // Performance metrics
  performance: AgentPerformance;
  
  // Current state
  status: AgentStatus;
  currentTasks: string[];
}

export interface AgentCapabilities {
  taskTypes: TaskType[];      // can handle
  tools: string[];            // can use
  maxConcurrent: number;      // parallel tasks
  specialities: string[];     // expertise areas
}

export interface AgentPerformance {
  avgCompletionTime: number;  // seconds
  successRate: number;        // 0-1
  totalTasksCompleted: number;
}

// === Assignment Types ===

export type AssignmentStatus = 'assigned' | 'accepted' | 'rejected' | 'completed';

export interface Assignment {
  subtaskId: string;
  agentId: string;
  assignedAt: Date;
  status: AssignmentStatus;
  result?: SubTaskResult;
}

// === Progress Types ===

export interface TaskProgress {
  taskId: string;
  overallProgress: number;
  subtaskProgress: SubTaskProgress[];
  blockers: Blocker[];
  estimatedTimeRemaining: number;  // seconds
}

export interface SubTaskProgress {
  subtaskId: string;
  status: SubTaskStatus;
  progress: number;
  agentId?: string;
  message?: string;
}

export interface Blocker {
  subtaskId: string;
  reason: string;
  waitingFor?: string[];  // subtask IDs or context keys
  suggestedAction?: string;
}

// === Message Types ===

export type MessageType = 'request' | 'response' | 'update' | 'error' | 'broadcast';

export interface AgentMessage {
  id: string;
  from: string;   // agent ID
  to: string;     // agent ID or 'broadcast'
  type: MessageType;
  content: any;
  timestamp: Date;
  taskId?: string;
}

// === Result Types ===

export interface FinalResult {
  taskId: string;
  success: boolean;
  output: any;
  summary: string;
  metrics: AggregatedMetrics;
  observations: ObservationSummary[];
}

export interface AggregatedMetrics {
  totalDuration: number;
  totalTokensUsed: number;
  totalApiCalls: number;
  agentsUsed: string[];
}