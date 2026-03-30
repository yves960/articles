# 如何用 AI 代替我：第二章 - 我的 OpenCode 配置详解

上一章讲了为什么我选择 CLI Agent。这一章，我来拆解我的 OpenCode 配置——每一个插件、每一个参数、每一个 Skill 都是怎么用的。

---

## 配置文件结构

OpenCode 的配置目录在 `~/.config/opencode/`。

```
~/.config/opencode/
├── opencode.json          # 主配置文件
├── opencode-arise.json    # Arise 插件配置
├── oh-my-opencode.json    # 主题插件配置
├── superpowers/           # Skills 和 Agents
│   ├── skills/            # 技能定义
│   ├── agents/            # Agent 定义
│   └── hooks/             # 钩子脚本
└── plugin/                # 插件软链接
```

---

## 主配置文件：opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": { ... },
  "model": "minimax/MiniMax-M2.7",
  "small_model": "zhipuai-coding-plan/glm-4.7",
  "plugin": [
    "oh-my-opencode",
    "opencode-worktree",
    "opencode-supermemory",
    "opencode-browser",
    "opencode-pty",
    "opencode-arise"
  ],
  "lsp": { ... }
}
```

### provider：配置模型提供商

这是 OpenCode 最强大的地方——**provider-agnostic**。你可以配置多个模型提供商，然后按需切换。

```json
"provider": {
  "minimax": {
    "npm": "@ai-sdk/anthropic",
    "options": {
      "baseURL": "https://api.minimaxi.com/anthropic/v1",
      "apiKey": "sk-cp-xxx"
    },
    "models": {
      "MiniMax-M2.7": { "name": "MiniMax-M2.7" }
    }
  },
  "bailian-coding-plan": {
    "npm": "@ai-sdk/anthropic",
    "options": {
      "baseURL": "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1",
      "apiKey": "sk-sp-xxx"
    },
    "models": {
      "qwen3.5-plus": {
        "name": "Qwen3.5 Plus",
        "modalities": { "input": ["text", "image"], "output": ["text"] },
        "options": { "thinking": { "type": "enabled", "budgetTokens": 8192 } },
        "limit": { "context": 1000000, "output": 65536 }
      },
      "glm-5": { ... },
      "kimi-k2.5": { ... }
    }
  }
}
```

**我配置了什么？**

| Provider | 模型 | 用途 |
|----------|------|------|
| MiniMax | MiniMax-M2.7 | 主力模型，性价比高 |
| 百炼（阿里云） | Qwen3.5 Plus, GLM-5, Kimi K2.5 | 备选模型 |

**关键参数解释：**

- `npm`：使用哪个 AI SDK（OpenCode 用 Vercel AI SDK）
- `baseURL`：API 端点（Anthropic 兼容格式）
- `thinking.budgetTokens`：推理预算，让模型"思考"更多
- `limit.context`：上下文窗口大小

### model & small_model：指定默认模型

```json
"model": "minimax/MiniMax-M2.7",
"small_model": "zhipuai-coding-plan/glm-4.7"
```

- `model`：主模型，用于复杂任务
- `small_model`：小模型，用于简单任务（节省成本）

**OpenCode 会智能选择：**
- 简单查询 → small_model
- 复杂推理 → model
- 后台任务 → small_model

### plugin：插件系统

```json
"plugin": [
  "oh-my-opencode",
  "opencode-worktree",
  "opencode-supermemory",
  "opencode-browser",
  "opencode-pty",
  "opencode-arise"
]
```

这是我配置的 6 个插件，逐个解释：

#### 1. oh-my-opencode：最强的 Agent Harness

**这是最重要的插件。**

oh-my-opencode（也叫 oh-my-openagent）是一个完整的 Agent Harness 系统，把 OpenCode 变成一个真正的"AI 开发团队"。

**它有多强？**

Anthropic 曾经因为 oh-my-opencode 封锁了 OpenCode。因为它的效果太好，威胁到了 Claude Code 的商业利益。

用户评价：
> "If Claude Code does in 7 days what a human does in 3 months, Sisyphus does it in 1 hour."

> "Knocked out 8000 eslint warnings with Oh My Opencode, just in a day"

> "It made me cancel my Cursor subscription."

**核心特性：**

| 特性 | 说明 |
|------|------|
| Discipline Agents | 多 Agent 协作系统 |
| ultrawork (ulw) | 一键激活所有 Agent |
| IntentGate | 分析用户真实意图 |
| Hash-Anchored Edit | 基于 hash 的精准编辑 |
| LSP + AST-Grep | IDE 级代码智能 |
| Ralph Loop | 自循环直到完成 |
| Todo Enforcer | 强制完成任务 |

**我的配置：**

```json
// oh-my-opencode.json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/dev/assets/oh-my-opencode.schema.json",
  "agents": {
    "sisyphus": { "model": "minimax/MiniMax-M2.7" },
    "hephaestus": { "model": "minimax/MiniMax-M2.7" },
    "oracle": { "model": "minimax/MiniMax-M2.7" },
    "prometheus": { "model": "minimax/MiniMax-M2.7" },
    "metis": { "model": "minimax/MiniMax-M2.7" },
    "atlas": { "model": "minimax/MiniMax-M2.7" },
    "momus": { "model": "minimax/MiniMax-M2.7" },
    "explore": { "model": "minimax/MiniMax-M2.7" },
    "librarian": { "model": "minimax/MiniMax-M2.7" },
    "multimodal-looker": { "model": "minimax/MiniMax-M2.7" }
  },
  "categories": {
    "visual-engineering": { "model": "minimax/MiniMax-M2.7" },
    "ultrabrain": { "model": "minimax/MiniMax-M2.7" },
    "deep": { "model": "minimax/MiniMax-M2.7" },
    "artistry": { "model": "minimax/MiniMax-M2.7" },
    "quick": { "model": "minimax/MiniMax-M2.7" },
    "unspecified-low": { "model": "minimax/MiniMax-M2.7" },
    "unspecified-high": { "model": "minimax/MiniMax-M2.7" },
    "writing": { "model": "minimax/MiniMax-M2.7" }
  }
}
```

**Agent 角色详解：**

| Agent | 角色 | 用途 |
|-------|------|------|
| Sisyphus | 主控 | 协调所有 Agent，驱动任务完成 |
| Hephaestus | 工匠 | 自主深度工作，端到端执行 |
| Prometheus | 规划者 | 战略规划，面试式需求分析 |
| Oracle | 架构师 | 架构设计、调试 |
| Librarian | 图书管理员 | 文档、代码搜索 |
| Explore | 探索者 | 快速代码库检索 |
| Metis | 智慧 | 策略分析 |
| Atlas | 承载者 | 大规模任务 |
| Momus | 批评者 | 代码审查 |
| Multimodal Looker | 观察者 | 多模态处理（图像等） |

**Category 系统：**

Agent 不直接选模型，而是选 category，系统自动路由到合适的模型：

| Category | 用途 |
|----------|------|
| visual-engineering | 前端、UI/UX、设计 |
| ultrabrain | 硬逻辑、架构决策 |
| deep | 自主研究+执行 |
| artistry | 创意工作 |
| quick | 单文件修改、小改动 |
| unspecified-low | 简单任务 |
| unspecified-high | 复杂任务 |
| writing | 文档、内容 |

**ultrawork：一键起飞**

```bash
ultrawork  # 或 ulw
```

一个命令，所有 Agent 激活：
- Sisyphus 开始协调
- Prometheus 开始规划
- Hephaestus 开始执行
- 不停直到完成

**Hash-Anchored Edit：解决 Harness Problem**

传统编辑工具有个致命问题：让模型复现行号和内容，容易出错。

oh-my-opencode 的解决方案：
```
11#VK| function hello() {
22#XJ|   return "world";
33#MB| }
```

每行带有内容 hash。编辑时引用 hash，系统验证 hash 是否匹配。不匹配就拒绝编辑，避免损坏代码。

**效果：** Grok Code Fast 1 的成功率从 6.7% 提升到 68.3%，仅仅换了编辑工具。

**Ralph Loop：自循环直到完成**

```bash
/ulw-loop
```

Agent 不停循环，直到任务 100% 完成。这是"自律 Agent"的实现。

**Todo Enforcer：强制完成**

Agent 闲置时，系统自动拉回来。你的任务必须完成，不能半途而废。

#### 2. opencode-worktree：Git Worktree 管理

**这是什么？**

Git worktree 让你可以在同一个仓库里同时检出多个分支，每个分支一个独立目录。

**为什么重要？**

CLI Agent 经常需要并行工作。比如：
- Agent A 在 `feature/auth` 分支开发认证功能
- Agent B 在 `feature/api` 分支开发 API

没有 worktree，它们会互相干扰。有了 worktree，各自独立工作。

**效果：**
- Agent 自动在独立 worktree 中工作
- 完成后自动合并
- 避免分支冲突

#### 3. opencode-supermemory：持久化记忆

**这是什么？**

让 Agent 能"记住"之前的工作，跨会话保持上下文。

**为什么重要？**

普通 Agent 每次启动都是"失忆"的。但实际工作中，你需要它：
- 记住你的编码风格
- 记住项目的特殊约定
- 记住之前踩过的坑

**效果：**
- 项目知识自动保存
- 下次启动自动加载
- 形成"项目记忆"

#### 4. opencode-browser：浏览器能力

**这是什么？**

给 Agent 浏览器能力，让它能：
- 打开网页
- 截图
- 填表单
- 抓取数据

**为什么重要？**

很多工作需要浏览器：
- 查文档
- 测试 Web 应用
- 抓取网页信息

**效果：**
- Agent 可以自己查文档
- Agent 可以自己测试 UI
- Agent 可以获取网页内容

#### 5. opencode-pty：伪终端支持

**这是什么？**

让 Agent 能运行需要交互的命令（比如 vim、top）。

**为什么重要？**

普通 bash 工具无法处理交互式命令。PTY 让 Agent 可以：
- 运行测试并查看输出
- 启动开发服务器
- 执行需要用户输入的命令

#### 6. opencode-arise：多 Agent 协作

**这是最重要的插件。**

```json
// opencode-arise.json
{
  "show_banner": true,
  "agents": {
    "monarch": { "model": "minimax/MiniMax-M2.7" },
    "beru": { "model": "minimax/MiniMax-M2.7" },
    "igris": { "model": "zhipui-coding-plan/glm-5.1" },
    "bellion": { "model": "minimax/MiniMax-M2.7" },
    "tusk": { "model": "minimax/MiniMax-M2.7" },
    "tank": { "model": "minimax/MiniMax-M2.7" },
    "shadow-sovereign": { "model": "minimax/MiniMax-M2.7" }
  },
  "output_shaping": {
    "max_chars": 12000,
    "preserve_errors": true
  },
  "compaction": {
    "threshold_percent": 80,
    "preserve_todos": true
  }
}
```

**这是什么？**

Arise 是 OpenCode 的多 Agent 框架，名字来自《我独自升级》中的 Shadow Army。

**Agent 角色：**

| Agent | 角色 | 用途 |
|-------|------|------|
| monarch | 君主 | 主控 agent，分配任务 |
| beru | 贝鲁 | 执行 agent，主力开发 |
| igris | 艾格里 | 规划 agent，轻量模型 |
| bellion | 贝利昂 | 执行 agent |
| tusk | 塔斯克 | 执行 agent |
| tank | 坦克 | 执行 agent |
| shadow-sovereign | 暗影君主 | 最终决策 |

**关键参数：**

- `output_shaping.max_chars`：限制输出长度，避免 token 浪费
- `output_shaping.preserve_errors`：保留错误信息，方便调试
- `compaction.threshold_percent`：上下文压缩阈值（80% 时触发）
- `compaction.preserve_todos`：压缩时保留待办事项

### lsp：语言服务器配置

```json
"lsp": {
  "python": {
    "command": ["pyright-langserver", "--stdio"],
    "extensions": [".py"]
  }
}
```

**这是什么？**

LSP（Language Server Protocol）让 Agent 获得代码智能：
- 跳转到定义
- 查找引用
- 自动补全
- 类型检查

**为什么重要？**

没有 LSP，Agent 只能靠文本搜索理解代码。有了 LSP，它能像 IDE 一样"理解"代码结构。

---

## Superpowers：技能系统

Superpowers 是 OpenCode 的杀手级特性——一套预定义的 Skills，让 Agent 学会"工作方法"。

### Skills 目录结构

```
superpowers/skills/
├── brainstorming/           # 头脑风暴
├── dispatching-parallel-agents/  # 并行分发
├── executing-plans/         # 执行计划
├── finishing-a-development-branch/  # 完成分支
├── receiving-code-review/   # 接收代码审查
├── requesting-code-review/  # 请求代码审查
├── subagent-driven-development/  # 子代理驱动开发
├── systematic-debugging/    # 系统化调试
├── test-driven-development/  # 测试驱动开发
├── using-git-worktrees/     # 使用 Git Worktrees
├── using-superpowers/       # 使用说明
├── verification-before-completion/  # 完成前验证
├── writing-plans/           # 编写计划
└── writing-skills/          # 编写技能
```

### 核心 Skills 详解

#### 1. brainstorming：必须先思考再动手

```yaml
---
name: brainstorming
description: "You MUST use this before any creative work - creating features, 
  building components, adding functionality, or modifying behavior. 
  Explores user intent, requirements and design before implementation."
