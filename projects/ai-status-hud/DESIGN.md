# AI 状态可视化设计文档

**产品**: 所有产品  
**技术参考**: Claude HUD  
**日期**: 2026-03-31

---

## 🎯 产品目标

让用户实时了解 AI 正在做什么：
1. 显示正在使用的工具/API
2. 进度条 + 预计剩余时间
3. Token/上下文使用情况
4. 多 Agent 任务时显示各 Agent 状态

---

## 🔧 核心组件

### 1. Status Bar（状态栏）

```typescript
interface AIStatusBar {
  // 当前状态
  currentAction: string;        // "正在读取文件..." / "正在调用 API..."
  currentTool?: string;         // 正在使用的工具
  
  // 进度
  progress?: number;            // 0-100
  estimatedTime?: number;       // 预计剩余秒数
  
  // 资源使用
  tokensUsed: number;
  tokensLimit: number;
  contextUsed: number;          // 百分比
  
  // Agent 状态（多 Agent 时）
  agents?: AgentStatus[];
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting';
  currentTask?: string;
  progress?: number;
}
```

### 2. Activity Timeline（活动时间线）

```typescript
interface ActivityTimeline {
  entries: ActivityEntry[];
  maxEntries: number;           // 显示的最大条数
}

interface ActivityEntry {
  id: string;
  timestamp: Date;
  type: 'tool_call' | 'api_request' | 'file_read' | 'file_write' | 'thinking' | 'decision';
  
  // 内容
  tool?: string;
  input?: any;
  result?: any;
  duration?: number;            // 毫秒
  
  // 可视化
  icon: string;                 // emoji 或图标
  color: string;                // 颜色指示（成功/失败/进行中）
}
```

### 3. Progress Indicator（进度指示器）

```typescript
interface ProgressIndicator {
  // 任务信息
  taskId: string;
  taskName: string;
  
  // 进度
  phase: 'init' | 'decompose' | 'execute' | 'aggregate' | 'complete';
  phaseProgress: number;        // 当前阶段进度
  overallProgress: number;      // 总进度
  
  // 子任务（Multi-Agent）
  subtasks?: SubtaskProgress[];
  
  // 时间
  elapsed: number;              // 已用时间（秒）
  estimatedRemaining: number;   // 预计剩余
}

interface SubtaskProgress {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  agent?: string;
  progress: number;
}
```

---

## 📊 UI 设计

### 状态栏（紧凑模式）

```
┌─────────────────────────────────────────────────────┐
│ 🤖 AI 状态                                          │
│                                                     │
│ 🔄 正在: 编辑文件 MemoryClient.ts                   │
│ 📊 进度: ████████░░░░░░░░ 53%  ~30s               │
│ 💾 Token: 12,340 / 32,000 (39%)                    │
│                                                     │
│ [展开详情 ▼]                                        │
└─────────────────────────────────────────────────────┘
```

### 状态栏（展开模式 + Multi-Agent）

```
┌─────────────────────────────────────────────────────┐
│ 🤖 AI 状态 - 任务: "实现语音日记"                    │
│                                                     │
│ 总进度: ████████████░░░░░░░░ 60%  ~5min            │
│                                                     │
│ 📋 阶段: 执行中                                     │
│   ✅ 分析 (艾克) - 2min                             │
│   ✅ 设计 (金克丝) - 1min                           │
│   🔄 实现 (艾克) - 进行中 53%                       │
│   ⏳ 测试 (凯特琳) - 等待                            │
│                                                     │
│ ───────────────────────────────────────────────────│
│ 🕐 最近活动:                                        │
│   22:03 ✅ read DESIGN.md (1.2s)                   │
│   22:04 ✅ edit MemoryClient.ts (3.5s)             │
│   22:05 🔄 exec bun test (running...)              │
│                                                     │
│ 💾 资源使用:                                        │
│   Token: 12,340 / 32,000                            │
│   Context: 45%                                      │
│   API 调用: 8                                       │
│                                                     │
│ [收起 ▲]                                            │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 数据源

### 从 Agent Memory System 获取

```typescript
// 实时订阅 Agent 活动
const memoryClient = new MemoryClient(config);

