# 如何用 AI 代替我：第一章 - 为什么我选择 CLI Agent

## 一个选择的困惑

2026 年，AI 编程工具已经多到让人眼花缭乱。

**IDE 插件派：** Cursor、Windsurf、VS Code + Copilot、JetBrains AI
**CLI Agent 派：** Claude Code、OpenCode、Codex CLI、Aider

作为一个想"把 AI 变成自己替身"的人，我该怎么选？

经过半年的实践，我的答案是：**CLI Agent**。具体来说，我选择了 **OpenCode** 和 **Claude Code**。

为什么？这是我这一章要讲的故事。

---

## CLI Agent vs IDE 插件：本质区别

先说清楚，这两类工具在做什么。

### IDE 插件：增强你的编辑器

Cursor、Windsurf 这类工具，本质上是**把 AI 嵌入到你熟悉的编辑器里**。

```
你的工作流：
打开 IDE → AI 帮你补全代码 → 你 review → 你修改 → AI 继续
```

AI 是你的副驾驶，你是司机。AI 写代码，你看着。AI 提建议，你决定。

### CLI Agent：把 AI 变成独立员工

Claude Code、OpenCode 这类工具，是**在终端里运行的完整 Agent**。

```
你的工作流：
打开终端 → 给 Agent 一个任务 → Agent 自己读代码、写代码、跑测试 → 你看结果
```

AI 是员工，你是经理。你布置任务，AI 自己干完。

---

## 我的核心需求：让 AI 变成"我"

如果只是想"写代码更快"，IDE 插件足够了。

但我的目标不一样：**我想让 AI 变成一个能独立完成工作的"我"**。

这意味着什么？

### 需求一：自主性

IDE 插件的 AI 是被动响应的。你问一句，它答一句。你不问，它不动。

我需要的 AI 是主动的：给它一个目标，它自己规划、自己执行、自己验证。

**CLI Agent 天生就是主动的。** 它们被设计成 autonomous agent，而不是智能补全工具。

### 需求二：全栈能力

我不只想让 AI 写代码。我想让它：

- 读我的项目文档
- 理解我的代码架构
- 自己跑测试、修 bug
- 自己查资料、搜文档
- 甚至帮我发 PR、写 commit message

**IDE 插件被困在编辑器里。** 它们看不到终端，跑不了命令，没法做端到端的工作。

**CLI Agent 住在终端里。** 终端是操作系统的入口，它们可以访问一切。

### 需求三：跨平台协作

我在 Telegram、钉钉、微信上都有工作群。我希望 AI 能在这些地方出现，帮我处理消息、回复问题。

**IDE 插件被困在桌面上。** 它们跟着你的电脑走，你关机它们就没了。

**CLI Agent 可以跑在服务器上。** 它们 24 小时在线，随时响应。

---

## 实际对比：几个关键维度

### 维度一：任务复杂度

| 任务类型 | IDE 插件 | CLI Agent |
|---------|---------|-----------|
| 补全一行代码 | ✅ 完美 | ✅ 能做，但杀鸡用牛刀 |
| 重构一个函数 | ✅ 很好 | ✅ 很好 |
| 实现一个完整功能 | ⚠️ 需要你盯着 | ✅ 可以独立完成 |
| 修一个跨文件的 bug | ⚠️ 需要你导航 | ✅ 自己搜索定位 |
| 从零开始一个项目 | ❌ 不行 | ✅ 可以 |
| 连续工作 2 小时 | ❌ 不行 | ✅ 可以 |

**分界线在哪？**

- IDE 插件适合**你做的过程中的辅助**
- CLI Agent 适合**你布置后的独立执行**

### 维度二：上下文理解

**IDE 插件的优势：** 它们能看到你当前打开的文件、光标位置、选中内容。这是"微观上下文"。

**CLI Agent 的优势：** 它们能跑命令、读整个项目、查 git 历史。这是"宏观上下文"。

| 上下文类型 | IDE 插件 | CLI Agent |
|-----------|---------|-----------|
| 当前文件内容 | ✅ 自动获取 | ✅ 需要主动读 |
| 光标位置 | ✅ 自动感知 | ❌ 不适用 |
| 整个项目结构 | ⚠️ 有限 | ✅ 完全访问 |
| Git 历史 | ⚠️ 有限 | ✅ 完全访问 |
| 运行测试结果 | ❌ 一般不能 | ✅ 直接跑命令 |
| 搜索文档/网页 | ⚠️ 需要 MCP | ✅ 内置浏览器工具 |

