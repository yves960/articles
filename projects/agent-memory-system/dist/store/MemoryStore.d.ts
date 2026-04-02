/**
 * Agent Memory System - Memory Store
 *
 * 存储层抽象，支持 SQLite 和内存存储
 */
import type { StorageConfig, Session, Observation, Summary, Memory, SearchOptions } from '../index.js';
export declare class MemoryStore {
    private config;
    private db;
    private sessions;
    private observations;
    private summaries;
    private memories;
    constructor(config: StorageConfig);
    initialize(): Promise<void>;
    private initializeSQLite;
    close(): Promise<void>;
    createSession(session: Session): Promise<void>;
    getSession(id: string): Promise<Session | null>;
    updateSession(session: Session): Promise<void>;
    createObservation(observation: Observation): Promise<void>;
    getSessionObservations(sessionId: string): Promise<Observation[]>;
    getRecentObservations(agentId: string, limit?: number): Promise<Observation[]>;
    searchObservations(options: SearchOptions): Promise<Observation[]>;
    createSummary(summary: Summary): Promise<void>;
    getSummary(sessionId: string): Promise<Summary | null>;
    createMemory(memory: Memory): Promise<void>;
    updateMemory(memory: Memory): Promise<void>;
    getMemory(id: string): Promise<Memory | null>;
    getImportantMemories(agentId: string, threshold?: number): Promise<Memory[]>;
    searchMemories(options: SearchOptions): Promise<Memory[]>;
    getStats(agentId: string): Promise<{
        totalSessions: number;
        totalObservations: number;
        totalMemories: number;
    }>;
    private rowToSession;
    private rowToObservation;
    private rowToSummary;
    private rowToMemory;
}
//# sourceMappingURL=MemoryStore.d.ts.map