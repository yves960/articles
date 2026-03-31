# 多 Agent 协作系统设计文档

**产品**: zoo (Agent 动物园)  
**技术参考**: claude-mem, OpenClaw, oh-my-claudecode  
**日期**: 2026-03-31

---

## 🎯 产品目标

实现多个 Agent 的协同工作机制：
1. 任务分解 + 派发
2. 共享上下文
3. 结果汇总
4. 进度可视化

---

## 🔧 核心架构

### 1. Orchestrator（编排器）

```typescript
interface Orchestrator {
  // 任务管理
  createTask(request: TaskRequest): Task;
  decomposeTask(task: Task): SubTask[];
  
  // Agent 派发
  assignAgent(subtask: SubTask, agent: AgentProfile): Assignment;
  
  // 进度跟踪
  trackProgress(taskId: string): TaskProgress;
  
  // 结果汇总
  aggregateResults(taskId: string): FinalResult;
}
```

### 2. Agent Pool（资源池）

```typescript
interface AgentPool {
  // Agent 注册
  registerAgent(profile: AgentProfile): void;
  unregisterAgent(agentId: string): void;
  
  // Agent 选择
  findBestAgent(requirements: AgentRequirements): AgentProfile[];
  
  // 状态管理
  getAgentStatus(agentId: string): AgentStatus;
  setAgentBusy(agentId: string, taskId: string): void;
}
```

### 3. Shared Context（共享上下文）

```typescript
interface SharedContext {
  // 上下文存储
  set(key: string, value: any, scope: 'task' | 'session'): void;
  get(key: string): any;
  
  // 变更广播
  broadcastChange(key: string, value: any): void;
  
  // 版本管理
  getVersion(key: string): number;
  getHistory(key: string): ContextChange[];
}
```

---

## 📊 数据模型

### Task 层级

```typescript
interface TaskRequest {
  type: 'code' | 'research' | 'analysis' | 'creative' | 'mixed';
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  deadline?: Date;
  constraints?: TaskConstraints;
}

interface Task {
  id: string;
  request: TaskRequest;
  
  // 分解后的子任务
  subtasks: SubTask[];
  
  // 执行状态
  status: 'pending' | 'decomposed' | 'running' | 'completed' | 'failed';
  progress: number;  // 0-100
  
  // Agent 分配
  assignments: Assignment[];
  
  // 共享上下文
  sharedContext: SharedContext;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface SubTask {
  id: string;
  parentTaskId: string;
  
  // 任务定义
  type: string;
  description: string;
  inputRequirements: string[];  // 需要的上下文
  outputKeys: string[];         // 产出的上下文
  
  // 执行状态
  status: 'pending' | 'waiting_input' | 'running' | 'completed' | 'failed';
  assignedAgent?: string;
  
  // 结果
  result?: SubTaskResult;
  
  // 依赖
  dependencies: string[];  // 依赖的 subtask IDs
}

interface SubTaskResult {
  success: boolean;
  output: any;
  observations?: Observation[];  // Agent 行为记录
  metrics?: {
    duration: number;
    tokensUsed?: number;
    apiCalls?: number;
  };
}

interface Assignment {
  subtaskId: string;
  agentId: string;
  assignedAt: Date;
  status: 'assigned' | 'accepted' | 'rejected' | 'completed';
}
```

### Agent Profile

```typescript
interface AgentProfile {
  id: string;
  name: string;
  role: string;  // 'dev' | 'pm' | 'designer' | 'researcher' | 'reviewer'
  
  // 能力定义
  capabilities: {
    types: string[];          // 可处理的任务类型
    tools: string[];          // 可使用的工具
    maxConcurrent: number;    // 最大并发任务数
  };
  
  // 性能指标
  performance: {
    avgCompletionTime: number;
    successRate: number;
    specialties: string[];    // 擅长的领域
  };
  
  // 状态
  status: 'idle' | 'busy' | 'offline';
  currentTasks: string[];
}
```

---

## 🔄 执行流程

### Phase 1: 任务分解

```typescript
async function decomposeTask(task: Task): SubTask[] {
  // 1. 分析任务类型和复杂度
  const analysis = await analyzeComplexity(task.request);
  
  // 2. 生成分解方案
  if (analysis.canParallelize) {
    // 可并行 → 拆分独立子任务
    return generateParallelSubtasks(task);
  } else {
    // 需串行 → 按依赖关系拆分
    return generateSequentialSubtasks(task);
  }
}
```

### Phase 2: Agent 派发

```typescript
async function assignAgents(subtasks: SubTask[], pool: AgentPool): Assignment[] {
  const assignments: Assignment[] = [];
  
  for (const subtask of subtasks) {
    // 1. 检查依赖是否满足
    if (!dependenciesMet(subtask)) {
      continue;  // 等待依赖完成
    }
    
    // 2. 找最佳 Agent
    const candidates = pool.findBestAgent({
      taskType: subtask.type,
      requiredTools: subtask.requiredTools,
      availability: true,
    });
    
    // 3. 选择最优者
    const best = selectBestAgent(candidates, subtask);
    
    // 4. 派发任务
    const assignment = await dispatchTask(subtask, best);
    assignments.push(assignment);
  }
  
  return assignments;
}
```

### Phase 3: 执行监控

