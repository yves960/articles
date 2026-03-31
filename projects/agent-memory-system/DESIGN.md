# Agent 记忆系统设计

> 基于 claude-mem 架构分析，设计一个可集成到任何产品的 Agent 记忆系统

---

## 1. 系统概述

### 1.1 核心目标

让 AI Agent 拥有**持久记忆**，跨会话保持上下文。

### 1.2 核心概念

| 概念 | 说明 |
|------|------|
| **Session** | 一次会话，从开始到结束 |
| **Observation** | 观察 = Agent 做了什么 + 学到了什么 |
| **Summary** | 会话总结，提炼关键信息 |
| **Memory** | 长期记忆，跨会话持久化 |

---

## 2. 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│                    (zoo / mood-diary / etc.)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Memory SDK (TypeScript)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ MemoryClient │  │   Hooks API  │  │  Search API  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Storage Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   SQLite     │  │   Chroma     │  │   File Store │          │
│  │  (元数据)    │  │  (向量搜索)  │  │  (原始数据)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型

### 3.1 Sessions 表

```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,        -- 会话 ID
  agent_id TEXT NOT NULL,                  -- Agent ID
  project TEXT NOT NULL,                   -- 项目/产品名
  user_prompt TEXT,                        -- 用户输入
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT DEFAULT 'active',            -- active/completed/failed
  metadata_json TEXT                       -- 扩展元数据
);
```

### 3.2 Observations 表

```sql
CREATE TABLE observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  
  -- 核心内容
  type TEXT NOT NULL,                      -- decision/bugfix/feature/discovery/change
  title TEXT,                              -- 简短标题
  text TEXT NOT NULL,                      -- 完整描述
  
  -- 结构化信息
  facts TEXT,                              -- JSON array: 事实列表
  concepts TEXT,                           -- JSON array: 涉及概念
  files_read TEXT,                         -- JSON array: 读取的文件
  files_modified TEXT,                     -- JSON array: 修改的文件
  
  -- 元数据
  prompt_number INTEGER,                   -- 第几轮对话
  tokens_used INTEGER,                     -- 消耗的 token
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- 全文搜索索引
CREATE VIRTUAL TABLE observations_fts USING fts5(
  title, text, facts, concepts,
  content='observations',
  content_rowid='id'
);
```

### 3.3 Summaries 表

```sql
CREATE TABLE summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  
  -- 结构化总结
  request TEXT,                            -- 用户请求是什么
  investigated TEXT,                       -- 调查了什么
  learned TEXT,                            -- 学到了什么
  completed TEXT,                          -- 完成了什么
  next_steps TEXT,                         -- 后续步骤
  
  -- 统计
  files_read TEXT,                         -- JSON array
  files_edited TEXT,                       -- JSON array
  total_tokens INTEGER,
  
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
```

### 3.4 Long-term Memories 表

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  
  -- 记忆内容
  text TEXT NOT NULL,
  embedding_id TEXT,                       -- Chroma 中的向量 ID
  
  -- 元数据
  importance REAL DEFAULT 0.5,             -- 重要性 0-1
  access_count INTEGER DEFAULT 0,          -- 访问次数
  last_accessed_at TEXT,
  decay_factor REAL DEFAULT 1.0,           -- 衰减因子
  
  -- 来源
  source_session_id TEXT,
  source_observation_id INTEGER,
  
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (source_session_id) REFERENCES sessions(session_id)
);

-- 索引
CREATE INDEX idx_memories_agent ON memories(agent_id);
CREATE INDEX idx_memories_importance ON memories(importance DESC);
CREATE INDEX idx_memories_last_accessed ON memories(last_accessed_at DESC);
```

---

## 4. SDK API 设计

### 4.1 初始化

```typescript
import { MemoryClient } from '@zoo/memory-sdk';

const memory = new MemoryClient({
  agentId: 'my-agent',
  projectId: 'zoo',
  storage: {
    type: 'sqlite',
    path: '~/.zoo/memory.db',
  },
  vector: {
    type: 'chroma',
    url: 'http://localhost:8000',
  },
});
```

### 4.2 会话管理

```typescript
// 开始会话
const session = await memory.startSession({
  userPrompt: '帮我分析用户行为数据',
  metadata: { source: 'slack' },
});

// 结束会话
await memory.endSession(session.id, {
  status: 'completed',
  summary: {
    request: '分析用户行为数据',
    learned: '发现用户活跃度在周末下降',
    nextSteps: '需要进一步调查原因',
  },
});
```

### 4.3 记录观察

```typescript
// 记录一个观察（Agent 做了什么）
await memory.recordObservation({
  sessionId: session.id,
  type: 'discovery',
  title: '发现用户行为模式',
  text: '分析发现用户在周末的活跃度明显下降，可能与工作日使用习惯有关',
  facts: [
    '周末活跃度下降 40%',
    '主要使用时段为工作日 9-18 点',
  ],
  concepts: ['用户行为', '活跃度分析', '时间模式'],
  filesRead: ['data/user_activity.csv'],
  tokensUsed: 1500,
});
```

### 4.4 搜索记忆

```typescript
// 搜索相关记忆
const results = await memory.search({
  query: '用户活跃度分析',
  limit: 10,
  filters: {
    type: ['discovery', 'feature'],
    dateRange: { start: '2026-01-01' },
  },
});

// 结果按相关性排序
for (const obs of results.observations) {
  console.log(`${obs.title}: ${obs.text}`);
}
```

### 4.5 注入上下文

```typescript
// 获取相关记忆作为上下文
const context = await memory.getContext({
  query: userPrompt,
  maxTokens: 2000,
  includeRecent: true,  // 包含最近的观察
  includeImportant: true, // 包含重要的长期记忆
});

