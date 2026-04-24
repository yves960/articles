# OpenSpec 与 Beads

## 核心观点

OpenSpec 和 Beads 解决的是两个不同层面的问题：

- OpenSpec 管“想清楚”：用 proposal、design、specs、tasks 形成设计链。
- Beads 管“追踪执行”：用任务依赖图、状态和 claim 机制管理执行。

两者互补，不是替代关系。

## 映射关系

| OpenSpec | Beads |
| --- | --- |
| proposal.md | Epic 的动机和背景 |
| design.md | Epic 的技术方案 |
| specs/*.md | Epic 或 Task 的验收标准 |
| tasks.md | 可追踪 Task |
| 任务顺序 | `bd dep add` 依赖关系 |
| 执行状态 | `bd ready`、`bd update --claim`、`bd close` |

## 对知识库的启发

个人知识库也需要类似分层：

- raw/source 层保存事实和原文。
- wiki 层保存设计后的知识结构。
- log 层保存演进记录。
- questions 层保存尚未解决的问题。

## 相关源材料

- [raw/beads-with-openspec.md](../../raw/beads-with-openspec.md)
- [raw/ai-assisted-dev-specs/4-INTEGRATION/openspec-integration.md](../../raw/ai-assisted-dev-specs/4-INTEGRATION/openspec-integration.md)
- [raw/ai-assisted-dev-specs/4-INTEGRATION/beads-integration.md](../../raw/ai-assisted-dev-specs/4-INTEGRATION/beads-integration.md)
- [raw/ai-assisted-dev-specs/4-INTEGRATION/workflow-example.md](../../raw/ai-assisted-dev-specs/4-INTEGRATION/workflow-example.md)

## 关联主题

- [AI 辅助研发体系](ai-assisted-development.md)
