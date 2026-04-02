# AI辅助研发规范体系

> 让AI真正成为项目的"内部成员"，理解项目灵魂，遵循项目规则，运用项目知识。

## 核心理念

AI辅助开发的最大痛点不是AI能力不够，而是**约束不够**。AI像一个超级聪明但没有上下文的新员工，给模糊指令就会用自己的方式理解，给出"正确但不对"的答案。

这套规范体系的目标：**在执行之前，把不确定性消除在设计阶段。**

## 三层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    AI辅助研发规范体系                         │
├─────────────────────────────────────────────────────────────┤
│  SPEC层（宪法）    │  SKILL层（执行器）  │  RAG层（知识源）    │
│  定义"必须怎样"    │  定义"能做什么"     │  提供"知道什么"     │
└─────────────────────────────────────────────────────────────┘
```

| 层级 | 职责 | 核心问题 | 约束来源 |
|------|------|----------|----------|
| **SPEC** | 项目级规范 | "必须怎样做？" | 人工定义 |
| **SKILL** | AI技能定义 | "能做什么？" | SPEC边界 |
| **RAG** | 知识检索增强 | "需要知道什么？" | SPEC+SKILL过滤 |

## 数据流

```
用户请求
    ↓
SPEC验证（是否合规？）
    ↓
SKILL调度（调用哪个能力？）
    ↓
RAG检索（需要哪些上下文？）
    ↓
执行并返回
```

## 目录结构

```
ai-assisted-dev-specs/
├── README.md                     # 本文档
│
├── 1-SPEC/                       # 项目级规范
│   ├── spec-architecture.md      # SPEC规范架构设计
│   ├── spec-template.md          # SPEC模板（可直接复用）
│   └── spec-validation.md        # 规范验证机制
│
├── 2-SKILL/                      # AI技能规范
│   ├── skill-architecture.md     # SKILL架构设计
│   ├── skill-template.md         # SKILL定义模板
│   └── skill-registry.md         # 技能注册表（索引）
│
├── 3-RAG/                        # 检索增强生成
│   ├── rag-architecture.md      # RAG架构设计
│   ├── rag-chunking.md           # 分块策略
│   └── rag-indexing.md           # 索引与更新策略
│
└── 4-INTEGRATION/                # 整合方案
    ├── openspec-integration.md   # 与OpenSpec设计层整合
    ├── beads-integration.md      # 与Beads执行层整合
    └── workflow-example.md       # 完整工作流示例
```

## 与现有体系整合

```
OpenSpec (设计文档链)
    proposal.md → design.md → specs/*.md → tasks.md
         ↓ 继承
    PROJECT.spec.md (项目级约束)
         ↓ 实现
    PROJECT.skills.md (项目技能定义)
         ↓ 执行
    Beads (任务追踪)
         ←→ PROJECT.rag.md (项目知识)
```

**关键整合点：**

1. **SPEC继承OpenSpec**：OpenSpec的`specs/*.md`是功能规格，`PROJECT.spec.md`是项目级约束
2. **SKILL映射到Beads**：SKILL定义"做什么"，Beads追踪"做得怎样"
3. **RAG为两者提供上下文**：设计时需要历史知识，执行时需要代码库上下文

## 快速开始

1. 复制 `1-SPEC/spec-template.md` 到项目根目录，命名为 `PROJECT.spec.md`
2. 根据项目实际情况填写规范
3. 复制 `2-SKILL/skill-template.md` 定义项目特定技能
4. 配置 RAG 知识源（代码库索引、文档路径等）

## 参考

- [SDD：规范驱动开发](../sdd-specification-driven-development.md)
- [Beads和OpenSpec：为什么AI代理需要两套系统](../beads-with-openspec.md)
- [Agent Memory深度解析](../agent-memory-deep-dive.md)
- [Harness工程化深度解析](../harness-engineering-deep-dive.md)

---

*本文档由孙越与AI团队共同编写*