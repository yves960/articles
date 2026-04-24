# AI 辅助研发体系

## 核心观点

AI 辅助研发的关键问题不是模型是否足够聪明，而是项目是否给出了足够明确的
约束、能力边界和上下文。

## 分层模型

| 层 | 回答的问题 | 典型材料 |
| --- | --- | --- |
| SPEC | 必须怎样做 | 项目规范、功能规格、验收标准 |
| SKILL | 能做什么 | 工具说明、操作流程、能力边界 |
| RAG | 需要知道什么 | 代码、文档、历史决策、知识库 |
| WORKFLOW | 谁在什么时候做什么 | 角色边界、审查流程、发布检查 |

## 与 Agent 的关系

这套体系把 Agent 从“自由发挥”拉回“受约束执行”：

- SPEC 限定目标和验收标准。
- SKILL 限定可用能力和调用方式。
- RAG 提供必要上下文。
- WORKFLOW 管理协作和交接。

## 相关源材料

- [raw/ai-assisted-dev-specs/README.md](../../raw/ai-assisted-dev-specs/README.md)
- [raw/sdd-specification-driven-development.md](../../raw/sdd-specification-driven-development.md)
- [raw/2026-04-04-how-to-build-and-optimize-a-skill.md](../../raw/2026-04-04-how-to-build-and-optimize-a-skill.md)
- [raw/codebase-indexing-comparison.md](../../raw/codebase-indexing-comparison.md)

## 关联主题

- [OpenSpec 与 Beads](openspec-beads.md)
- [Agent Memory](agent-memory.md)
