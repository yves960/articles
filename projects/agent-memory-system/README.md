# Agent Memory System

> 让 AI Agent 拥有持久记忆，跨会话保持上下文

## 快速开始

### 安装

```bash
bun add @zoo/memory-sdk
```

### 基础用法

```typescript
import { MemoryClient } from '@zoo/memory-sdk';

// 初始化
const memory = new MemoryClient({
  agentId: 'my-agent',
  projectId: 'my-project',
  storage: { type: 'sqlite', path: './memory.db' },
});

await memory.initialize();

// 开始会话
const session = await memory.startSession({
  userPrompt: '帮我分析用户行为数据',
});

// 记录观察
await memory.recordObservation({
  sessionId: session.id,
  type: 'discovery',
  title: '发现用户行为模式',
  text: '用户在周末的活跃度明显下降',
  facts: ['周末活跃度下降 40%'],
  concepts: ['用户行为', '活跃度分析'],
});

// 结束会话
await memory.endSession(session.id, {
  status: 'completed',
  summary: {
    learned: '用户周末活跃度下降 40%',
  },
});

// 搜索记忆
const results = await memory.search({
  query: '用户活跃度',
  limit: 5,
});

// 获取上下文
const context = await memory.getContext({
  query: '如何提升周末活跃度',
  maxTokens: 2000,
});
```

## 核心概念

### Session（会话）

一次完整的对话/任务执行周期。

### Observation（观察）

Agent 在会话中做了什么、学到了什么。

类型：
- `decision` - 重要决策
- `bugfix` - bug 修复
- `feature` - 新功能
- `discovery` - 发现/洞察
- `change` - 普通修改

### Summary（总结）

会话结束时的结构化总结。

### Memory（长期记忆）

从观察中提取的、跨会话持久化的重要信息。

## 架构

```
┌─────────────────────────────────────────┐
│           Application Layer              │
│         (zoo / mood-diary / etc.)        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Memory SDK                     │
│  ┌────────────┐  ┌────────────┐         │
│  │  Client    │  │   Hooks    │         │
│  └────────────┘  └────────────┘         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           Storage Layer                  │
│  ┌────────────┐  ┌────────────┐         │
│  │   SQLite   │  │   Chroma   │         │
│  │  (元数据)  │  │ (向量搜索) │         │
│  └────────────┘  └────────────┘         │
└─────────────────────────────────────────┘
```

## API

### MemoryClient

```typescript
// 会话管理
startSession(input): Promise<Session>
endSession(sessionId, input): Promise<void>

// 观察
recordObservation(input): Promise<Observation>
recordToolUse(toolName, input, result, sessionId?): Promise<Observation | null>

// 搜索
search(options): Promise<SearchResult>
getContext(input): Promise<ContextResult>

// 统计
getStats(): Promise<Stats>
```

### Hooks

```typescript
interface MemoryHooks {
  onSessionStart?: (session) => Promise<void>;
  onUserPrompt?: (prompt, session) => Promise<void>;
  onToolUse?: (toolName, input, result, session) => Promise<void>;
  onSessionEnd?: (session, summary) => Promise<void>;
}
```

## 与产品集成

### zoo

```typescript
// 在 Agent 执行前后
const session = await memory.startSession({ 
  agentId: agent.id,
  userPrompt: task.description,
});

// Agent 执行过程中自动记录工具调用
await memory.recordToolUse('bash', input, result);

// 执行结束后总结
await memory.endSession(session.id, { 
  status: 'completed',
  summary: { learned: result.insights },
});
```

### mood-diary-wechat

```typescript
// 记住用户的情绪模式
await memory.recordObservation({
  sessionId: session.id,
  type: 'discovery',
  title: '用户情绪模式',
  text: `用户在 ${day} 的情绪倾向为 ${mood}`,
  facts: [`情绪: ${mood}`, `触发因素: ${triggers}`],
  concepts: ['情绪分析', '用户画像'],
});
```

## 许可证

MIT