---
```

**核心理念：** 任何创造性工作之前，必须先理解需求、设计方案。

**流程：**
1. 探索项目上下文（查文件、看文档、看最近提交）
2. 逐个提问澄清需求
3. 提出 2-3 个方案
4. 获得用户批准
5. 写设计文档
6. 规格审查循环

**关键规则：**
```markdown
<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, 
or take any implementation action until you have presented a design and 
the user has approved it.
</HARD-GATE>
```

#### 2. dispatching-parallel-agents：并行处理独立任务

```yaml
---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on 
  without shared state or sequential dependencies
---
```

**核心理念：** 多个独立问题，分派多个 Agent 并行处理。

**何时使用：**
- 多个测试失败（不同测试文件）
- 多个子系统有 bug
- 多个独立功能需要开发

**关键原则：** 每个 Agent 处理一个独立问题域，不共享上下文。

#### 3. executing-plans：执行已有计划

```yaml
---
name: executing-plans
description: Use when you have a written implementation plan to execute 
  in a separate session with review checkpoints
---
```

**核心理念：** 计划和执行分离。先有计划，再执行。

**流程：**
1. 加载计划文件
2. 批判性审查（有问题先问）
3. 创建 Todo 列表
4. 逐个执行任务
5. 报告完成状态

#### 4. test-driven-development：测试驱动开发

```yaml
---
name: test-driven-development
description: Write tests first, then implement. Red → Green → Refactor.
---
```

**核心理念：** 先写测试，再写实现。

**为什么重要？**

Agent 写代码容易"自以为完成"。测试是客观验证标准。

#### 5. verification-before-completion：完成前验证

```yaml
---
name: verification-before-completion
description: Before marking work complete, verify it actually works
---
```

**核心理念：** 不要只"说"完成了，要"证明"完成了。

**验证步骤：**
- 运行测试
- 检查构建
- 验证功能
- 代码审查

### 自定义 Agent：code-reviewer

```markdown
---
name: code-reviewer
description: Use this agent when a major project step has been completed 
  and needs to be reviewed against the original plan and coding standards.
