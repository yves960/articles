# AI Status HUD

实时显示 AI 工作状态的可视化组件。

## 功能

- 📊 **状态栏**: 显示当前动作、进度、Token 使用
- 🕐 **活动时间线**: 记录最近操作历史
- 📈 **进度指示器**: 多 Agent 任务进度可视化
- 👥 **Agent 状态**: 显示各 Agent 工作状态

## 快速开始

```typescript
import { AIStatusHUD } from 'ai-status-hud';

const hud = new AIStatusHUD({
  maxTimelineEntries: 10,
  autoExpandThreshold: 5,  // 5秒后自动展开
});

// 开始任务
hud.startTask('task_001', '实现语音日记功能');

// 记录活动
hud.recordFileRead('src/index.ts');
hud.recordToolCall('edit', { file: 'index.ts' }, 350);
hud.recordDecision('使用 VibeVoice-ASR');

// 更新进度
hud.setPhase('execute');
hud.updateSubtasks([
  { id: 'st1', name: '设计', status: 'completed', progress: 100, agent: '金克丝' },
  { id: 'st2', name: '实现', status: 'running', progress: 50, agent: '艾克' },
]);

// 完成任务
hud.completeTask('功能完成！');
```

## API

### AIStatusHUD

| 方法 | 说明 |
|------|------|
| `startTask(id, name)` | 开始任务 |
| `setAction(action, tool?)` | 设置当前动作 |
| `recordToolCall(tool, input, duration?, result?)` | 记录工具调用 |
| `recordFileRead(path, duration?)` | 记录文件读取 |
| `recordFileWrite(path, duration?)` | 记录文件写入 |
| `recordDecision(summary, reasoning?)` | 记录决策 |
| `recordError(message, context?)` | 记录错误 |
| `setPhase(phase, progress?)` | 设置阶段 |
| `updateSubtasks(subtasks)` | 更新子任务进度 |
| `updateTokens(used, limit?)` | 更新 Token 使用 |
| `completeTask(summary?)` | 完成任务 |
| `toggleExpanded()` | 切换展开状态 |

### 组件

- **StatusBarComponent**: 状态栏显示
- **TimelineComponent**: 活动时间线
- **ProgressComponent**: 进度指示器

## 输出示例

```
┌─────────────────────────────────────────────────────┐
│ 🤖 AI 状态                                          │
│                                                     │
│ 🔄 正在: 编辑文件 MemoryClient.ts                   │
│ 📊 进度: ████████████░░░░░░░░ 60%  ~5min           │
│ 💾 Token: 12,340 / 32,000 (39%)                    │
│                                                     │
│ [展开 ▼]                                            │
└─────────────────────────────────────────────────────┘
│ ───────────────────────────────────────────────────│
│ 🕐 最近活动:                                        │
│   22:03 ✅ read DESIGN.md (120ms)                  │
│   22:04 ✅ edit MemoryClient.ts (350ms)            │
│   22:05 🔄 exec bun test (running...)              │

📋 任务: "实现 Agent Memory System"
总进度: ████████████░░░░░░░░ 60%  5m 30s

📊 阶段: 执行中

  ✅ 设计架构 (金克丝) 2s
  🔄 编写代码 (艾克) 50%
  ⏳ 编写测试 (凯特琳)

⏱️ 已用时: 3m 20s
```

## 集成

### 与 Agent Memory System 集成

```typescript
import { MemoryClient } from '@openclaw/agent-memory-system';
import { AIStatusHUD } from 'ai-status-hud';

const memory = new MemoryClient(config);
const hud = new AIStatusHUD();

// 订阅 Memory 事件
memory.on('observation', (obs) => {
  hud.recordToolCall(obs.toolUsed, obs.input, obs.duration);
});
```

### 与 Multi-Agent Orchestrator 集成

```typescript
import { Orchestrator } from '@openclaw/multi-agent-orchestration';
import { AIStatusHUD } from 'ai-status-hud';

const orchestrator = new Orchestrator(config);
const hud = new AIStatusHUD();

// 订阅进度更新
orchestrator.on('progress', (progress) => {
  hud.updateSubtasks(progress.subtaskProgress);
});
```