// 注入到系统提示
const systemPrompt = `
## 相关历史记忆

${context.memories.map(m => `- ${m.text}`).join('\n')}

## 最近的观察

${context.recentObservations.map(o => `- [${o.type}] ${o.title}: ${o.text}`).join('\n')}
`;
```

---

## 5. Hooks 系统

### 5.1 生命周期 Hooks

```typescript
interface MemoryHooks {
  // 会话开始
  onSessionStart?: (session: Session) => Promise<void>;
  
  // 用户输入
  onUserPrompt?: (prompt: string, session: Session) => Promise<void>;
  
  // 工具调用后
  onToolUse?: (toolName: string, input: any, result: any, session: Session) => Promise<void>;
  
  // 会话结束
  onSessionEnd?: (session: Session, summary: Summary) => Promise<void>;
}
```

### 5.2 自动观察提取

```typescript
// 从工具调用中自动提取观察
function extractObservationFromToolUse(
  toolName: string,
  input: any,
  result: any
): Observation | null {
  switch (toolName) {
    case 'BashTool':
      if (result.exitCode === 0) {
        return {
          type: 'change',
          title: `执行命令: ${input.command}`,
          text: `成功执行命令: ${input.command}`,
          facts: [`命令: ${input.command}`, `退出码: ${result.exitCode}`],
        };
      }
      break;
      
    case 'FileWriteTool':
      return {
        type: 'change',
        title: `创建/修改文件: ${input.path}`,
        text: `修改了文件 ${input.path}`,
        filesModified: [input.path],
      };
      
    case 'FileEditTool':
      return {
        type: 'change',
        title: `编辑文件: ${input.path}`,
        text: `编辑了文件 ${input.path}: ${input.oldText} → ${input.newText}`,
        filesModified: [input.path],
      };
  }
  
  return null;
}
```

---

## 6. 记忆衰减与重要性

### 6.1 重要性计算

```typescript
function calculateImportance(observation: Observation): number {
  let score = 0.5;
  
  // 类型权重
  const typeWeights = {
    decision: 0.9,    // 决策最重要
    bugfix: 0.8,      // bug 修复次之
    feature: 0.7,     // 新功能
    discovery: 0.6,   // 发现
    change: 0.4,      // 普通修改
  };
  score = typeWeights[observation.type] || 0.5;
  
  // 访问次数加成
  score += Math.min(observation.accessCount * 0.05, 0.2);
  
  // 关联文件数量加成
  const filesCount = (observation.filesRead?.length || 0) + 
                     (observation.filesModified?.length || 0);
  score += Math.min(filesCount * 0.02, 0.1);
  
  return Math.min(score, 1.0);
}
```

### 6.2 时间衰减

```typescript
function applyDecay(memory: Memory, now: Date): number {
  const ageDays = (now.getTime() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  
  // 指数衰减: importance * e^(-decayRate * age)
  const decayRate = 0.1;  // 每 10 天衰减到 1/e
  const decayedScore = memory.importance * Math.exp(-decayRate * ageDays);
  
  // 访问次数可以减缓衰减
  const accessBoost = Math.min(memory.accessCount * 0.01, 0.2);
  
  return Math.min(decayedScore + accessBoost, 1.0);
}
```

---

## 7. 向量搜索集成

### 7.1 Chroma 集成

```typescript
import { ChromaClient } from 'chromadb';

class VectorStore {
  private client: ChromaClient;
  private collection: Collection;
  
  async initialize(agentId: string) {
    this.client = new ChromaClient();
    this.collection = await this.client.getOrCreateCollection({
      name: `agent-${agentId}`,
      metadata: { 'hnsw:space': 'cosine' },
    });
  }
  
  async addObservation(observation: Observation) {
    await this.collection.add({
      ids: [String(observation.id)],
      documents: [observation.text],
      metadatas: [{
        type: observation.type,
        title: observation.title,
        sessionId: observation.sessionId,
      }],
    });
  }
  
  async search(query: string, limit: number = 10) {
    const results = await this.collection.query({
      queryTexts: [query],
      nResults: limit,
    });
    
    return results.metadatas[0].map((meta, i) => ({
      id: results.ids[0][i],
      distance: results.distances[0][i],
      ...meta,
    }));
  }
}
```

---

## 8. 实现计划

### Phase 1: 核心 SDK (1-2 周)

- [ ] SQLite 数据模型
- [ ] MemoryClient API
- [ ] 基础搜索功能

### Phase 2: Hooks 集成 (1 周)

- [ ] 工具调用自动观察
- [ ] 会话生命周期管理

### Phase 3: 向量搜索 (1 周)

- [ ] Chroma 集成
- [ ] 语义搜索

### Phase 4: 高级功能 (2 周)

- [ ] 记忆衰减
- [ ] 重要性计算
- [ ] 上下文注入优化

---

## 9. 与产品集成

### 9.1 zoo (Agent 动物园)

```typescript
// 在 Agent 执行前后调用
const session = await memory.startSession({ agentId: agent.id });

// Agent 执行...

await memory.endSession(session.id, { summary });
```

### 9.2 mood-diary-wechat

```typescript
// 记住用户的情绪模式
await memory.recordObservation({
  type: 'discovery',
  title: '用户情绪模式',
  text: `用户在 ${day} 的情绪倾向为 ${mood}`,
  facts: [`情绪: ${mood}`, `触发因素: ${triggers}`],
});
```

---

*基于 claude-mem v10.6.3 架构分析*