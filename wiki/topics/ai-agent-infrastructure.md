# AI Agent 基础设施

## 核心观点

AI Agent 的能力不是单纯来自模型，而来自三件事的组合：

- 可调用的工具
- 可理解的说明书
- 可检索的上下文

CLI、MCP、Skills、Plugin、Harness 都可以放在这个框架里理解：它们不是互斥
概念，而是 Agent 执行环境的不同层。

## 概念关系

| 概念 | 主要作用 | 对 Agent 的价值 |
| --- | --- | --- |
| CLI | 把能力暴露成文本接口 | 易调用、易自动化、易记录 |
| MCP | 标准化外部能力接入 | 降低工具集成成本 |
| Skill | 说明工具如何使用 | 补足模型不知道的新工具知识 |
| Plugin | 打包工具、协议、说明书 | 让能力可安装、可分发 |
| Harness | 给 Agent 提供运行边界 | 控制权限、上下文、执行流程 |

## 相关源材料

- [raw/ai-replacement-series/chapter-1-cli-vs-ide-plugin.md](../../raw/ai-replacement-series/chapter-1-cli-vs-ide-plugin.md)
- [raw/agent-and-harness-simplified.md](../../raw/agent-and-harness-simplified.md)
- [raw/harness-engineering-deep-dive.md](../../raw/harness-engineering-deep-dive.md)
- [raw/ai-assisted-dev-toolmap.md](../../raw/ai-assisted-dev-toolmap.md)

## 关联主题

- [Agent Memory](agent-memory.md)
- [AI 辅助研发体系](ai-assisted-development.md)
