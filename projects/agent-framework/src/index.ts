/**
 * Agent Framework - Core Types
 */

// === Query Engine ===

export type QueryIntent = 'question' | 'command' | 'conversation';

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export interface QueryAnalysis {
  intent: QueryIntent;
  entities: Entity[];
  tools: string[];
  complexity: number;  // 1-5
  requiresMemory: boolean;
}

export interface ToolSpec {
  name: string;
  input: any;
}

export interface Route {
  type: 'single_tool' | 'multi_tool' | 'conversation' | 'delegate';
  tools: ToolSpec[];
  context: string[];
}

export interface ExecutionStep {
  type: 'tool_call' | 'reasoning' | 'output';
  tool?: string;
  input?: any;
  reasoning?: string;
  output?: string;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedTokens: number;
  timeout: number;
}

// === Tool System ===

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;  // JSON Schema
  permissions: Permission[];
  timeout?: number;
  
  execute(input: any, context: ToolContext): Promise<ToolResult>;
}

export interface ToolContext {
  agentId: string;
  sessionId: string;
  workingDirectory: string;
}

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string;
  metadata?: {
    duration: number;
    tokensUsed?: number;
  };
}

// === Permission System ===

export interface Permission {
  type: string;
  resource?: string;
  constraints?: PermissionConstraints;
}

export interface PermissionConstraints {
  readOnly?: boolean;
  allowedPaths?: string[];
  allowedCommands?: string[];
}

export type PermissionDecision = 'allow' | 'deny' | 'confirm';

export interface PermissionPolicy {
  autoAllow: Permission[];
  requireConfirmation: Permission[];
  autoDeny: Permission[];
}

// === Agent Loop ===

export type AgentState = 'running' | 'paused' | 'stopped';

export type AgentEvent = 
  | { type: 'thinking'; content: string }
  | { type: 'tool_call'; tool: string; input: any }
  | { type: 'tool_result'; tool: string; result: ToolResult }
  | { type: 'message'; content: string }
  | { type: 'permission_request'; permission: Permission }
  | { type: 'error'; error: Error }
  | { type: 'complete'; result: any };

// === Agent Config ===

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  
  capabilities: {
    tools: string[];
    permissions: Permission[];
  };
  
  model: {
    provider: string;
    name: string;
    temperature?: number;
    maxTokens?: number;
  };
  
  behavior: {
    maxIterations: number;
    timeout: number;
    autoApprove: boolean;
  };
  
  memory: {
    enabled: boolean;
    maxContextTokens: number;
  };
}