# Beads和OpenSpec：为什么AI代理需要两套系统

## 一个我观察到的痛点

AI代理越来越强，能写代码、能重构、能做复杂任务。但有个问题越来越明显：

**任务追踪是个灾难。**

你让AI做一个功能，它可能拆成10个子任务。你让它并行做，它可能搞混状态。你让它接手别人的任务，它可能不知道哪个已经完成了。

传统的解决方案是什么？

- 在AGENTS.md里写`tasks.md`——静态清单，没有状态管理
- 在GitHub上开issue——有状态，但没有依赖追踪
- 用Trello/Jira——不是为AI代理设计的

**这些方案要么是"静态文档"，要么是"人类工具"，没有一个是真正为AI代理设计的。**

---

## 我看到的两个系统

最近我看到了两个有意思的项目：

### OpenSpec：规范驱动开发

OpenSpec的核心是一条Artifact链：

```
proposal.md → design.md → specs/*.md → tasks.md → 实现 → 归档
```

它解决的是"怎么想清楚"的问题：
- proposal.md：为什么做
- design.md：怎么做
- specs/*.md：做成什么样
- tasks.md：分几步做

**问题是：tasks.md是静态的checkbox清单。**

没有状态管理，没有依赖关系，不知道哪个任务可以先做，不知道多代理怎么协作。

### Beads：AI代理任务追踪器

Beads的核心是一个依赖图：

```
Epic (bd-xxx) → Task (bd-xxx.1) → Sub-task (bd-xxx.1.1)
```

它解决的是"怎么追踪执行"的问题：
- Hash IDs（`bd-a1b2`）避免多代理冲突
- `bd dep add`建立依赖关系
- `bd ready`列出无阻塞的任务
- `bd update --claim`原子抢占任务
- Compaction压缩旧任务，节省上下文

**Beads天生为AI代理设计，但缺少设计文档层。**

---

## 我发现一个核心问题

**OpenSpec和Beads解决的问题不重合，但刚好互补。**

| 维度 | OpenSpec | Beads |
|------|----------|-------|
| **解决什么问题** | "怎么想清楚" | "怎么追踪执行" |
| **核心结构** | Artifact链（设计文档） | 依赖图（任务追踪） |
| **tasks.md** | 静态checkbox清单 | 没有这个概念 |
| **状态管理** | 无 | 有（ready、in_progress、closed） |
| **依赖追踪** | 无 | 有（blocks、relates_to） |
| **多代理协作** | 单代理模式 | 天然支持（Hash IDs） |
| **Compaction** | 无 | 有（压缩旧任务） |

**OpenSpec有设计文档，但没有执行追踪。Beads有执行追踪，但没有设计文档。**

---

## 我建议的结合方案

### 结构映射

OpenSpec的设计层映射到Beads的追踪层：

```
OpenSpec                    Beads
──────────────────────────────────────────
proposal.md ──────────────→ 创建Epic
design.md   ──────────────→ Epic描述的一部分
specs/*.md  ──────────────→ Epic描述的一部分
tasks.md    ──────────────→ 每个task转成Beads Task
              ↓
           bd dep add（建立依赖）
              ↓
           bd ready（找出可执行任务）
              ↓
           bd update --claim（Agent抢占）
              ↓
           执行 + Compaction
```

### 实际使用流程

**第一步：OpenSpec生成设计文档**

```bash
/opsx:ff 启动时检查并拉起后台服务
```

生成：
- `proposal.md`：为什么需要这个变更
- `design.md`：技术方案选择
- `specs/*.md`：4个场景（WHEN/THEN）
- `tasks.md`：3个可执行任务

**第二步：把tasks.md转成Beads Tasks**

```bash
# 创建Epic
bd create "启动时检查并拉起后台服务" -p 0 -t epic

# 把tasks.md的每个task转成Beads Task
bd create "检查服务是否已注册" -p 1
bd create "检查服务是否已运行" -p 1
bd create "启动服务并处理失败" -p 1

# 建立依赖
bd dep add bd-xxx.2 bd-xxx.1  # 任务2依赖任务1
bd dep add bd-xxx.3 bd-xxx.2  # 任务3依赖任务2
```

**第三步：Agent执行**

```bash
# 找出可执行任务
bd ready

# Agent抢占任务
bd update bd-xxx.1 --claim

# 执行完成，关闭任务
bd close bd-xxx.1 "已完成"
```

**第四步：多代理协作**

如果有多个Agent并行工作：

```bash
# Agent A抢占任务1
bd update bd-xxx.1 --claim

# Agent B抢占任务4（不依赖任务1-3）
bd update bd-xxx.4 --claim

# 两者独立工作，Hash IDs避免冲突
```

**第五步：Compaction**

一段时间后，旧任务会被压缩：

```bash
# 压缩已关闭的旧任务
bd compact
```

保留关键信息，丢弃噪音，节省上下文窗口。

---

## 我的思考

读完两套系统后，我有一个核心观点：

**AI代理需要两套系统：一套管"想清楚"，一套管"追踪执行"。**

这不是重复，是分层。

**OpenSpec管的是"设计层"**——把模糊需求变成精确规范。

**Beads管的是"执行层"**——把任务分配给代理，追踪状态，管理依赖。

为什么不能用一套系统？

- 设计文档需要人审阅，不适合频繁变更
- 任务追踪需要机器管理，不适合静态Markdown
- 两者的生命周期不同：设计是"写一次改几次"，追踪是"每分钟都在变"

**一套系统做两件事，要么做得不好，要么做得太重。**

---

## 总结

| 系统 | 一句话 |
|------|--------|
| OpenSpec | "让每次变更都有设计文档可追溯" |
| Beads | "让AI代理的任务追踪像git一样可靠" |

**OpenSpec负责"想清楚"，Beads负责"追踪执行"。**

两者结合，AI代理才有了完整的工作流：
- 先用OpenSpec生成设计文档
- 再用Beads追踪任务执行
- 最后用OpenSpec归档，用Beads Compaction

**这不是重复建设，是分层设计。**

---

## 参考资料

- [GitHub: steveyegge/beads](https://github.com/steveyegge/beads) — AI代理任务追踪器
- [GitHub: Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) — 规范驱动开发框架
- [博客园: SDD基于规范编程](https://www.cnblogs.com/kybs0/p/19770771) — OpenSpec/Superpowers对比分析