# Agent Memory：一个让我重新思考"记忆"概念的框架

## 从一个问题开始

**如果Agent每次对话都是全新的开始，它能成为真正的智能吗？**

我想了很久这个问题。

人类之所以是人，不是因为大脑大，是因为**记忆**。你记得昨天吃了什么，记得谁是朋友，记得学过的技能。这些记忆构成了"你"。

那Agent呢？

如果Agent每次都从零开始，它永远只是一个"高级自动回复机器"。它不会成长，不会学习，不会变成"某个特定的Agent"。

**Memory不是锦上添花，是Agent的灵魂。**

---

## Harrison Chase给我的启示

LangChain创始人Harrison Chase在一个访谈里提出了Memory的三种类型。

这个框架让我豁然开朗。不是因为他发明了什么新东西，而是他把一个复杂的问题**用最简单的方式说清楚了**。

### 三种记忆，三个维度

| 类型 | 存什么 | 技术实现 |
|------|--------|----------|
| Semantic Memory | 事实和知识 | RAG |
| Episodic Memory | 对话历史 | 历史记录 |
| Procedural Memory | "如何做某事的指令" | System Prompt + Skills + Tools |

这不是随意划分的。它们对应着人类记忆系统的三个维度：

- **Semantic Memory**：你知道什么（知识）
- **Episodic Memory**：你经历过什么（经历）
- **Procedural Memory**：你怎么做事（性格和技能）

缺少任何一个，这个人都不完整。同样，缺少任何一种记忆的Agent，都无法成为真正的智能体。

---

## OpenClaw Memory-Core：一个真实的实现

我研究了OpenClaw的memory-core扩展源码。这是**生产级别的Memory实现**，不是玩具。

源码位置：`extensions/memory-core/`

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    memory-core 架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ memory_     │    │ memory_     │    │ prompt_     │     │
│  │ search      │    │ get         │    │ section     │     │
│  │ (工具)      │    │ (工具)      │    │ (提示词)    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MemorySearchManager                     │   │
│  │  ┌─────────────┐    ┌─────────────┐                │   │
│  │  │ QmdManager  │    │ IndexManager │               │   │
│  │  │ (QMD后端)   │    │ (内置后端)   │               │   │
│  │  └─────────────┘    └─────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              搜索引擎层                              │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐      │   │
│  │  │ hybrid.ts  │ │ mmr.ts     │ │ temporal-  │      │   │
│  │  │ 混合搜索   │ │ MMR去重    │ │ decay.ts   │      │   │
│  │  └────────────┘ └────────────┘ │ 时间衰减   │      │   │
│  │                                └────────────┘      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              嵌入层                                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │ OpenAI   │ │ Gemini   │ │ Mistral  │ │ Local  │ │   │
│  │  │ Voyage   │ │ Ollama   │ │          │ │        │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              存储层                                  │   │
│  │  ┌─────────────┐    ┌─────────────┐                │   │
│  │  │ SQLite      │    │ 文件系统    │                │   │
│  │  │ (向量+全文) │    │ MEMORY.md   │                │   │
│  │  └─────────────┘    └─────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件解析

| 组件 | 文件 | 职责 |
|------|------|------|
| **工具层** | `tools.ts` | memory_search + memory_get两个工具 |
| **管理器** | `manager.ts` | 索引管理、文件监听、嵌入批处理 |
| **搜索引擎** | `hybrid.ts` | 向量搜索 + BM25全文搜索的混合 |
| **重排序** | `mmr.ts` | MMR算法去重，避免重复结果 |
| **时间衰减** | `temporal-decay.ts` | 旧记忆权重降低 |
| **嵌入** | `embeddings.ts` | 多Provider适配（OpenAI/Gemini/Mistral等） |

---

## 混合搜索：为什么向量不够？

OpenClaw用**混合搜索（Hybrid Search）**。这是关键设计。

为什么纯向量搜索不够？

