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

export class VectorStore {
  private config: VectorConfig;
  private client: any;
  private collection: any;
  
  constructor(config: VectorConfig) {
    this.config = config;
  }
  
  async initialize(agentId: string): Promise<void> {
    if (this.config.type === 'none') {
      return;
    }
    
    try {
      // Try to import ChromaDB
      const { ChromaClient } = await import('chromadb');
      
      this.client = new ChromaClient({
        path: this.config.url || 'http://localhost:8000',
      });
      
      this.collection = await this.client.getOrCreateCollection({
        name: `agent-${agentId}`,
        metadata: { 'hnsw:space': 'cosine' },
      });
      
      console.log(`✅ Vector store initialized for agent ${agentId}`);
    } catch (error) {
      console.warn('Failed to initialize ChromaDB, semantic search will be disabled:', error);
      this.config.type = 'none';
    }
  }
  
  async addObservation(observation: Observation): Promise<void> {
    if (!this.collection) return;
    
    try {
      await this.collection.add({
        ids: [observation.id],
        documents: [observation.text],
        metadatas: [{
          type: observation.type,
          title: observation.title || '',
          sessionId: observation.sessionId,
          agentId: observation.agentId,
        }],
      });
    } catch (error) {
      console.error('Failed to add observation to vector store:', error);
    }
  }
  
  async addMemory(memory: Memory): Promise<string | undefined> {
    if (!this.collection) return undefined;
    
    try {
      await this.collection.add({
        ids: [memory.id],
        documents: [memory.text],
        metadatas: [{
          type: 'memory',
          importance: memory.importance,
          agentId: memory.agentId,
        }],
      });
      
      return memory.id;
    } catch (error) {
      console.error('Failed to add memory to vector store:', error);
      return undefined;
    }
  }
  
  async search(query: string, limit: number = 10): Promise<VectorSearchResult[]> {
    if (!this.collection) return [];
    
    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit,
      });
      
      if (!results.ids || results.ids.length === 0 || results.ids[0].length === 0) {
        return [];
      }
      
      return results.ids[0].map((id: string, i: number) => ({
        id,
        distance: results.distances?.[0]?.[i] || 0,
        metadata: results.metadatas?.[0]?.[i] || {},
      }));
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }
  
  async delete(ids: string[]): Promise<void> {
    if (!this.collection) return;
    
    try {
      await this.collection.delete({ ids });
    } catch (error) {
      console.error('Failed to delete from vector store:', error);
    }
  }
  
  async count(): Promise<number> {
    if (!this.collection) return 0;
    
    try {
      return await this.collection.count();
    } catch {
      return 0;
    }
  }
}