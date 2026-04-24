# Claude Code 源码架构分析

> 基于 2026-03-31 泄露的源码快照分析

---

## 1. 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Entry (main.tsx)                     │
│                    Commander.js + React/Ink TUI                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       QueryEngine.ts                             │
│              LLM API 调用 / 流式响应 / Tool-Call 循环             │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   Tools      │    │  Commands    │    │   Services   │
    │  (40+ 工具)  │    │  (50+ 命令)  │    │  (外部服务)  │
    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 2. 核心组件

### 2.1 Tool 系统 (`src/Tool.ts` + `src/tools/`)

每个 Tool 是一个自包含模块，定义：

```typescript
interface Tool {
  name: string;                    // 工具名称
  inputSchema: ZodSchema;          // 输入参数校验
  outputSchema?: ZodSchema;        // 输出格式校验
  
  // 权限检查
  validate?: (input, context) => Promise<ValidationResult>;
  
  // 执行逻辑
  call: (input, context) => Promise<ToolResult>;
  
  // UI 渲染
  renderToolUseMessage?: (input) => JSX.Element;
  renderToolResultMessage?: (result) => JSX.Element;
}
```

**关键工具：**

| 工具 | 用途 |
|------|------|
| `BashTool` | Shell 命令执行 |
| `FileReadTool` | 文件读取（支持图片/PDF） |
| `FileWriteTool` | 文件创建/覆盖 |
| `FileEditTool` | 部分文件修改（字符串替换） |
| `GlobTool` | 文件模式匹配搜索 |
| `GrepTool` | ripgrep 内容搜索 |
| `WebFetchTool` | URL 内容抓取 |
| `WebSearchTool` | 网页搜索 |
| `AgentTool` | **子 Agent 派发** |
| `SkillTool` | Skill 执行 |
| `MCPTool` | MCP 服务器工具调用 |
| `LSPTool` | Language Server 集成 |
| `TaskCreateTool` | 任务创建 |
| `SendMessageTool` | Agent 间消息传递 |

### 2.2 AgentTool 设计（核心！）

```typescript
// AgentTool 输入 Schema
const inputSchema = z.object({
  description: z.string().describe('任务简短描述（3-5词）'),
  prompt: z.string().describe('Agent 要执行的任务'),
  subagent_type: z.string().optional().describe('专用 Agent 类型'),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional(),
  run_in_background: z.boolean().optional().describe('后台运行'),
  
  // 多 Agent 模式
  name: z.string().optional().describe('Agent 名称，用于消息路由'),
  team_name: z.string().optional().describe('团队名称'),
  mode: z.enum(['default', 'plan', 'auto']).optional(),
  
  // 隔离模式
  isolation: z.enum(['worktree', 'remote']).optional(),
  cwd: z.string().optional().describe('工作目录覆盖'),
});

// 输出 Schema
const outputSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('completed'),
    prompt: z.string(),
    // ... 结果数据
  }),
  z.object({
    status: z.literal('async_launched'),
    agentId: z.string(),
    description: z.string(),
  }),
]);
```

**关键设计点：**

1. **模型继承**：子 Agent 可覆盖模型，默认继承父 Agent
2. **后台执行**：`run_in_background` 支持异步任务
3. **隔离模式**：`worktree` 创建独立 git worktree，`remote` 远程执行
4. **多 Agent 通信**：通过 `SendMessageTool` 实现 Agent 间消息传递

### 2.3 QueryEngine（LLM 调用引擎）

```typescript
interface QueryEngineConfig {
  cwd: string;
  tools: Tools;                    // 可用工具列表
  commands: Command[];             // 斜杠命令
  mcpClients: MCPServerConnection[]; // MCP 服务器
  agents: AgentDefinition[];       // Agent 定义
  
  canUseTool: CanUseToolFn;        // 权限检查
  getAppState: () => AppState;     // 状态读取
  setAppState: (f) => void;        // 状态更新
  
  initialMessages?: Message[];     // 初始消息（恢复会话）
  customSystemPrompt?: string;     // 自定义系统提示
  thinkingConfig?: ThinkingConfig; // 思考模式配置
  maxTurns?: number;               // 最大轮次
  maxBudgetUsd?: number;           // 预算限制
}
```

**核心流程：**

```
1. 构建系统提示（System Prompt）
   - 工具描述
   - Agent 定义
   - 上下文信息
   
2. 发送请求 → LLM API
   
3. 流式接收响应
   - 文本块 → 直接输出
   - Tool Use → 执行工具 → 返回结果 → 继续请求
   
4. 循环直到：
   - 无更多 Tool Call
   - 达到 maxTurns
   - 达到预算限制
```

### 2.4 权限系统