1. **向量擅长语义相似**，但精确关键词匹配差
2. **全文搜索擅长精确匹配**，但语义理解弱
3. **中文场景更特殊**：CJK字符需要专门处理

### hybrid.ts的实现

```typescript
// 核心公式
score = vectorWeight * vectorScore + textWeight * textScore
```

**向量搜索**：用嵌入模型计算query和chunk的语义相似度

**全文搜索**：用BM25算法，从SQLite FTS表检索

```typescript
// BM25分数转换为0-1范围
function bm25RankToScore(rank: number): number {
  if (rank < 0) {
    const relevance = -rank;
    return relevance / (1 + relevance);
  }
  return 1 / (1 + rank);
}
```

**合并结果**：同一个chunk在两个搜索中都出现时，加权合并分数。

---

## MMR：为什么"最相关"不够？

MMR（Maximal Marginal Relevance）是另一个关键设计。

**问题**：纯按相关性排序，结果可能高度重复。

比如搜索"Agent Memory"，返回10个结果，但内容几乎一样。

**MMR的思路**：在相关性和多样性之间平衡。

### mmr.ts的核心算法

```typescript
// MMR公式（Carbonell & Goldstein, 1998）
MMR = λ * relevance - (1-λ) * max_similarity_to_selected
```

- `λ = 0`：最大多样性
- `λ = 1`：最大相关性
- 默认 `λ = 0.7`：偏向相关性，但有多样性惩罚

**迭代选择过程**：

```
1. 选择相关性最高的第一个结果
2. 对剩余候选，计算MMR分数
3. 选择MMR分数最高的
4. 重复直到选够数量
```

### CJK特殊处理

OpenClaw的MMR对中日韩文字做了专门处理：

```typescript
// CJK字符正则
const CJK_RE = /[\u3040-\u309f\u30a0-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;

// 分词：ASCII单词 + CJK单字 + CJK相邻双字
function tokenize(text: string): Set<string> {
  // 英文/数字
  const ascii = lower.match(/[a-z0-9_]+/g) ?? [];
  // CJK单字
  const unigrams = cjkData.map(d => d.char);
  // CJK相邻双字（只对真正相邻的）
  const bigrams = [...];
  return new Set([...ascii, ...bigrams, ...unigrams]);
}
```

**为什么这样设计？**

- 中日韩文字没有空格分隔，需要特殊处理
- 双字（bigram）比单字更有语义信息
- 只对原文中相邻的字符创建bigram，避免"我喜欢hello你好"产生错误的"欢你"bigram

---

## 时间衰减：新记忆更重要

**问题**：2024年1月写的MEMORY.md和2026年3月写的，哪个更重要？

OpenClaw用**时间衰减（Temporal Decay）**处理这个问题。

### temporal-decay.ts的核心公式

```typescript
// 指数衰减公式
decayMultiplier = exp(-λ * ageInDays)

// 半衰期参数
λ = LN2 / halfLifeDays
// 默认 halfLifeDays = 30天
```

**半衰期30天的含义**：30天前的记忆，权重降低50%

### 特殊处理：Evergreen Memory

不是所有记忆都该衰减：

```typescript
// 这些文件不衰减：
- MEMORY.md（长期知识）
- memory/topics.md（主题知识）
- memory/user-preferences.md（用户偏好）

// 这些文件按日期衰减：
- memory/2026-03-30.md（每日日志）
```

**从文件名解析日期**：

```typescript
// 匹配 YYYY-MM-DD.md 格式
const DATED_MEMORY_PATH_RE = /(?:^|\/)memory\/(\d{4})-(\d{2})-(\d{2})\.md$/;
```

---

## 嵌入Provider：多模型适配

OpenClaw支持多种嵌入Provider：

| Provider | 默认模型 | 特点 |
|----------|----------|------|
| openai | text-embedding-3-small | 稳定、高质量 |
| gemini | embedding-001 | Google生态 |
| mistral | mistral-embed | Mistral生态 |
| voyage | voyage-3 | 专业嵌入 |
| ollama | nomic-embed-text | 本地运行 |
| local | 本地模型 | 无API依赖 |

