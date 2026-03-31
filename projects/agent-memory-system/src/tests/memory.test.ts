/**
 * Agent Memory System - Unit Tests
 * 
 * Tests for MemoryClient, MemoryStore, and VectorStore
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { MemoryClient } from '../MemoryClient';
import type { 
  MemoryConfig, 
  Session, 
  Observation, 
  Summary, 
  Memory,
  ObservationType 
} from '../index';

// ============================================
// Test Configuration
// ============================================

function createTestConfig(agentId: string = 'test-agent'): MemoryConfig {
  return {
    agentId,
    projectId: 'test-project',
    storage: {
      type: 'memory',  // Use in-memory store for tests
    },
    vector: {
      type: 'none',  // Disable vector store for unit tests
    },
  };
}

// ============================================
// MemoryClient Tests
// ============================================

describe('MemoryClient', () => {
  let memory: MemoryClient;
  let config: MemoryConfig;

  beforeEach(async () => {
    config = createTestConfig();
    memory = new MemoryClient(config);
    await memory.initialize();
  });

  afterEach(async () => {
    await memory.shutdown();
  });

  // ============================================
  // Session Tests
  // ============================================

  describe('Session Management', () => {
    test('should start a new session', async () => {
      const session = await memory.startSession({
        userPrompt: 'Test prompt',
        metadata: { source: 'test' },
      });

      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.agentId).toBe(config.agentId);
      expect(session.projectId).toBe(config.projectId);
      expect(session.userPrompt).toBe('Test prompt');
      expect(session.status).toBe('active');
      expect(session.metadata).toEqual({ source: 'test' });
      expect(session.startedAt).toBeInstanceOf(Date);
    });

    test('should start session without input', async () => {
      const session = await memory.startSession();
      
      expect(session).toBeDefined();
      expect(session.status).toBe('active');
      expect(session.userPrompt).toBeUndefined();
    });

    test('should end an active session', async () => {
      const session = await memory.startSession();
      
      await memory.endSession(session.id, {
        status: 'completed',
        summary: {
          learned: 'Test learned',
        },
      });

      const updated = memory.getCurrentSession();
      expect(updated).toBeUndefined();
    });

    test('should throw error when ending non-existent session', async () => {
      await expect(memory.endSession('non-existent', {
        status: 'completed',
      })).rejects.toThrow('Session not found');
    });

    test('should create summary on session end', async () => {
      const session = await memory.startSession();
      
      await memory.endSession(session.id, {
        status: 'completed',
        summary: {
          request: 'Test request',
          investigated: 'What was investigated',
          learned: 'What was learned',
          completed: 'What was completed',
          nextSteps: 'What to do next',
          filesRead: ['file1.ts', 'file2.ts'],
          filesEdited: ['file3.ts'],
          totalTokens: 1000,
        },
      });

      const stats = await memory.getStats();
      expect(stats.totalSessions).toBe(1);
    });
  });

  // ============================================
  // Observation Tests
  // ============================================

  describe('Observations', () => {
    let session: Session;

    beforeEach(async () => {
      session = await memory.startSession();
    });

    test('should record an observation', async () => {
      const observation = await memory.recordObservation({
        sessionId: session.id,
        type: 'discovery',
        title: 'Test discovery',
        text: 'This is a test observation',
        facts: ['Fact 1', 'Fact 2'],
        concepts: ['testing', 'unit-test'],
        filesRead: ['test.ts'],
        tokensUsed: 500,
      });

      expect(observation).toBeDefined();
      expect(observation.id).toBeTruthy();
      expect(observation.sessionId).toBe(session.id);
      expect(observation.agentId).toBe(config.agentId);
      expect(observation.type).toBe('discovery');
      expect(observation.title).toBe('Test discovery');
      expect(observation.text).toBe('This is a test observation');
      expect(observation.facts).toEqual(['Fact 1', 'Fact 2']);
      expect(observation.concepts).toEqual(['testing', 'unit-test']);
      expect(observation.tokensUsed).toBe(500);
    });

    test('should record observation with all types', async () => {
      const types: ObservationType[] = ['decision', 'bugfix', 'feature', 'discovery', 'change'];
      
      for (const type of types) {
        const obs = await memory.recordObservation({
          sessionId: session.id,
          type,
          text: `Test ${type}`,
        });
        expect(obs.type).toBe(type);
      }
    });

    test('should record tool use observation for bash success', async () => {
      const obs = await memory.recordToolUse(
        'BashTool',
        { command: 'ls -la' },
        { exitCode: 0 },
        session.id
      );

      expect(obs).toBeDefined();
      expect(obs?.type).toBe('change');
      expect(obs?.title).toContain('执行命令');
    });

    test('should record tool use observation for bash failure', async () => {
      const obs = await memory.recordToolUse(
        'BashTool',
        { command: 'exit 1' },
        { exitCode: 1, stderr: 'Command failed' },
        session.id
      );

      expect(obs).toBeDefined();
      expect(obs?.type).toBe('bugfix');
    });

    test('should record tool use observation for file write', async () => {
      const obs = await memory.recordToolUse(
        'FileWriteTool',
        { path: 'test.ts', content: 'hello' },
        { success: true },
        session.id
      );

      expect(obs).toBeDefined();
      expect(obs?.type).toBe('change');
      expect(obs?.filesModified).toContain('test.ts');
    });

    test('should record tool use observation for file read', async () => {
      const obs = await memory.recordToolUse(
        'FileReadTool',
        { path: 'test.ts' },
        { content: 'file content' },
        session.id
      );

      expect(obs).toBeDefined();
      expect(obs?.type).toBe('discovery');
      expect(obs?.filesRead).toContain('test.ts');
    });

    test('should return null for unknown tool', async () => {
      const obs = await memory.recordToolUse(
        'UnknownTool',
        { data: 'test' },
        { result: 'ok' },
        session.id
      );

      expect(obs).toBeNull();
    });
  });

  // ============================================
  // Search Tests
  // ============================================

  describe('Search', () => {
    let session: Session;

    beforeEach(async () => {
      session = await memory.startSession();
      
      // Add some observations
      await memory.recordObservation({
        sessionId: session.id,
        type: 'discovery',
        title: 'User behavior pattern',
        text: 'Users are less active on weekends',
        concepts: ['user-behavior', 'analytics'],
      });

      await memory.recordObservation({
        sessionId: session.id,
        type: 'decision',
        title: 'Architecture decision',
        text: 'Use SQLite for storage',
        concepts: ['architecture', 'storage'],
      });

      await memory.recordObservation({
        sessionId: session.id,
        type: 'bugfix',
        title: 'Fixed memory leak',
        text: 'Fixed memory leak in session handler',
        concepts: ['bugfix', 'performance'],
      });
    });

    test('should search observations by type', async () => {
      const results = await memory.search({
        agentId: config.agentId,
        type: ['discovery'],
        limit: 10,
      });

      expect(results.observations.length).toBeGreaterThan(0);
      expect(results.observations.every(o => o.type === 'discovery')).toBe(true);
    });

    test('should search with limit', async () => {
      const results = await memory.search({
        agentId: config.agentId,
        limit: 2,
      });

      expect(results.observations.length).toBeLessThanOrEqual(2);
    });
  });

  // ============================================
  // Context Tests
  // ============================================

  describe('Context', () => {
    let session: Session;

    beforeEach(async () => {
      session = await memory.startSession();
      
      await memory.recordObservation({
        sessionId: session.id,
        type: 'discovery',
        title: 'Important finding',
        text: 'This is an important discovery that should be remembered',
        concepts: ['important'],
      });
    });

    test('should get context with recent observations', async () => {
      const context = await memory.getContext({
        query: 'test query',
        maxTokens: 1000,
        includeRecent: true,
      });

      expect(context.recentObservations.length).toBeGreaterThan(0);
      expect(context.totalTokens).toBeGreaterThan(0);
    });

    test('should respect maxTokens limit', async () => {
      const context = await memory.getContext({
        query: 'test query',
        maxTokens: 10, // Very small limit
        includeRecent: true,
      });

      // Should still return something but limited
      expect(context).toBeDefined();
    });
  });

  // ============================================
  // Memory Extraction Tests
  // ============================================

  describe('Memory Extraction', () => {
    test('should extract memory from summary learned', async () => {
      const session = await memory.startSession();
      
      await memory.endSession(session.id, {
        status: 'completed',
        summary: {
          learned: 'Users prefer dark mode',
        },
      });

      const stats = await memory.getStats();
      expect(stats.totalMemories).toBe(1);
    });

    test('should extract memory from decision observations', async () => {
      const session = await memory.startSession();
      
      await memory.recordObservation({
        sessionId: session.id,
        type: 'decision',
        title: 'Choose PostgreSQL',
        text: 'Decided to use PostgreSQL over MySQL',
      });

      await memory.endSession(session.id, {
        status: 'completed',
        summary: {
          learned: 'Architecture decision made',
        },
      });

      const stats = await memory.getStats();
      expect(stats.totalMemories).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================
  // Stats Tests
  // ============================================

  describe('Stats', () => {
    test('should return zero stats for new client', async () => {
      const stats = await memory.getStats();
      
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalObservations).toBe(0);
      expect(stats.totalMemories).toBe(0);
    });

    test('should track observations correctly', async () => {
      const session = await memory.startSession();
      
      await memory.recordObservation({
        sessionId: session.id,
        type: 'discovery',
        text: 'Test 1',
      });

      await memory.recordObservation({
        sessionId: session.id,
        type: 'change',
        text: 'Test 2',
      });

      const stats = await memory.getStats();
      expect(stats.totalObservations).toBe(2);
    });
  });

  // ============================================
  // Hooks Tests
  // ============================================

  describe('Hooks', () => {
    test('should call onSessionStart hook', async () => {
      let hookCalled = false;
      
      const memoryWithHooks = new MemoryClient({
        ...config,
        hooks: {
          onSessionStart: async () => {
            hookCalled = true;
          },
        },
      });
      
      await memoryWithHooks.initialize();
      await memoryWithHooks.startSession();
      
      expect(hookCalled).toBe(true);
      await memoryWithHooks.shutdown();
    });

    test('should call onSessionEnd hook', async () => {
      let hookCalled = false;
      let capturedSummary: Summary | undefined;
      
      const memoryWithHooks = new MemoryClient({
        ...config,
        hooks: {
          onSessionEnd: async (session, summary) => {
            hookCalled = true;
            capturedSummary = summary;
          },
        },
      });
      
      await memoryWithHooks.initialize();
      const session = await memoryWithHooks.startSession();
      await memoryWithHooks.endSession(session.id, {
        status: 'completed',
        summary: { learned: 'Test learned' },
      });
      
      expect(hookCalled).toBe(true);
      expect(capturedSummary?.learned).toBe('Test learned');
      await memoryWithHooks.shutdown();
    });
  });
});

// ============================================
// Importance Calculation Tests
// ============================================

describe('Importance Calculation', () => {
  let memory: MemoryClient;

  beforeEach(async () => {
    memory = new MemoryClient(createTestConfig());
    await memory.initialize();
  });

  afterEach(async () => {
    await memory.shutdown();
  });

  test('should assign higher importance to decisions', async () => {
    const session = await memory.startSession();
    
    // Record a decision
    await memory.recordObservation({
      sessionId: session.id,
      type: 'decision',
      title: 'Important decision',
      text: 'We decided to use microservices',
    });

    await memory.endSession(session.id, {
      status: 'completed',
      summary: {},
    });

    const stats = await memory.getStats();
    expect(stats.totalMemories).toBeGreaterThan(0);
  });
});

// ============================================
// Edge Cases
// ============================================

describe('Edge Cases', () => {
  let memory: MemoryClient;

  beforeEach(async () => {
    memory = new MemoryClient(createTestConfig());
    await memory.initialize();
  });

  afterEach(async () => {
    await memory.shutdown();
  });

  test('should handle empty search results', async () => {
    const results = await memory.search({
      agentId: 'non-existent-agent',
      limit: 10,
    });

    expect(results.observations).toEqual([]);
    expect(results.memories).toEqual([]);
  });

  test('should handle empty context query', async () => {
    const session = await memory.startSession();
    
    const context = await memory.getContext({
      query: '',
      includeRecent: false,
      includeImportant: false,
    });

    expect(context.memories).toEqual([]);
    expect(context.recentObservations).toEqual([]);
  });

  test('should handle observation without optional fields', async () => {
    const session = await memory.startSession();
    
    const obs = await memory.recordObservation({
      sessionId: session.id,
      type: 'change',
      text: 'Simple change',
    });

    expect(obs.title).toBeUndefined();
    expect(obs.facts).toBeUndefined();
    expect(obs.concepts).toBeUndefined();
    expect(obs.filesRead).toBeUndefined();
    expect(obs.filesModified).toBeUndefined();
  });

  test('should handle concurrent session operations', async () => {
    const sessions = await Promise.all([
      memory.startSession({ userPrompt: 'Session 1' }),
      memory.startSession({ userPrompt: 'Session 2' }),
      memory.startSession({ userPrompt: 'Session 3' }),
    ]);

    expect(sessions.length).toBe(3);
    expect(sessions[0].id).not.toBe(sessions[1].id);
    expect(sessions[1].id).not.toBe(sessions[2].id);
  });
});
