/**
 * Agent Memory System - Memory Client
 * 
 * 核心客户端，提供记忆管理的所有 API
 */

import { randomUUID } from 'crypto';
import type {
  MemoryConfig,
  Session,
  Observation,
  Summary,
  Memory,
  StartSessionInput,
  RecordObservationInput,
  EndSessionInput,
  GetContextInput,
  SearchOptions,
  SearchResult,
  ContextResult,
} from './types.js';
import { MemoryStore } from './store/MemoryStore.js';
import { VectorStore } from './vector/VectorStore.js';

export class MemoryClient {
  private config: MemoryConfig;
  private store: MemoryStore;
  private vectorStore?: VectorStore;
  private currentSession?: Session;
  
  constructor(config: MemoryConfig) {
    this.config = config;
    this.store = new MemoryStore(config.storage);
    
    if (config.vector && config.vector.type !== 'none') {
      this.vectorStore = new VectorStore(config.vector);
    }
  }
  
  // ============================================
  // Lifecycle
  // ============================================
  
  async initialize(): Promise<void> {
    await this.store.initialize();
    await this.vectorStore?.initialize(this.config.agentId);
  }
  
  async shutdown(): Promise<void> {
    await this.store.close();
  }
  
  // ============================================
  // Session Management
  // ============================================
  
  async startSession(input: StartSessionInput = {}): Promise<Session> {
    const session: Session = {
      id: randomUUID(),
      agentId: this.config.agentId,
      projectId: this.config.projectId,
      userPrompt: input.userPrompt,
      startedAt: new Date(),
      status: 'active',
      metadata: input.metadata,
    };
    
    await this.store.createSession(session);
    this.currentSession = session;
    
    await this.config.hooks?.onSessionStart?.(session);
    
    return session;
  }
  
  async endSession(sessionId: string, input: EndSessionInput): Promise<void> {
    const session = await this.store.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    // Update session status
    session.completedAt = new Date();
    session.status = input.status;
    await this.store.updateSession(session);
    
    // Create summary if provided
    if (input.summary) {
      const summary: Summary = {
        id: randomUUID(),
        sessionId,
        agentId: session.agentId,
        ...input.summary,
        createdAt: new Date(),
      };
      await this.store.createSummary(summary);
      
      // Extract long-term memories from summary
      await this.extractMemories(session, summary);
    }
    
    await this.config.hooks?.onSessionEnd?.(session, 
      await this.store.getSummary(sessionId) as Summary
    );
    
    if (this.currentSession?.id === sessionId) {
      this.currentSession = undefined;
    }
  }
  
  // ============================================
  // Observations
  // ============================================
  
  async recordObservation(input: RecordObservationInput): Promise<Observation> {
    const observation: Observation = {
      id: randomUUID(),
      sessionId: input.sessionId,
      agentId: this.config.agentId,
      type: input.type,
      title: input.title,
      text: input.text,
      facts: input.facts,
      concepts: input.concepts,
      filesRead: input.filesRead,
      filesModified: input.filesModified,
      promptNumber: input.promptNumber,
      tokensUsed: input.tokensUsed,
      createdAt: new Date(),
    };
    
    await this.store.createObservation(observation);
    
    // Add to vector store for semantic search
    if (this.vectorStore) {
      await this.vectorStore.addObservation(observation);
    }
    
    return observation;
  }
  
  async recordToolUse(
    toolName: string, 
    input: unknown, 
    result: unknown,
    sessionId?: string
  ): Promise<Observation | null> {
    const obs = this.extractObservationFromToolUse(toolName, input, result);
    if (!obs) return null;
    
    const session = sessionId 
      ? await this.store.getSession(sessionId) 
      : this.currentSession;
    
    if (!session) {
      console.warn('No active session for tool use observation');
      return null;
    }
    
    const observation = await this.recordObservation({
      sessionId: session.id,
      ...obs,
    });
    
    await this.config.hooks?.onToolUse?.(toolName, input, result, session);
    
    return observation;
  }
  