```typescript
type PermissionMode = 
  | 'default'      // 每次询问用户
  | 'plan'         // 计划模式，需要审批
  | 'auto'         // 自动批准（受限）
  | 'bypassPermissions'; // 完全绕过（危险）

interface PermissionResult {
  decision: 'allow' | 'deny' | 'ask';
  reason?: string;
  modifiedInput?: unknown;  // 可修改输入
}
```

**权限检查流程：**

```
Tool Call → validate() → PermissionResult
                │
                ├── allow → 执行工具
                ├── deny → 返回错误
                └── ask → 弹窗询问用户
```

### 2.5 Service 层

| 服务 | 用途 |
|------|------|
| `api/` | Anthropic API 客户端 |
| `mcp/` | MCP 服务器连接和管理 |
| `oauth/` | OAuth 2.0 认证 |
| `lsp/` | Language Server 管理 |
| `analytics/` | 遥测和 Feature Flags |
| `compact/` | 上下文压缩 |
| `plugins/` | 插件加载器 |

---

## 3. 关键设计模式

### 3.1 并行预取（启动优化）

```typescript
// main.tsx — 在其他 import 之前并行启动
startMdmRawRead();        // MDM 设置读取
startKeychainPrefetch();  // Keychain 预取
```

### 3.2 懒加载

```typescript
// 动态 import 避免循环依赖
const getTeammateUtils = () => require('./utils/teammate.js');

// Feature Flag 控制的条件加载
const coordinatorModule = feature('COORDINATOR_MODE') 
  ? require('./coordinator/coordinatorMode.js') 
  : null;
```

### 3.3 Feature Flags（Dead Code Elimination）

```typescript
import { feature } from 'bun:bundle';

// 未启用的代码在构建时完全移除
const voiceCommand = feature('VOICE_MODE')
  ? require('./commands/voice/index.js').default
  : null;
```

**关键 Feature Flags：**

- `PROACTIVE` - 主动模式
- `KAIROS` - 助手模式
- `BRIDGE_MODE` - IDE 桥接
- `DAEMON` - 守护进程
- `VOICE_MODE` - 语音输入
- `AGENT_TRIGGERS` - Agent 触发器
- `COORDINATOR_MODE` - 多 Agent 协调

### 3.4 Agent Swarms（多 Agent 协作）

```typescript
// 创建团队
TeamCreateTool({ name: 'frontend-team', agents: [...] });

// 派发 Agent
AgentTool({ 
  prompt: '实现登录页面',
  name: 'login-agent',
  team_name: 'frontend-team',
});

// Agent 间通信
SendMessageTool({ to: 'login-agent', message: '...' });
```

---

## 4. 构建自己 Agent 的关键要点

### 4.1 核心 Tool 设计

```typescript
// 最小 Tool 集合
const coreTools = [
  BashTool,       // Shell 执行
  FileReadTool,   // 文件读取
  FileWriteTool,  // 文件写入
  FileEditTool,   // 文件编辑
  GlobTool,       // 文件搜索
  GrepTool,       // 内容搜索
  AgentTool,      // 子 Agent（重要！）
];
```

### 4.2 QueryEngine 简化版

```typescript
async function queryLoop(messages: Message[], tools: Tools) {
  while (true) {
    // 1. 构建 API 请求
    const response = await llmApi.messages.create({
      model: 'claude-sonnet-4-20250514',
      messages,
      tools: tools.map(t => t.definition),
      max_tokens: 8192,
    });

    // 2. 处理响应
    const content = response.content;
    messages.push({ role: 'assistant', content });

    // 3. 提取 Tool Calls
    const toolCalls = content.filter(b => b.type === 'tool_use');
    if (toolCalls.length === 0) break;

    // 4. 执行工具
    const toolResults = await Promise.all(
      toolCalls.map(async (call) => {
        const tool = tools.find(t => t.name === call.name);
        const result = await tool.call(call.input);
        return { type: 'tool_result', tool_use_id: call.id, content: result };
      })
    );

    // 5. 添加工具结果
    messages.push({ role: 'user', content: toolResults });
  }

  return messages;
}
```

### 4.3 AgentTool 实现

```typescript
async function call(input: AgentToolInput, context: ToolUseContext) {
  const agentId = createAgentId();
  
  // 1. 确定 Agent 定义
  const agentDef = input.subagent_type
    ? await loadAgentDefinition(input.subagent_type)
    : GENERAL_PURPOSE_AGENT;
  
  // 2. 构建子 Agent 上下文
  const subContext = {
    ...context,
    cwd: input.cwd || context.cwd,
    model: input.model || agentDef.model || context.model,
  };
  
  // 3. 后台运行？
  if (input.run_in_background) {
    const task = registerAsyncAgent(agentId, input.prompt, subContext);
    return { status: 'async_launched', agentId, description: input.description };
  }
  
  // 4. 同步运行
  const result = await runAgent({
    agentId,
    prompt: input.prompt,
    tools: assembleToolPool(subContext),
    context: subContext,
  });
  
  return { status: 'completed', prompt: input.prompt, ...result };
}
```