### 维度三：持续工作能力

这是最关键的区别。

**IDE 插件：** 每次交互都是独立的。它不会"记住"上一个任务，不会"规划"下一步要做什么。

**CLI Agent：** 它们被设计成能**持续工作**。

Cursor 团队的研究显示，他们的 multi-agent 系统能实现：
- 每小时 1000 个 commit
- 一周内超过 1000 万次工具调用
- 连续运行一周无需人工干预

OpenAI 的 Codex 团队更是做到：
- 5 个月，1500 个 PR
- 100 万行代码
- 人类一行代码都没写

**这种持续工作能力，是 IDE 插件根本没有的设计目标。**

---

## 为什么我同时用 OpenCode 和 Claude Code？

### Claude Code：最成熟的 CLI Agent

Claude Code 是 Anthropic 官方出品，目前最成熟的 CLI coding agent。

**优势：**
- 和 Claude 模型深度绑定，效果最好
- Harness 设计最成熟（OpenAI、Stripe 都在学习 Anthropic 的方法）
- 插件生态丰富（MCP、Skills）
- 文档完善，社区活跃

**劣势：**
- 只能用 Claude 模型
- 价格较贵
- 数据会发到 Anthropic

### OpenCode：开源、Provider-Agnostic 的选择

OpenCode 是开源项目，最大的特点是 **provider-agnostic**——你可以用任何模型。

**优势：**
- 100% 开源
- 可以用 Claude、OpenAI、Google、本地模型
- 内置 LSP 支持
- Client/Server 架构（可以远程操控）
- 社区插件生态（Superpowers）

**劣势：**
- 没有官方模型绑定，效果取决于你选的模型
- 相对较新，生态不如 Claude Code 成熟

### 我的用法

**用 OpenCode 做"主力开发"：**
- 配置了国产模型（GLM、Qwen、MiniMax）
- 成本低，适合日常开发
- Superpowers 插件提供了完整的工作流

**用 Claude Code 做"重活"：**
- 复杂重构
- 跨项目修改
- 需要 Claude Opus 推理能力的任务

---

## 一个反直觉的发现：工具越少越好

Vercel 团队做过一个实验：

> 我们最初给 agent 配备了 15 个工具，表现很差。精简到 2 个核心工具后，准确率从 80% 提升到 100%。

这个发现和 Harness Engineering 的核心理念一致：**约束解空间反而让 Agent 更有生产力。**

CLI Agent 天生就比 IDE 插件更"专注"。它不试图做所有事，而是把几件事做好：
- 读代码
- 写代码
- 跑命令
- 管理文件

**专注，反而更强大。**

---

## CLI Agent 的"缺陷"

公平地说，CLI Agent 也有劣势。

### 学习曲线

终端对很多人来说是陌生环境。你需要学习：
- 基本的 shell 命令
- 如何启动和管理 agent
- 如何配置模型和工具

### 调试体验

当 agent 写出有问题的代码时，在终端里调试不如 IDE 直观。

### 视觉反馈

IDE 有语法高亮、错误提示、类型检查。终端里只有文本输出。

---

## 总结：什么时候用什么

**用 IDE 插件，如果你：**
- 主要需要代码补全
- 喜欢视觉化编程环境
- 任务相对简单（单文件修改、局部重构）
- 想保持对每行代码的控制

**用 CLI Agent，如果你：**
- 想让 AI 独立完成完整任务
- 需要跨文件、跨项目的工作
- 想自动化工作流
- 愿意花时间配置和优化 agent

**如果你想"用 AI 代替自己"，CLI Agent 是唯一的选择。**

---

## 下一章预告

第二章，我会详细讲解我的 OpenCode 配置：
- 插件系统：oh-my-opencode、superpowers 是什么
- 配置文件：每个参数的作用
- Skills 和 Agents：如何让 AI 学会你的工作方式
- 实战案例：我的日常工作流

---

## 参考资料

- [OpenCode GitHub](https://github.com/anomalyco/opencode)
- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Cursor Self-Driving Codebases](https://cursor.com/blog/self-driving-codebases)
- [Vercel: We Removed 80% of Our Agent's Tools](https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools)
- [Philipp Schmid: The Importance of Agent Harness](https://www.philschmid.de/agent-harness-2026)