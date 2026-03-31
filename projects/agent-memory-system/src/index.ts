/**
 * Agent Memory System - Core Types
 */

// ============================================
// Core Types
// ============================================

export interface Session {
  id: string;
  agentId: string;
  projectId: string;
  userPrompt?: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface Observation {
  id: string;
  sessionId: string;
  agentId: string;
  
  // Core content
  type: ObservationType;
  title?: string;
  text: string;
  
  // Structured info
  facts?: string[];
  concepts?: string[];
  filesRead?: string[];
  filesModified?: string[];
  
  // Metadata
  promptNumber?: number;
  tokensUsed?: number;
  createdAt: Date;
}

export type ObservationType = 
  | 'decision'   // 重要决策
  | 'bugfix'     // bug 修复
  | 'feature'    // 新功能
  | 'discovery'  // 发现/洞察
  | 'change';    // 普通修改

export interface Summary {
  id: string;
  sessionId: string;
  agentId: string;
  
  request?: string;
  investigated?: string;
  learned?: string;
  completed?: string;
  nextSteps?: string;
  
  filesRead?: string[];
  filesEdited?: string[];
  totalTokens?: number;
  
  createdAt: Date;
}

export interface Memory {
  id: string;
  agentId: string;
  
  text: string;
  embeddingId?: string;
  
  importance: number;      // 0-1
  accessCount: number;
  lastAccessedAt?: Date;
  decayFactor: number;
  
  sourceSessionId?: string;
  sourceObservationId?: string;
  
  createdAt: Date;
}

// ============================================
// Search Types
// ============================================

export interface SearchFilters {
  agentId?: string;
  projectId?: string;
  type?: ObservationType | ObservationType[];
  concepts?: string | string[];
  files?: string | string[];
  dateRange?: {
    start?: Date | string;
    end?: Date | string;
  };
}

export interface SearchOptions extends SearchFilters {
  limit?: number;
  offset?: number;
  orderBy?: 'relevance' | 'date_desc' | 'date_asc';
}

export interface SearchResult {
  observations: Observation[];
  memories: Memory[];
  totalTokens: number;
}

export interface ContextResult {
  memories: Memory[];
  recentObservations: Observation[];
  totalTokens: number;
}

// ============================================
// Config Types
// ============================================

export interface MemoryConfig {
  agentId: string;
  projectId: string;
  storage: StorageConfig;
  vector?: VectorConfig;
  hooks?: MemoryHooks;
}

export interface StorageConfig {
  type: 'sqlite' | 'memory';
  path?: string;
}

export interface VectorConfig {
  type: 'chroma' | 'none';
  url?: string;
}

export interface MemoryHooks {
  onSessionStart?: (session: Session) => Promise<void>;
  onUserPrompt?: (prompt: string, session: Session) => Promise<void>;
  onToolUse?: (toolName: string, input: unknown, result: unknown, session: Session) => Promise<void>;
  onSessionEnd?: (session: Session, summary: Summary) => Promise<void>;
}

// ============================================
// Input Types
// ============================================

export interface StartSessionInput {
  userPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface RecordObservationInput {
  sessionId: string;
  type: ObservationType;
  title?: string;
  text: string;
  facts?: string[];
  concepts?: string[];
  filesRead?: string[];
  filesModified?: string[];
  promptNumber?: number;
  tokensUsed?: number;
}

export interface EndSessionInput {
  sessionId: string;
  status: 'completed' | 'failed';
  summary?: {
    request?: string;
    investigated?: string;
    learned?: string;
    completed?: string;
    nextSteps?: string;
    filesRead?: string[];
    filesEdited?: string[];
    totalTokens?: number;
  };
}

export interface GetContextInput {
  query: string;
  maxTokens?: number;
  includeRecent?: boolean;
  includeImportant?: boolean;
}