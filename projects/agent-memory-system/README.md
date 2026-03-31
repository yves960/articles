# Agent Memory System

> 让 AI Agent 拥有持久记忆，跨会话保持上下文

## 核心特性

- **🧠 持久记忆** - SQLite 本地存储，数据完全可控
- **🔍 语义搜索** - Chroma 向量搜索支持（可选）
- **🔌 MCP 协议** - 支持 Model Context Protocol，可被 Claude Code 调用
- **📊 重要性衰减** - 自动管理记忆重要性，防止信息过载
- **🪝 Hooks 系统** - 支持会话生命周期的自定义扩展

## 快速开始

### 安装

```bash
bun add @zoo/memory-sdk
# 或者
npm install @zoo/memory-sdk
```

### 基础用法

```typescript
import { MemoryClient } from '@zoo/memory-sdk';

// 初始化
const memory = new MemoryClient({
  agentId: 'my-agent',
  projectId: 'my-project',
  storage: { type: 'sqlite', path: './memory.db' },
  vector: { type: 'none' },  // 使用 'chroma' 启用语义搜索
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

await memory.shutdown();
```

## 核心概念

### Session（会话）

一次完整的对话/任务执行周期。

### Observation（观察）

Agent 在会话中做了什么、学到了什么。

**类型：**
- `decision` - 重要决策
- `bugfix` - bug 修复
- `feature` - 新功能
- `discovery` - 发现/洞察
- `change` - 普通修改

### Summary（总结）

会话结束时的结构化总结。

### Memory（长期记忆）

从观察中提取的、跨会话持久化的重要信息。

## SDK API

### MemoryClient

```typescript
// 会话管理
startSession(input: StartSessionInput): Promise<Session>
endSession(sessionId: string, input: EndSessionInput): Promise<void>

// 观察
recordObservation(input: RecordObservationInput): Promise<Observation>
recordToolUse(toolName, input, result, sessionId?): Promise<Observation | null>

// 搜索
search(options: SearchOptions): Promise<SearchResult>
getContext(input: GetContextInput): Promise<ContextResult>

// 统计
getStats(): Promise<{ totalSessions, totalObservations, totalMemories }>
```

## CLI 工具

安装后可直接使用 CLI 查询和导出记忆：

```bash
# 查看统计
bun run src/cli/index.ts stats

# 搜索记忆
bun run src/cli/index.ts search "用户行为"

# 获取上下文
bun run src/cli/index.ts context "修复登录bug"

# 列出观察
bun run src/cli/index.ts observations --type discovery --limit 20

# 导出记忆
bun run src/cli/index.ts export > backup.json
```

## MCP Server

MCP Server 允许 Claude Code 通过 Model Context Protocol 调用记忆系统：

```bash
# 启动 MCP Server（stdio 模式）
AGENT_ID=my-agent bun run src/mcp/server.ts
```

### MCP Tools

- `memory_start_session` - 开始新会话
- `memory_end_session` - 结束会话
- `memory_record_observation` - 记录观察
- `memory_record_tool_use` - 记录工具使用
- `memory_search` - 搜索记忆
- `memory_get_context` - 获取上下文
- `memory_get_stats` - 获取统计

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

## Hooks 系统

```typescript
const memory = new MemoryClient({
  agentId: 'my-agent',
  projectId: 'my-project',
  storage: { type: 'sqlite', path: './memory.db' },
  hooks: {
    onSessionStart: async (session) => {
      console.log(`Session started: ${session.id}`);
    },
    onSessionEnd: async (session, summary) => {
      console.log(`Session ended: ${session.id}`);
      console.log(`Learned: ${summary.learned}`);
    },
    onToolUse: async (toolName, input, result, session) => {
      // 自动记录工具调用
      await memory.recordToolUse(toolName, input, result, session.id);
    },
  },
});
```

## 数据模型

### Sessions 表
- `id` - 会话 ID
- `agent_id` - Agent ID
- `project_id` - 项目 ID
- `user_prompt` - 用户输入
- `started_at` - 开始时间
- `completed_at` - 结束时间
- `status` - 状态 (active/completed/failed)

### Observations 表
- `id` - 观察 ID
- `session_id` - 会话 ID
- `type` - 类型 (decision/bugfix/feature/discovery/change)
- `title` - 标题
- `text` - 详细描述
- `facts` - 关键事实 (JSON array)
- `concepts` - 涉及概念 (JSON array)
- `files_read` - 读取的文件
- `files_modified` - 修改的文件

### Memories 表
- `id` - 记忆 ID
- `agent_id` - Agent ID
- `text` - 记忆内容
- `importance` - 重要性 (0-1)
- `access_count` - 访问次数
- `decay_factor` - 衰减因子

## 记忆衰减

记忆重要性会随时间衰减：

```typescript
// 衰减公式
decayedScore = importance * e^(-decayRate * age_days)

// 访问次数可以减缓衰减
accessBoost = min(accessCount * 0.01, 0.2)
```

可以通过增加 `access_count` 来强化重要记忆。

## 与产品集成

### zoo

```typescript
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
await memory.recordObservation({
  sessionId: session.id,
  type: 'discovery',
  title: '用户情绪模式',
  text: `用户在 ${day} 的情绪倾向为 ${mood}`,
  facts: [`情绪: ${mood}`, `触发因素: ${triggers}`],
  concepts: ['情绪分析', '用户画像'],
});
```

## 单元测试

```bash
bun test
bun test --watch  # watch 模式
```

## 开发

```bash
# 构建
bun run build

# 开发模式（watch）
bun run dev

# 运行示例
bun run example

# CLI
bun run cli stats

# MCP Server
bun run mcp
```

## 许可证

MIT