### 自动选择逻辑

```typescript
// Provider按优先级自动选择
// local最后，因为需要本地模型
function listAutoSelectAdapters() {
  return listMemoryEmbeddingProviders()
    .filter(a => typeof a.autoSelectPriority === 'number')
    .toSorted((a, b) => a.autoSelectPriority - b.autoSelectPriority);
}
```

**Fallback机制**：如果首选Provider失败，自动切换备用。

---

## 提示词注入：让Agent知道"先查记忆"

OpenClaw在Agent的System Prompt中注入一段指引：

### prompt-section.ts的核心内容

```typescript
// 当memory_search和memory_get都可用时
"Before answering anything about prior work, decisions, dates, 
people, preferences, or todos: run memory_search on MEMORY.md 
+ memory/*.md; then use memory_get to pull only the needed lines. 
If low confidence after search, say you checked."

// 引用模式
"Citations: include Source: <path#line> when it helps the user 
verify memory snippets."
```

**这是强制性指引**：Agent在回答任何关于过去的问题前，必须先搜索记忆。

---

## 两层后端：QMD vs 内置

OpenClaw有两个Memory后端：

| 后端 | 特点 | 适用场景 |
|------|------|----------|
| **QMD** | 高性能、云端同步 | 生产环境 |
| **内置** | SQLite本地存储 | 开发/单机 |

### Fallback机制

```typescript
// 从search-manager.ts
try {
  const primary = await QmdMemoryManager.create(...);
  // QMD成功，使用QMD
} catch (err) {
  log.warn(`qmd memory unavailable; falling back to builtin`);
  // QMD失败，切换内置
  const { MemoryIndexManager } = await loadManagerRuntime();
  return await MemoryIndexManager.get(params);
}
```

---

## 搜索流程全景图

```
用户提问："上次我们讨论的Agent项目是什么？"
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  1. memory_search 工具调用                           │
│     query = "Agent项目"                              │
│     maxResults = 10                                 │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  2. 混合搜索                                         │
│     ├── 向量搜索：语义相似度                         │
│     │   query_embed → chunk_embeds → cosine sim     │
│     ├── 全文搜索：BM25                               │
│     │   "Agent" AND "项目" → FTS table → rank       │
│     └───────────────────────────────────────        │
│     score = 0.7 * vector + 0.3 * keyword           │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  3. 时间衰减                                         │
│     memory/2024-01-15.md → age=400天 → decay=0.12   │
│     memory/2026-03-28.md → age=2天 → decay=0.95     │
│     MEMORY.md → evergreen → decay=1.0              │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  4. MMR重排序（可选）                                │
│     避免返回10个内容重复的结果                        │
│     λ=0.7 → 偏向相关性但有多样性惩罚                  │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  5. 返回结果                                         │
│     [                                               │
│       {path: "MEMORY.md", line: 45, snippet: "..."}│
│       {path: "memory/2026-03-28.md", line: 12...}  │
│       ...                                           │
│     ]                                               │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  6. memory_get 工具调用                              │
│     只读取需要的行，避免加载整个文件                   │
│     path="MEMORY.md", from=45, lines=20            │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  7. Agent回答                                        │
│     "上次讨论的是OpenClaw的memory-core扩展..."       │
│     Source: MEMORY.md#45                            │
└─────────────────────────────────────────────────────┘
```

---

## 我的思考：工程细节决定成败

读完源码后，我有几个关键洞察：

### 1. 混合搜索不是可选，是必须

纯向量搜索在中文场景下不够用。BM25全文搜索配合向量，才能覆盖"语义相似"和"精确匹配"两种需求。

### 2. MMR解决了一个被忽视的问题

大多数Memory系统按相关性排序，但没考虑结果重复。MMR让返回结果更丰富，避免"10个结果说同一件事"。

### 3. 时间衰减需要分类处理

