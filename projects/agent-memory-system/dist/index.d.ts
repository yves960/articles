/**
 * Agent Memory System - Core Types
 */
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
    type: ObservationType;
    title?: string;
    text: string;
    facts?: string[];
    concepts?: string[];
    filesRead?: string[];
    filesModified?: string[];
    promptNumber?: number;
    tokensUsed?: number;
    createdAt: Date;
}
export type ObservationType = 'decision' | 'bugfix' | 'feature' | 'discovery' | 'change';
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
    importance: number;
    accessCount: number;
    lastAccessedAt?: Date;
    decayFactor: number;
    sourceSessionId?: string;
    sourceObservationId?: string;
    createdAt: Date;
}
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
//# sourceMappingURL=index.d.ts.map