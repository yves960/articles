/**
 * Agent Memory System - Memory Client
 *
 * 核心客户端，提供记忆管理的所有 API
 */
import type { MemoryConfig, Session, Observation, StartSessionInput, RecordObservationInput, EndSessionInput, GetContextInput, SearchOptions, SearchResult, ContextResult } from './index.js';
export declare class MemoryClient {
    private config;
    private store;
    private vectorStore?;
    private currentSession?;
    constructor(config: MemoryConfig);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    startSession(input?: StartSessionInput): Promise<Session>;
    endSession(sessionId: string, input: EndSessionInput): Promise<void>;
    recordObservation(input: RecordObservationInput): Promise<Observation>;
    recordToolUse(toolName: string, input: unknown, result: unknown, sessionId?: string): Promise<Observation | null>;
    private extractObservationFromToolUse;
    search(options: SearchOptions): Promise<SearchResult>;
    getContext(input: GetContextInput): Promise<ContextResult>;
    private extractMemories;
    private calculateImportance;
    getCurrentSession(): Session | undefined;
    getStats(): Promise<{
        totalSessions: number;
        totalObservations: number;
        totalMemories: number;
    }>;
}
//# sourceMappingURL=MemoryClient.d.ts.map