  private extractObservationFromToolUse(
    toolName: string,
    input: any,
    result: any
  ): Partial<RecordObservationInput> | null {
    switch (toolName) {
      case 'BashTool':
      case 'bash':
        if (result?.exitCode === 0) {
          return {
            type: 'change',
            title: `执行命令: ${input.command?.slice(0, 50)}...`,
            text: `成功执行命令: ${input.command}`,
            facts: [`命令: ${input.command}`],
          };
        } else if (result?.exitCode !== 0) {
          return {
            type: 'bugfix',
            title: `命令失败: ${input.command?.slice(0, 50)}...`,
            text: `命令执行失败: ${input.command}, 退出码: ${result?.exitCode}`,
            facts: [`错误: ${result?.stderr || result?.error}`],
          };
        }
        break;
        
      case 'FileWriteTool':
      case 'write_file':
        return {
          type: 'change',
          title: `创建/修改文件: ${input.path}`,
          text: `修改了文件 ${input.path}`,
          filesModified: [input.path],
        };
        
      case 'FileEditTool':
      case 'edit_file':
        return {
          type: 'change',
          title: `编辑文件: ${input.path}`,
          text: `编辑了文件 ${input.path}`,
          filesModified: [input.path],
        };
        
      case 'FileReadTool':
      case 'read_file':
        return {
          type: 'discovery',
          title: `读取文件: ${input.path}`,
          text: `读取了文件 ${input.path}`,
          filesRead: [input.path],
        };
    }
    
    return null;
  }
  
  // ============================================
  // Search
  // ============================================
  
  async search(options: SearchOptions): Promise<SearchResult> {
    const observations = await this.store.searchObservations(options);
    const memories = await this.store.searchMemories(options);
    
    let totalTokens = 0;
    for (const obs of observations) {
      totalTokens += obs.tokensUsed || 0;
    }
    
    return { observations, memories, totalTokens };
  }
  
  async getContext(input: GetContextInput): Promise<ContextResult> {
    const maxTokens = input.maxTokens || 2000;
    let usedTokens = 0;
    
    const memories: Memory[] = [];
    const recentObservations: Observation[] = [];
    
    // 1. Semantic search for relevant memories
    if (this.vectorStore && input.query) {
      const vectorResults = await this.vectorStore.search(input.query, 5);
      for (const result of vectorResults) {
        const memory = await this.store.getMemory(result.id);
        if (memory && usedTokens + (memory.text.length / 4) < maxTokens) {
          memories.push(memory);
          usedTokens += Math.floor(memory.text.length / 4);
        }
      }
    }
    
    // 2. Get recent observations
    if (input.includeRecent) {
      const recent = await this.store.getRecentObservations(
        this.config.agentId, 
        10
      );
      for (const obs of recent) {
        if (usedTokens + (obs.text.length / 4) < maxTokens) {
          recentObservations.push(obs);
          usedTokens += Math.floor(obs.text.length / 4);
        }
      }
    }
    
    // 3. Get important memories
    if (input.includeImportant) {
      const important = await this.store.getImportantMemories(
        this.config.agentId,
        0.7  // importance threshold
      );
      for (const memory of important) {
        if (!memories.find(m => m.id === memory.id) && 
            usedTokens + (memory.text.length / 4) < maxTokens) {
          memories.push(memory);
          usedTokens += Math.floor(memory.text.length / 4);
        }
      }
    }
    
    return { memories, recentObservations, totalTokens: usedTokens };
  }
  
  // ============================================
  // Memory Extraction
  // ============================================
  
  private async extractMemories(session: Session, summary: Summary): Promise<void> {
    // Extract key learnings as long-term memories
    if (summary.learned) {
      const memory: Memory = {
        id: randomUUID(),
        agentId: session.agentId,
        text: summary.learned,
        importance: this.calculateImportance('discovery'),
        accessCount: 0,
        decayFactor: 1.0,
        sourceSessionId: session.id,
        createdAt: new Date(),
      };
      
      await this.store.createMemory(memory);
      
      if (this.vectorStore) {
        const embeddingId = await this.vectorStore.addMemory(memory);
        memory.embeddingId = embeddingId;
        await this.store.updateMemory(memory);
      }
    }
    
    // Extract decisions as important memories
    const observations = await this.store.getSessionObservations(session.id);
    for (const obs of observations) {
      if (obs.type === 'decision') {
        const memory: Memory = {
          id: randomUUID(),
          agentId: session.agentId,
          text: obs.text,
          importance: this.calculateImportance(obs.type),
          accessCount: 0,
          decayFactor: 1.0,
          sourceSessionId: session.id,
          sourceObservationId: obs.id,
          createdAt: new Date(),
        };
        
        await this.store.createMemory(memory);
      }
    }
  }
  
  private calculateImportance(type: string): number {
    const weights: Record<string, number> = {
      decision: 0.9,
      bugfix: 0.8,
      feature: 0.7,
      discovery: 0.6,
      change: 0.4,
    };
    return weights[type] || 0.5;
  }
  
  // ============================================
  // Utility
  // ============================================
  
  getCurrentSession(): Session | undefined {
    return this.currentSession;
  }
  
  async getStats(): Promise<{
    totalSessions: number;
    totalObservations: number;
    totalMemories: number;
  }> {
    return this.store.getStats(this.config.agentId);
  }
}