# Agent Memory

## 核心观点

Agent Memory 不是聊天记录存档，而是让 Agent 从“一次性工具”变成“可持续
成长系统”的基础设施。

## 三类记忆

| 类型 | 内容 | 常见实现 |
| --- | --- | --- |
| Semantic Memory | 事实、知识、概念 | RAG、向量库、全文索引 |
| Episodic Memory | 交互历史、事件经历 | 会话日志、任务记录 |
| Procedural Memory | 如何做事 | System Prompt、Skills、工具说明 |

## 检索设计

当前文章强调混合检索的重要性：

- 向量搜索适合语义相似。
- BM25/全文搜索适合精确关键词。
- MMR 用来避免结果高度重复。
- 时间衰减让旧知识仍可用，但不会无限压过新知识。

## 相关源材料

- [raw/agent-memory-deep-dive.md](../../raw/agent-memory-deep-dive.md)
- [raw/ai-assisted-dev-specs/3-RAG/rag-architecture.md](../../raw/ai-assisted-dev-specs/3-RAG/rag-architecture.md)
- [raw/ai-assisted-dev-specs/3-RAG/rag-indexing.md](../../raw/ai-assisted-dev-specs/3-RAG/rag-indexing.md)
- [raw/ai-assisted-dev-specs/3-RAG/rag-chunking.md](../../raw/ai-assisted-dev-specs/3-RAG/rag-chunking.md)

## 关联主题

- [AI Agent 基础设施](ai-agent-infrastructure.md)
- [AI 辅助研发体系](ai-assisted-development.md)