model: inherit
---

You are a Senior Code Reviewer with expertise in software architecture, 
design patterns, and best practices.
```

**职责：**
1. 计划对齐分析（实现是否符合计划）
2. 代码质量评估
3. 架构设计审查
4. 文档和标准检查
5. 问题识别和建议

**关键原则：** 独立审查，不受 Generator 影响。这呼应了 Anthropic 的三 Agent 架构（Planner → Generator → Evaluator）。

---

## 配置参数详解

### compaction：上下文压缩

```json
"compaction": {
  "threshold_percent": 80,
  "preserve_todos": true
}
```

**这是什么？**

当上下文达到窗口的 80% 时，自动压缩旧内容。

**为什么重要？**

模型有上下文限制。如果不压缩：
- 早期对话会丢失
- Agent 会"忘记"之前的指令
- 性能会下降

**preserve_todos 的意义：**

压缩时保留待办事项列表。这是 Agent 的"任务记忆"，不能丢。

### output_shaping：输出控制

```json
"output_shaping": {
  "max_chars": 12000,
  "preserve_errors": true
}
```

**这是什么？**

控制 Agent 输出长度，避免 token 浪费。

**为什么重要？**

Agent 容易"话多"：
- 重复解释同一件事
- 输出大量日志
- 打印完整文件内容

限制输出长度可以让 Agent 更简洁。

**preserve_errors 的意义：**

即使达到长度限制，也要保留错误信息。调试时这很关键。

---

## 我的日常工作流

### 场景一：新功能开发

```
1. 我：打开终端，运行 opencode
2. 我：描述需求（一句话或一段话）
3. Agent：使用 brainstorming skill
   - 查项目结构
   - 问澄清问题
   - 提设计方案
