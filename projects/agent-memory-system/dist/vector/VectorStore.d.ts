/**
 * Agent Memory System - Vector Store
 *
 * 向量存储抽象，支持语义搜索
 */
import type { VectorConfig, Observation, Memory } from '../index.js';
export interface VectorSearchResult {
    id: string;
    distance: number;
    metadata: Record<string, unknown>;
}
export declare class VectorStore {
    private config;
    private client;
    private collection;
    constructor(config: VectorConfig);
    initialize(agentId: string): Promise<void>;
    addObservation(observation: Observation): Promise<void>;
    addMemory(memory: Memory): Promise<string | undefined>;
    search(query: string, limit?: number): Promise<VectorSearchResult[]>;
    delete(ids: string[]): Promise<void>;
    count(): Promise<number>;
}
//# sourceMappingURL=VectorStore.d.ts.map