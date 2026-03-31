/**
 * Agent Memory System - Memory Store
 * 
 * 存储层抽象，支持 SQLite 和内存存储
 */

import type {
  StorageConfig,
  Session,
  Observation,
  Summary,
  Memory,
  SearchOptions,
} from '../index.js';

export class MemoryStore {
  private config: StorageConfig;
  private db: any;  // Bun.SQLite or in-memory store
  
  // In-memory fallback
  private sessions: Map<string, Session> = new Map();
  private observations: Map<string, Observation> = new Map();
  private summaries: Map<string, Summary> = new Map();
  private memories: Map<string, Memory> = new Map();
  
  constructor(config: StorageConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    if (this.config.type === 'sqlite') {
      await this.initializeSQLite();
    }
    // Memory store needs no initialization
  }
  
  private async initializeSQLite(): Promise<void> {
    try {
      const { Database } = await import('bun:sqlite');
      const path = this.config.path || ':memory:';
      this.db = new Database(path);
      
      // Create tables
      this.db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          agent_id TEXT NOT NULL,
          project_id TEXT NOT NULL,
          user_prompt TEXT,
          started_at TEXT NOT NULL,
          completed_at TEXT,
          status TEXT DEFAULT 'active',
          metadata_json TEXT
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS observations (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          agent_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT,
          text TEXT NOT NULL,
          facts TEXT,
          concepts TEXT,
          files_read TEXT,
          files_modified TEXT,
          prompt_number INTEGER,
          tokens_used INTEGER,
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS summaries (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          agent_id TEXT NOT NULL,
          request TEXT,
          investigated TEXT,
          learned TEXT,
          completed TEXT,
          next_steps TEXT,
          files_read TEXT,
          files_edited TEXT,
          total_tokens INTEGER,
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          agent_id TEXT NOT NULL,
          text TEXT NOT NULL,
          embedding_id TEXT,
          importance REAL DEFAULT 0.5,
          access_count INTEGER DEFAULT 0,
          last_accessed_at TEXT,
          decay_factor REAL DEFAULT 1.0,
          source_session_id TEXT,
          source_observation_id TEXT,
          created_at TEXT NOT NULL
        )
      `);
      
      // Create indexes
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_observations_agent ON observations(agent_id)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id)`);
      this.db.run(`CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance DESC)`);
      
      console.log('✅ SQLite database initialized');
    } catch (error) {
      console.warn('Failed to initialize SQLite, falling back to in-memory store:', error);
      this.config.type = 'memory';
    }
  }
  
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
  }
  
  // ============================================
  // Sessions
  // ============================================
  
  async createSession(session: Session): Promise<void> {
    if (this.db) {
      this.db.run(`
        INSERT INTO sessions (id, agent_id, project_id, user_prompt, started_at, status, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        session.id,
        session.agentId,
        session.projectId,
        session.userPrompt || null,
        session.startedAt.toISOString(),
        session.status,
        session.metadata ? JSON.stringify(session.metadata) : null,
      ]);
    } else {
      this.sessions.set(session.id, session);
    }
  }
  
  async getSession(id: string): Promise<Session | null> {
    if (this.db) {
      const row = this.db.query(`SELECT * FROM sessions WHERE id = ?`).get(id);
      if (!row) return null;
      return this.rowToSession(row);
    } else {
      return this.sessions.get(id) || null;
    }
  }
  
  async updateSession(session: Session): Promise<void> {
    if (this.db) {
      this.db.run(`
        UPDATE sessions 
        SET completed_at = ?, status = ?
        WHERE id = ?
      `, [
        session.completedAt?.toISOString() || null,
        session.status,
        session.id,
      ]);
    } else {
      this.sessions.set(session.id, session);
    }
  }
  
  // ============================================
  // Observations
  // ============================================
  
  async createObservation(observation: Observation): Promise<void> {
    if (this.db) {
      this.db.run(`
        INSERT INTO observations (
          id, session_id, agent_id, type, title, text, 
          facts, concepts, files_read, files_modified, 
          prompt_number, tokens_used, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        observation.id,
        observation.sessionId,
        observation.agentId,
        observation.type,
        observation.title || null,
        observation.text,
        observation.facts ? JSON.stringify(observation.facts) : null,
        observation.concepts ? JSON.stringify(observation.concepts) : null,
        observation.filesRead ? JSON.stringify(observation.filesRead) : null,
        observation.filesModified ? JSON.stringify(observation.filesModified) : null,
        observation.promptNumber || null,
        observation.tokensUsed || null,
        observation.createdAt.toISOString(),
      ]);
    } else {
      this.observations.set(observation.id, observation);
    }
  }
  
  async getSessionObservations(sessionId: string): Promise<Observation[]> {
    if (this.db) {
      const rows = this.db.query(`SELECT * FROM observations WHERE session_id = ? ORDER BY created_at`).all(sessionId);
      return rows.map(this.rowToObservation);
    } else {
      return Array.from(this.observations.values())
        .filter(o => o.sessionId === sessionId);
    }
  }
  
  async getRecentObservations(agentId: string, limit: number = 10): Promise<Observation[]> {
    if (this.db) {
      const rows = this.db.query(`
        SELECT * FROM observations 
        WHERE agent_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `).all(agentId, limit);
      return rows.map(this.rowToObservation);
    } else {
      return Array.from(this.observations.values())
        .filter(o => o.agentId === agentId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }
  }
  
  async searchObservations(options: SearchOptions): Promise<Observation[]> {
    if (this.db) {
      // Simple LIKE search for now
      let sql = `SELECT * FROM observations WHERE agent_id = ?`;
      const params: any[] = [options.agentId];
      
      if (options.type) {
        const types = Array.isArray(options.type) ? options.type : [options.type];
        sql += ` AND type IN (${types.map(() => '?').join(',')})`;
        params.push(...types);
      }
      
      sql += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(options.limit || 10);
      
      const rows = this.db.query(sql).all(...params);
      return rows.map(this.rowToObservation);
    } else {
      let results = Array.from(this.observations.values())
        .filter(o => o.agentId === options.agentId);
      
      if (options.type) {
        const types = Array.isArray(options.type) ? options.type : [options.type];
        results = results.filter(o => types.includes(o.type));
      }
      
      return results
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, options.limit || 10);
    }
  }
  
  // ============================================
  // Summaries
  // ============================================
  
  async createSummary(summary: Summary): Promise<void> {
    if (this.db) {
      this.db.run(`
        INSERT INTO summaries (
          id, session_id, agent_id, request, investigated, learned,
          completed, next_steps, files_read, files_edited, total_tokens, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        summary.id,
        summary.sessionId,
        summary.agentId,
        summary.request || null,
        summary.investigated || null,
        summary.learned || null,
        summary.completed || null,
        summary.nextSteps || null,
        summary.filesRead ? JSON.stringify(summary.filesRead) : null,
        summary.filesEdited ? JSON.stringify(summary.filesEdited) : null,
        summary.totalTokens || null,
        summary.createdAt.toISOString(),
      ]);
    } else {
      this.summaries.set(summary.id, summary);
    }
  }
  
  async getSummary(sessionId: string): Promise<Summary | null> {
    if (this.db) {
      const row = this.db.query(`SELECT * FROM summaries WHERE session_id = ?`).get(sessionId);
      if (!row) return null;
      return this.rowToSummary(row);
    } else {
      return Array.from(this.summaries.values())
        .find(s => s.sessionId === sessionId) || null;
    }
  }
  
  // ============================================
  // Memories
  // ============================================
  
  async createMemory(memory: Memory): Promise<void> {
    if (this.db) {
      this.db.run(`
        INSERT INTO memories (
          id, agent_id, text, embedding_id, importance, access_count,
          last_accessed_at, decay_factor, source_session_id, source_observation_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        memory.id,
        memory.agentId,
        memory.text,
        memory.embeddingId || null,
        memory.importance,
        memory.accessCount,
        memory.lastAccessedAt?.toISOString() || null,
        memory.decayFactor,
        memory.sourceSessionId || null,
        memory.sourceObservationId || null,
        memory.createdAt.toISOString(),
      ]);
    } else {
      this.memories.set(memory.id, memory);
    }
  }
  
  async updateMemory(memory: Memory): Promise<void> {
    if (this.db) {
      this.db.run(`
        UPDATE memories 
        SET embedding_id = ?, importance = ?, access_count = ?, last_accessed_at = ?
        WHERE id = ?
      `, [
        memory.embeddingId || null,
        memory.importance,
        memory.accessCount,
        memory.lastAccessedAt?.toISOString() || null,
        memory.id,
      ]);
    } else {
      this.memories.set(memory.id, memory);
    }
  }
  
  async getMemory(id: string): Promise<Memory | null> {
    if (this.db) {
      const row = this.db.query(`SELECT * FROM memories WHERE id = ?`).get(id);
      if (!row) return null;
      return this.rowToMemory(row);
    } else {
      return this.memories.get(id) || null;
    }
  }
  
  async getImportantMemories(agentId: string, threshold: number = 0.7): Promise<Memory[]> {
    if (this.db) {
      const rows = this.db.query(`
        SELECT * FROM memories 
        WHERE agent_id = ? AND importance >= ?
        ORDER BY importance DESC
        LIMIT 10
      `).all(agentId, threshold);
      return rows.map(this.rowToMemory);
    } else {
      return Array.from(this.memories.values())
        .filter(m => m.agentId === agentId && m.importance >= threshold)
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10);
    }
  }
  
  async searchMemories(options: SearchOptions): Promise<Memory[]> {
    if (this.db) {
      const rows = this.db.query(`
        SELECT * FROM memories 
        WHERE agent_id = ?
        ORDER BY importance DESC
        LIMIT ?
      `).all(options.agentId, options.limit || 10);
      return rows.map(this.rowToMemory);
    } else {
      return Array.from(this.memories.values())
        .filter(m => m.agentId === options.agentId)
        .sort((a, b) => b.importance - a.importance)
        .slice(0, options.limit || 10);
    }
  }
  
  // ============================================
  // Stats
  // ============================================
  
  async getStats(agentId: string): Promise<{
    totalSessions: number;
    totalObservations: number;
    totalMemories: number;
  }> {
    if (this.db) {
      const sessions = this.db.query(`SELECT COUNT(*) as count FROM sessions WHERE agent_id = ?`).get(agentId);
      const observations = this.db.query(`SELECT COUNT(*) as count FROM observations WHERE agent_id = ?`).get(agentId);
      const memories = this.db.query(`SELECT COUNT(*) as count FROM memories WHERE agent_id = ?`).get(agentId);
      
      return {
        totalSessions: sessions.count,
        totalObservations: observations.count,
        totalMemories: memories.count,
      };
    } else {
      return {
        totalSessions: Array.from(this.sessions.values()).filter(s => s.agentId === agentId).length,
        totalObservations: Array.from(this.observations.values()).filter(o => o.agentId === agentId).length,
        totalMemories: Array.from(this.memories.values()).filter(m => m.agentId === agentId).length,
      };
    }
  }
  
  // ============================================
  // Row Mappers
  // ============================================
  
  private rowToSession(row: any): Session {
    return {
      id: row.id,
      agentId: row.agent_id,
      projectId: row.project_id,
      userPrompt: row.user_prompt || undefined,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      status: row.status,
      metadata: row.metadata_json ? JSON.parse(row.metadata_json) : undefined,
    };
  }
  
  private rowToObservation(row: any): Observation {
    return {
      id: row.id,
      sessionId: row.session_id,
      agentId: row.agent_id,
      type: row.type,
      title: row.title || undefined,
      text: row.text,
      facts: row.facts ? JSON.parse(row.facts) : undefined,
      concepts: row.concepts ? JSON.parse(row.concepts) : undefined,
      filesRead: row.files_read ? JSON.parse(row.files_read) : undefined,
      filesModified: row.files_modified ? JSON.parse(row.files_modified) : undefined,
      promptNumber: row.prompt_number || undefined,
      tokensUsed: row.tokens_used || undefined,
      createdAt: new Date(row.created_at),
    };
  }
  
  private rowToSummary(row: any): Summary {
    return {
      id: row.id,
      sessionId: row.session_id,
      agentId: row.agent_id,
      request: row.request || undefined,
      investigated: row.investigated || undefined,
      learned: row.learned || undefined,
      completed: row.completed || undefined,
      nextSteps: row.next_steps || undefined,
      filesRead: row.files_read ? JSON.parse(row.files_read) : undefined,
      filesEdited: row.files_edited ? JSON.parse(row.files_edited) : undefined,
      totalTokens: row.total_tokens || undefined,
      createdAt: new Date(row.created_at),
    };
  }
  
  private rowToMemory(row: any): Memory {
    return {
      id: row.id,
      agentId: row.agent_id,
      text: row.text,
      embeddingId: row.embedding_id || undefined,
      importance: row.importance,
      accessCount: row.access_count,
      lastAccessedAt: row.last_accessed_at ? new Date(row.last_accessed_at) : undefined,
      decayFactor: row.decay_factor,
      sourceSessionId: row.source_session_id || undefined,
      sourceObservationId: row.source_observation_id || undefined,
      createdAt: new Date(row.created_at),
    };
  }
}