memoryClient.on('observation', (obs) => {
  statusBar.update({
    currentAction: `${obs.type}: ${obs.title}`,
    currentTool: obs.toolUsed,
  });
  
  timeline.add({
    type: obs.type,
    tool: obs.toolUsed,
    input: obs.input,
    result: obs.result,
    duration: obs.duration,
  });
});
```

### 从 Multi-Agent Orchestrator 获取

```typescript
// 实时进度更新
const orchestrator = new Orchestrator(config);

orchestrator.on('progress', (progress) => {
  progressIndicator.update({
    overallProgress: progress.overallProgress,
    subtasks: progress.subtaskProgress,
    estimatedRemaining: progress.estimatedTimeRemaining,
  });
  
  // 更新 Agent 状态
  statusBar.update({
    agents: progress.subtaskProgress.map(st => ({
      id: st.agentId,
      status: st.status === 'running' ? 'executing' : 'idle',
      currentTask: st.subtaskId,
      progress: st.progress,
    })),
  });
});
```

---

## 🎮 交互设计

### 用户操作

| 操作 | 效果 |
|------|------|
| 点击状态栏 | 展开/收起详情 |
| 点击活动条目 | 显示完整输入/输出 |
| 点击 Agent | 查看 Agent 详细状态 |
| 悬停进度条 | 显示时间估算详情 |

### 自动行为

| 事件 | 效果 |
|------|------|
| 任务开始 | 显示状态栏 |
| 长时间操作 (>5s) | 自动展开详情 |
| 任务完成 | 显示总结 + 3s 后收起 |
| 错误发生 | 高亮显示 + 保持展开 |

---

## 🔄 实现架构

### 实时更新机制

```typescript
class AIStatusHUD {
  private statusBar: AIStatusBar;
  private timeline: ActivityTimeline;
  private progress: ProgressIndicator;
  
  // 数据源订阅
  private subscriptions: Subscription[] = [];
  
  constructor(config: HUDConfig) {
    // 初始化组件
    this.statusBar = new StatusBarComponent();
    this.timeline = new TimelineComponent();
    this.progress = new ProgressComponent();
    
    // 订阅数据源
    this.connectToMemorySystem(config.memoryClient);
    this.connectToOrchestrator(config.orchestrator);
  }
  
  // 从 Memory System 获取实时活动
  private connectToMemorySystem(client: MemoryClient) {
    this.subscriptions.push(
      client.subscribe('observation', (obs) => {
        this.onObservation(obs);
      })
    );
  }
  
  // 从 Orchestrator 获取进度
  private connectToOrchestrator(orch: Orchestrator) {
    this.subscriptions.push(
      orch.subscribe('progress', (p) => {
        this.onProgress(p);
      })
    );
  }
  
  // 更新状态栏
  update(data: Partial<AIStatusBar>): void {
    this.statusBar.update(data);
    this.render();
  }
  
  // 添加活动记录
  addActivity(entry: ActivityEntry): void {
    this.timeline.add(entry);
    if (this.timeline.entries.length > this.timeline.maxEntries) {
      this.timeline.entries.shift();
    }
    this.render();
  }
  
  // 渲染 UI
  render(): void {
    // 输出到目标（终端/网页/WebSocket）
    this.output(this.statusBar, this.timeline, this.progress);
  }
}
```

---

## 🚀 实施路径

### Phase 1: 基础 HUD（2 天）

- Status Bar 组件
- Activity Timeline
- 基础渲染（终端输出）
- Memory System 集成

### Phase 2: Multi-Agent 支持（1 天）

- Progress Indicator
- Agent 状态显示
- Orchestrator 集成

### Phase 3: Web UI（2 天）

- React 组件
- WebSocket 实时推送
- 交互功能

### Phase 4: 高级功能（1 周）

- 历史记录查看
- 活动搜索
- 导出报告
- 自定义主题

---

## 💡 后续扩展

1. **桌面通知**: 关键事件时发送通知
2. **语音播报**: AI 状态变化时语音提示
3. **性能分析**: 自动分析耗时操作
4. **智能建议**: 根据历史提供优化建议