### 4.4 权限系统设计

```typescript
// 简化版权限检查
async function checkPermission(
  tool: Tool, 
  input: unknown, 
  mode: PermissionMode
): Promise<PermissionResult> {
  // 1. bypass 模式：直接通过
  if (mode === 'bypassPermissions') {
    return { decision: 'allow' };
  }
  
  // 2. auto 模式：检查白名单
  if (mode === 'auto' && AUTO_ALLOWED_TOOLS.includes(tool.name)) {
    return { decision: 'allow' };
  }
  
  // 3. plan 模式：只允许只读操作
  if (mode === 'plan' && tool.readOnly) {
    return { decision: 'allow' };
  }
  
  // 4. 默认：询问用户
  return { decision: 'ask', reason: `Allow ${tool.name}?` };
}
```

---

## 5. 技术栈选择

### Claude Code 使用

| 类别 | 技术 |
|------|------|
| Runtime | Bun |
| 语言 | TypeScript (strict) |
| 终端 UI | React + Ink |
| CLI 解析 | Commander.js |
| Schema 校验 | Zod v4 |
| 代码搜索 | ripgrep |
| 协议 | MCP SDK, LSP |
| 遥测 | OpenTelemetry + gRPC |
| Feature Flags | GrowthBook |
| 认证 | OAuth 2.0, JWT, macOS Keychain |

### 替代方案

| 类别 | 替代品 |
|------|--------|
| Runtime | Node.js / Deno |
| 终端 UI | Blessed / Terminal-Kit |
| CLI 解析 | Yargs / Oclif |
| Schema 校验 | TypeBox / Ajv |
| 代码搜索 | grep (内置) |

---

## 6. 目录结构参考

```
src/
├── main.tsx              # CLI 入口
├── QueryEngine.ts        # LLM 调用引擎
├── Tool.ts               # Tool 类型定义
├── tools.ts              # Tool 注册表
├── commands.ts           # Command 注册表
│
├── tools/                # 工具实现
│   ├── BashTool/
│   │   ├── BashTool.tsx  # 主逻辑
│   │   ├── prompt.ts     # 提示生成
│   │   ├── UI.tsx        # 渲染组件
│   │   └── utils.ts      # 辅助函数
│   ├── AgentTool/
│   │   ├── AgentTool.tsx
│   │   ├── runAgent.ts   # Agent 执行
│   │   ├── loadAgentsDir.ts  # Agent 加载
│   │   └── built-in/     # 内置 Agent
│   └── ...
│
├── commands/             # 斜杠命令
│   ├── commit.ts
│   ├── review.ts
│   └── ...
│
├── services/             # 外部服务
│   ├── api/              # LLM API
│   ├── mcp/              # MCP 协议
│   ├── lsp/              # Language Server
│   └── analytics/        # 遥测
│
├── hooks/                # React Hooks
├── components/           # UI 组件
├── utils/                # 工具函数
└── types/                # 类型定义
```

---

## 7. 关键学习点

### 7.1 Tool 作为原子能力

每个 Tool 应该：
- 做一件事，做好一件事
- 有清晰的输入/输出 Schema
- 包含权限检查
- 提供良好的错误信息
- 支持进度反馈

### 7.2 AgentTool 实现递归

AgentTool 是最强大的工具：
- Agent 可以派生子 Agent
- 子 Agent 可以继续派生
- 支持后台执行
- 支持 Agent 间通信

### 7.3 状态管理

```typescript
// 使用 React 状态管理
const [appState, setAppState] = createStore<AppState>(defaultAppState);

// 在 Tool 中访问状态
const cwd = getAppState().cwd;
const messages = getAppState().messages;
```

### 7.4 流式输出

```typescript
// 使用 AsyncGenerator 实现流式
async function* streamResponse(messages: Message[]) {
  const stream = await llmApi.messages.stream({ ... });
  
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      yield { type: 'text', delta: event.delta.text };
    } else if (event.type === 'content_block_start') {
      const block = event.content_block;
      if (block.type === 'tool_use') {
        yield { type: 'tool_start', name: block.name, id: block.id };
      }
    }
  }
}
```

---

## 总结

Claude Code 的架构展示了如何构建一个生产级 AI Agent：

1. **Tool 系统是核心** - 每个能力封装为独立 Tool
2. **AgentTool 实现递归** - Agent 可以派生子 Agent
3. **权限系统是安全基础** - 每个操作都需要检查
4. **流式输出提升体验** - 实时反馈给用户
5. **Feature Flags 控制发布** - 安全地启用新功能

构建自己的 Agent 时，可以从最小 Tool 集开始，逐步扩展能力。