```typescript
async function monitorExecution(taskId: string): TaskProgress {
  const task = await getTask(taskId);
  
  // 收集各子任务进度
  const subtaskProgress = await Promise.all(
    task.subtasks.map(st => getSubtaskProgress(st.id))
  );
  
  // 计算总进度
  const totalProgress = calculateOverallProgress(subtaskProgress);
  
  // 检测阻塞
  const blockers = detectBlockers(task);
  
  return {
    taskId,
    overallProgress: totalProgress,
    subtaskProgress,
    blockers,
    estimatedTimeRemaining: estimateCompletion(task, subtaskProgress),
  };
}
```

### Phase 4: 结果汇总

```typescript
async function aggregateResults(taskId: string): FinalResult {
  const task = await getTask(taskId);
  
  // 1. 收集所有子任务结果
  const results = task.subtasks
    .filter(st => st.status === 'completed')
    .map(st => st.result);
  
  // 2. 合并输出
  const mergedOutput = mergeOutputs(results);
  
  // 3. 生成总结
  const summary = await generateSummary(mergedOutput, task.request);
  
  // 4. 记录到 Memory System
  await memoryClient.recordSession({
    taskId,
    observations: collectObservations(results),
    summary,
  });
  
  return {
    taskId,
    success: true,
    output: mergedOutput,
    summary,
    metrics: aggregateMetrics(results),
  };
}
```

---

## 🎮 用户界面设计

### 任务进度可视化

```
┌─────────────────────────────────────────────────┐
│ 📋 Task: "实现语音日记功能"                       │
│                                                 │
│ Progress: ████████████░░░░░░░░ 60%              │
│ ETA: ~5 分钟                                    │
│                                                 │
│ Subtasks:                                       │
│ ✅ 调研 VibeVoice           [艾克]  2min        │
│ ✅ 设计数据结构             [金克丝] 1min        │
│ 🔄 实现 ASR 集成            [艾克]  🔄 进行中    │
│ ⏳ 添加情感分析              [凯特琳] ⏳ 等待     │
│ ⏳ 编写测试                 [艾克]   ⏳ 等待     │
│                                                 │
│ Shared Context:                                 │
│ 📦 vibevoice-api-key: 已设置                    │
│ 📦 design-doc: projects/voice-diary/DESIGN.md  │
│                                                 │
│ 📊 Active Agents:                              │
│ 🟢 艾克 (dev) - 1 task                          │
│ 🟡 金克丝 (pm) - idle                           │
│ 🔵 凯特琳 (devops) - waiting                     │
└─────────────────────────────────────────────────┘
```

### Agent 通信

```typescript
interface AgentMessage {
  from: string;   // 发送 Agent
  to: string;     // 接收 Agent（或 'broadcast'）
  type: 'request' | 'response' | 'update' | 'error';
  content: any;
  timestamp: Date;
}

// 示例：艾克请求设计文档
{
  from: 'dev-ekko',
  to: 'pm-jinx',
  type: 'request',
  content: {
    request: 'get-design-doc',
    taskId: 'voice-diary-mvp',
  },
}

// 金克丝响应
{
  from: 'pm-jinx',
  to: 'dev-ekko',
  type: 'response',
  content: {
    docUrl: 'projects/voice-diary/DESIGN.md',
    keyPoints: ['VibeVoice-ASR', 'EmotionAnalysis', 'UserVoiceProfile'],
  },
}
```

---

## 🔗 与现有系统集成

### 1. Agent Memory System

```typescript
// 每个 Agent 执行子任务时记录行为
const memoryClient = new MemoryClient({
  agentId: agent.id,
  sessionId: task.id,
});

// 自动注入相关记忆
const relevantMemories = await memoryClient.search({
  query: subtask.description,
  limit: 5,
});

// 任务完成后记录
await memoryClient.endSession({
  summary: subtask.result.output,
  metrics: subtask.result.metrics,
});
```

### 2. OpenClaw Sessions

```typescript
// 使用 OpenClaw 的 sessions_spawn 派发子任务
const result = await sessions_spawn({
  runtime: 'subagent',
  agentId: agent.id,
  task: subtask.description,
  context: {
    taskId: task.id,
    sharedContext: task.sharedContext.getRelevant(subtask),
  },
});
```

---

## 🚀 实施路径

### Phase 1: 基础编排（3 天）

- TaskRequest → Task → SubTask 数据结构
- 简单任务分解（基于类型）
- Agent Pool 管理
- 基础派发机制

### Phase 2: 共享上下文（2 天）

- SharedContext 实现
- 变更广播机制
- 版本管理

### Phase 3: 进度监控（2 天）

- TaskProgress 实时更新
- 阻塞检测
- ETA 估算
- UI 可视化

### Phase 4: 高级功能（1 周）

- 智能任务分解（AI 驱动）
- Agent 选择优化
- 失败重试机制
- 结果质量评估

---

## 💡 后续扩展

1. **Agent 市场**: 用户可发布/订阅自定义 Agent
2. **工作流模板**: 预定义的任务分解模板
3. **跨会话协作**: 长期项目的 Agent 协作
4. **人机协作**: 用户可介入特定子任务

---

## 🔧 技术栈

- **存储**: SQLite + Chroma（向量搜索）
- **消息**: Event-driven（类似 claude-mem）
- **派发**: OpenClaw sessions_spawn
- **UI**: React + WebSocket 实时更新