4. 我：批准方案
5. Agent：使用 executing-plans skill
   - 创建计划
   - 逐个执行任务
   - 每个任务完成后验证
6. Agent：使用 verification-before-completion skill
   - 跑测试
   - 检查功能
7. Agent：使用 finishing-a-development-branch skill
   - 询问如何集成（merge/PR）
   - 执行选择
```

### 场景二：Bug 修复

```
1. 我：描述 bug
2. Agent：使用 systematic-debugging skill
   - 定位问题
   - 分析原因
   - 提出修复方案
3. Agent：使用 test-driven-development skill
   - 先写失败测试
   - 再写修复代码
   - 验证测试通过
4. Agent：使用 code-reviewer agent
   - 审查修复代码
   - 检查副作用
```

### 场景三：并行开发

```
1. 我：列出 3 个独立任务
2. Agent：使用 dispatching-parallel-agents skill
   - 创建 3 个 subagent
   - 每个 agent 在独立 worktree 工作
   - 并行执行
3. Agent：汇总结果
```

---

## 成本优化策略

### 模型分层

```json
"model": "minimax/MiniMax-M2.7",           // 复杂任务
"small_model": "zhipuai-coding-plan/glm-4.7" // 简单任务
```

国产模型比 Claude 便宜很多：
- MiniMax M2.7：约 $0.3/1M input tokens
- Claude Opus 4.6：约 $15/1M input tokens

**50 倍价差，效果差距没这么大。**

### 上下文压缩

```json
"compaction": {
  "threshold_percent": 80,
  "preserve_todos": true
}
```

80% 触发压缩，避免达到 100% 时被迫重置会话。

### 输出限制

```json
"output_shaping": {
  "max_chars": 12000
}
```

防止 Agent 输出过多无用信息，浪费 tokens。

---

## 下一章预告

第三章，我会讲：
- 如何让 AI 学会你的工作习惯
- 如何配置多 Agent 协作（OpenClaw 的 4 Agent 架构）
- 如何把 AI 接入 Telegram/钉钉/微信
- 实战：一个完整的"AI 替我工作"案例

---

## 参考资料

- [OpenCode 官网](https://opencode.ai)
- [OpenCode GitHub](https://github.com/anomalyco/opencode)
- [OpenCode 文档](https://opencode.ai/docs)
- [oh-my-opencode GitHub](https://github.com/code-yeongyu/oh-my-openagent)
- [Superpowers 插件](https://github.com/anomalyco/opencode/tree/dev/superpowers)
- [Git Worktree 文档](https://git-scm.com/docs/git-worktree)
- [The Harness Problem](https://blog.can.ac/2026/02/12/the-harness-problem/)

---

本文由 GLM-5 模型和孙越共同编写。