# Agent 框架设计文档

**产品**: 通用 Agent 框架  
**技术参考**: Claude Code 源码分析  
**日期**: 2026-03-31

---

## 🎯 设计目标

构建最小可用的 Agent 框架：
1. **QueryEngine** - 查询理解与路由
2. **Tool System** - 工具注册与执行
3. **AgentLoop** - 核心推理循环
4. **Permission System** - 权限控制

---

## 🔧 核心架构

```
┌─────────────────────────────────────────────────────┐
│                   Agent Framework                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐    ┌─────────────┐               │
│  │   Query     │───▶│   Tool      │               │
│  │   Engine    │    │   System    │               │
│  └─────────────┘    └─────────────┘               │
│         │                  │                       │
│         ▼                  ▼                       │
│  ┌─────────────────────────────────────────────┐   │
│  │              Agent Loop                      │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │  Plan   │─▶│ Execute │─▶│ Reflect │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘     │   │
│  └─────────────────────────────────────────────┘   │
│         │                                           │
│         ▼                                           │
│  ┌─────────────┐                                   │
│  │ Permission  │                                   │
│  │   System    │                                   │
│  └─────────────┘                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 核心组件

### 1. QueryEngine

```typescript
interface QueryEngine {
  // 分析用户输入
  analyze(input: string): QueryAnalysis;
  
  // 路由到合适的处理方式
  route(analysis: QueryAnalysis): Route;
  
  // 生成执行计划
  plan(route: Route): ExecutionPlan;
}

interface QueryAnalysis {
  intent: 'question' | 'command' | 'conversation';
  entities: Entity[];
  tools: string[];  // 可能需要的工具
  complexity: number;  // 1-5
  requiresMemory: boolean;
}

interface Route {
  type: 'single_tool' | 'multi_tool' | 'conversation' | 'delegate';
  tools: ToolSpec[];
  context: string[];
}

interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedTokens: number;
  timeout: number;
}
```

### 2. Tool System

```typescript
interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  
  // 执行函数
  execute(input: any, context: ToolContext): Promise<ToolResult>;
  
  // 权限要求
  permissions?: Permission[];
  
  // 超时
  timeout?: number;
}

interface ToolContext {
  agentId: string;
  sessionId: string;
  memory: MemoryClient;
  workingDirectory: string;
}

interface ToolResult {
  success: boolean;
  output: any;
  error?: string;
  metadata?: {
    duration: number;
    tokensUsed?: number;
  };
}

// 内置工具
class ReadFileTool implements Tool {
  name = 'read_file';
  description = 'Read file contents';
  permissions = [{ type: 'file_read' }];
  // ...
}

class WriteFileTool implements Tool {
  name = 'write_file';
  description = 'Write content to file';
  permissions = [{ type: 'file_write' }];
  // ...
}

class ExecuteCommandTool implements Tool {
  name = 'execute_command';
  description = 'Run shell command';
  permissions = [{ type: 'command_execute' }];
  // ...
}
```

### 3. AgentLoop

```typescript
interface AgentLoop {
  // 主循环
  run(input: string, context: AgentContext): AsyncGenerator<AgentEvent>;
  
  // 停止
  stop(): void;
  
  // 暂停/恢复
  pause(): void;
  resume(): void;
}

interface AgentContext {
  agentId: string;
  sessionId: string;
  workingDirectory: string;
  memory: MemoryClient;
  tools: Map<string, Tool>;
  permissions: PermissionSet;
  model: ModelClient;
}

type AgentEvent = 
  | { type: 'thinking'; content: string }
  | { type: 'tool_call'; tool: string; input: any }
  | { type: 'tool_result'; tool: string; result: ToolResult }
  | { type: 'message'; content: string }
  | { type: 'error'; error: Error }
  | { type: 'complete'; result: any };

// Agent 循环实现
class DefaultAgentLoop implements AgentLoop {
  private state: 'running' | 'paused' | 'stopped' = 'running';
  
  async *run(input: string, context: AgentContext): AsyncGenerator<AgentEvent> {
    // 1. 分析输入
    yield { type: 'thinking', content: '分析任务...' };
    const analysis = this.queryEngine.analyze(input);
    
    // 2. 生成计划
    const plan = this.queryEngine.plan(analysis);
    
    // 3. 执行步骤
    for (const step of plan.steps) {
      if (this.state === 'stopped') break;
      while (this.state === 'paused') {
        await new Promise(r => setTimeout(r, 100));
      }
      
      // 执行工具或生成响应
      if (step.type === 'tool_call') {
        yield { type: 'tool_call', tool: step.tool, input: step.input };
        
        const tool = context.tools.get(step.tool);
        const result = await tool!.execute(step.input, context);
        
        yield { type: 'tool_result', tool: step.tool, result };
        
        // 记录到 memory
        await context.memory.recordToolUse(step.tool, step.input, result);
      }
    }
    
    // 4. 生成最终响应
    yield { type: 'complete', result: { success: true } };
  }
}
```

### 4. Permission System

```typescript
interface Permission {
  type: string;
  resource?: string;  // 文件路径、命令等
  constraints?: {
    readOnly?: boolean;
    allowedPaths?: string[];
    allowedCommands?: string[];
  };
}