不是所有记忆都该衰减。长期知识（MEMORY.md）和每日日志（2026-03-30.md）需要不同的衰减策略。

### 4. CJK处理是中文Agent的必修课

中文分词、bigram生成、Jaccard相似度计算——这些细节决定中文Memory的质量。

---

## Semantic Memory：最难的不是检索，是"什么值得记"

语义记忆存储的是**事实性知识**——"用户喜欢咖啡"、"项目目录是/Users/sy/xxx"、"金克丝的性格是天马行空"。

技术实现是RAG。把信息存进向量数据库，需要时检索出来。

**但真正的挑战是：Agent怎么知道哪些信息值得记住？**

每次对话都产生大量信息：
- "今天天气不错"
- "我刚买了新电脑"
- "这个功能太烂了"

哪些该记住？哪些该忽略？

**记住一切，会被噪音淹没。记住太少，会错过重要上下文。**

Harrison Chase说得很清楚：**核心挑战不是怎么检索，而是怎么让信息进入记忆**。

这是语义记忆的未解难题。目前的做法：
- 显式指令：用户说"记住这个"
- 隐式信号：重复提及、情感强烈、与核心任务相关
- 时间衰减：较新信息权重更高

**但没有完美的自动化方案。这是人类和AI都需要持续学习的课题。**

---

## Episodic Memory：相对成熟，但被低估

情景记忆记录的是**对话历史**——"昨天用户让我写文章"、"上周调试时遇到Tailscale错误"。

技术实现相对直接：
- 存储：按时间顺序保存对话记录
- 检索：给Agent工具查询历史
- 压缩：长期保存需要摘要

**这是三种记忆里最成熟的一种。**

但我发现一个问题：**很多人把Episodic Memory当成"全部记忆"**。

他们以为给Agent加上对话历史查询，Agent就有记忆了。错了。

对话历史只是"你经历过什么"。你还需要"你知道什么"（Semantic），和"你怎么做事"（Procedural）。

**三种记忆缺一不可。**

---

## Procedural Memory：最被低估，也最重要

这是三种记忆里**最有趣的一种**。

Harrison Chase的定义：

> **Procedural Memory是"如何做某事的指令"。**

更具体地说：**System Prompt、Skills、Tools——这些就是Agent的程序记忆。**

### 为什么这很重要？

LangChain Deep Agents的设计：把这些都表示为**文件**。

这意味着什么？**Agent可以修改自己的程序记忆。**

它可以学习，可以进化。

> "当我们说Agent可以学习，真正意思是它可以修改自己的程序记忆，这些记忆以文件形式存储在文件系统中。"

**这打开了一个全新的可能性。**

Agent不仅是执行者，还可以改进自己的执行方式。

---

## 总结

| 维度 | 一句话 |
|------|--------|
| **三种记忆** | Semantic（知识）、Episodic（经历）、Procedural（技能） |
| **混合搜索** | 向量+BM25，覆盖语义和精确两种需求 |
| **MMR** | 在相关性和多样性之间平衡 |
| **时间衰减** | 新记忆更重要，但有evergreen例外 |
| **CJK处理** | 中文Agent的必修课 |
| **两层后端** | QMD高性能 + 内置fallback |

**Memory不是功能，是Agent的灵魂。**

OpenClaw的memory-core展示了生产级Memory需要的工程细节——混合搜索、MMR去重、时间衰减、CJK处理。这些细节决定成败。

---

## 参考资料

- [OpenClaw memory-core源码](https://github.com/openclaw/openclaw/tree/main/extensions/memory-core) — 生产级Memory实现
- [Harrison Chase访谈 (YouTube)](https://www.youtube.com/watch?v=rSKh6bVuVZI) — Memory三种类型框架
- [LangChain Deep Agents](https://github.com/langchain-ai/deep-agents) — 程序记忆可修改的实现
- [MMR论文 (Carbonell & Goldstein, 1998)](https://dl.acm.org/doi/10.1145/290941.291025) — MMR算法原始论文