interface PermissionSet {
  permissions: Permission[];
  
  // 检查权限
  check(permission: Permission): boolean;
  
  // 请求权限
  request(permission: Permission): Promise<boolean>;
}

// 权限策略
interface PermissionPolicy {
  // 自动允许
  autoAllow: Permission[];
  
  // 需要确认
  requireConfirmation: Permission[];
  
  // 自动拒绝
  autoDeny: Permission[];
}

// 默认策略
const DEFAULT_POLICY: PermissionPolicy = {
  autoAllow: [
    { type: 'file_read' },
    { type: 'memory_write' },
  ],
  requireConfirmation: [
    { type: 'file_write' },
    { type: 'command_execute' },
    { type: 'network_request' },
  ],
  autoDeny: [
    { type: 'system_modify' },
  ],
};
```

---

## 🔄 执行流程

### 简单查询

```
用户: "读取 README.md 文件"

1. QueryEngine 分析:
   - intent: command
   - tools: ['read_file']
   - complexity: 1

2. Route: single_tool
   - tool: read_file
   - input: { path: 'README.md' }

3. Permission Check: ✅ (file_read auto-allow)

4. Execute Tool:
   - read_file.execute({ path: 'README.md' })
   
5. Return Result
```

### 复杂任务

```
用户: "分析代码库并生成文档"

1. QueryEngine 分析:
   - intent: command
   - tools: ['read_file', 'execute_command', 'write_file']
   - complexity: 4
   - requiresMemory: true

2. Route: multi_tool
   - steps: [
       { tool: 'execute_command', input: { cmd: 'find . -name "*.ts"' } },
       { tool: 'read_file', input: { path: '...' } },
       { tool: 'write_file', input: { path: 'docs/API.md' } }
     ]

3. Permission Check:
   - execute_command: ⚠️ require confirmation
   - write_file: ⚠️ require confirmation
   
4. 等待用户确认...

5. 执行步骤，记录到 Memory

6. 生成报告
```

---

## 🎮 Agent 配置

```typescript
interface AgentConfig {
  id: string;
  name: string;
  description: string;
  
  // 能力
  capabilities: {
    tools: string[];  // 可用工具
    permissions: Permission[];  // 权限
  };
  
  // 模型
  model: {
    provider: string;
    name: string;
    temperature?: number;
    maxTokens?: number;
  };
  
  // 行为
  behavior: {
    maxIterations: number;
    timeout: number;
    autoApprove: boolean;
  };
  
  // 记忆
  memory: {
    enabled: boolean;
    maxContextTokens: number;
  };
}

// 示例配置
const DEV_AGENT: AgentConfig = {
  id: 'dev-agent',
  name: '开发助手',
  description: '专注于代码开发和调试',
  capabilities: {
    tools: ['read_file', 'write_file', 'execute_command', 'edit_file'],
    permissions: [
      { type: 'file_read' },
      { type: 'file_write', constraints: { allowedPaths: ['./src/*'] } },
      { type: 'command_execute', constraints: { allowedCommands: ['npm', 'bun', 'git'] } },
    ],
  },
  model: {
    provider: 'openai',
    name: 'gpt-4-turbo',
    temperature: 0.7,
  },
  behavior: {
    maxIterations: 50,
    timeout: 300000,  // 5 minutes
    autoApprove: false,
  },
  memory: {
    enabled: true,
    maxContextTokens: 8000,
  },
};
```

---

## 🚀 实施路径

### Phase 1: 核心框架（3 天）

- QueryEngine 基础实现
- Tool 接口 + 内置工具
- AgentLoop 主循环
- Permission 基础检查

### Phase 2: 工具生态（2 天）

- 文件操作工具
- 命令执行工具
- Web 请求工具
- Memory 集成工具

### Phase 3: 智能化（1 周）

- 复杂任务分解
- 上下文管理
- 错误恢复
- 多 Agent 协作

### Phase 4: 生产化（1 周）

- 安全加固
- 性能优化
- 监控和日志
- API 封装

---

## 💡 设计原则

1. **最小权限**: 默认只给必要权限
2. **显式确认**: 危险操作需用户确认
3. **可观察性**: 所有操作可追溯
4. **可恢复性**: 支持暂停/恢复/撤销
5. **可扩展**: 工具和行为可插拔