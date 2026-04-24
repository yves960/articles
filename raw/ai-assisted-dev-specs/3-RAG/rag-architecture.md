# RAG检索增强生成架构设计

## 什么是RAG？

RAG（Retrieval-Augmented Generation）让AI能够基于项目最新知识进行推理，而不是只依赖训练数据。

**核心问题**："需要知道什么？"

**为什么需要RAG？**

即使有了SPEC（约束）和SKILL（能力），AI还缺少：
- 项目的代码库知识
- 业务文档和历史决策
- API文档和数据模型
- Issue/PR历史和讨论

**RAG是AI的知识源。**

## RAG的三层架构

```
┌─────────────────────────────────────────────────────────────┐
│                     RAG三层架构                              │
├─────────────────────────────────────────────────────────────┤
│  索引层        │  检索层        │  增强层        │
│  知识存储      │  相关性检索     │  上下文注入    │
└─────────────────────────────────────────────────────────────┘
```

### 第一层：索引层

知识存储和索引：

```yaml
knowledge_sources:
  # 代码库
  codebase:
    paths:
      - "src/**"
      - "tests/**"
      - "docs/**"
    exclude:
      - "node_modules/**"
      - "dist/**"
      - ".git/**"
    index_type: "semantic"  # semantic | keyword | hybrid

  # 文档
  documents:
    paths:
      - "docs/**"
      - "README.md"
      - "CHANGELOG.md"
    index_type: "semantic"

  # Issue/PR
  discussions:
    source: "github"  # github | gitlab | jira
    include:
      - "issues"
      - "pull_requests"
      - "comments"
    index_type: "keyword"

  # 配置
  configs:
    paths:
      - "*.json"
      - "*.yaml"
      - "*.toml"
    index_type: "keyword"
```

### 第二层：检索层

相关性检索：

```yaml
retrieval:
  # 检索策略
  strategy: "hybrid"  # semantic | keyword | hybrid

  # 向量检索
  semantic:
    model: "text-embedding-ada-002"
    top_k: 10
    similarity_threshold: 0.7

  # 关键词检索
  keyword:
    model: "bm25"
    top_k: 10

  # 混合检索
  hybrid:
    semantic_weight: 0.6
    keyword_weight: 0.4
    rerank: true

  # 过滤条件
  filters:
    - field: "language"
      values: ["typescript", "javascript"]
    - field: "type"
      values: ["code", "document"]
```

### 第三层：增强层

上下文注入：

```yaml
augmentation:
  # 上下文窗口
  context_window:
    max_tokens: 4000
    format: "markdown"

  # 上下文模板
  template: |
    ## 项目上下文

    ### 相关代码
    {code_context}

    ### 相关文档
    {doc_context}

    ### 相关讨论
    {discussion_context}

    ---

    ## 用户问题
    {query}

  # 去重
  deduplication:
    enabled: true
    method: "content_hash"

  # 时间衰减
  time_decay:
    enabled: true
    half_life_days: 30
```

## RAG文件结构

```markdown
# PROJECT.rag.md

## 知识源配置
定义索引哪些内容

## 检索策略
定义如何检索

## 增强配置
定义如何注入上下文

## 更新策略
定义何时更新索引
```

## 分块策略

### 代码分块

```yaml
code_chunking:
  # 按函数/类分块
  method: "ast"  # ast | line | semantic

  # 块大小
  max_chunk_size: 500  # tokens
  min_chunk_size: 100

  # 重叠
  overlap: 50

  # 元数据
  metadata:
    - "file_path"
    - "language"
    - "type"  # function | class | module
    - "name"
    - "dependencies"
    - "docstring"
```

### 文档分块

```yaml
document_chunking:
  # 按段落分块
  method: "paragraph"  # paragraph | section | semantic

  # 块大小
  max_chunk_size: 300
  min_chunk_size: 100

  # 重叠
  overlap: 30

  # 元数据
  metadata:
    - "file_path"
    - "title"
    - "section"
    - "url"
```

### Issue/PR分块

```yaml
discussion_chunking:
  # 按评论分块
  method: "comment"

  # 块大小
  max_chunk_size: 500

  # 元数据
  metadata:
    - "type"  # issue | pr
    - "number"
    - "title"
    - "author"
    - "created_at"
    - "labels"
    - "state"
```

## 索引更新策略

### 增量更新

```yaml
update_strategy:
  # 触发条件
  triggers:
    - type: "file_change"
      events: ["create", "modify", "delete"]
      paths: ["src/**", "docs/**"]

    - type: "git_push"
      branches: ["main", "develop"]

    - type: "schedule"
      cron: "0 2 * * *"  # 每天凌晨2点

  # 更新方式
  mode: "incremental"  # full | incremental

  # 去重
  deduplication:
    enabled: true
    method: "content_hash"

  # 失效
  invalidation:
    enabled: true
    ttl_days: 90
```

### 全量重建

```yaml
full_rebuild:
  # 触发条件
  triggers:
    - type: "manual"
      command: "rag rebuild"

    - type: "config_change"
      file: "PROJECT.rag.md"

    - type: "schedule"
      cron: "0 3 * * 0"  # 每周日凌晨3点
```

## RAG与SPEC/SKILL的协同

```
用户请求
    ↓
SPEC验证（是否合规？）
    ↓
SKILL调度（调用哪个能力？）
    ↓
RAG检索（需要哪些上下文？）
    ↓
知识过滤（SPEC+SKILL双重过滤）
    ↓
上下文增强（注入到AI提示词）
    ↓
AI推理
```

### 知识过滤

```yaml
# 根据SPEC过滤知识
spec_filter:
  - rule: "只能访问当前项目的代码"
    filter: "file_path startsWith project_root"

  - rule: "不能访问敏感文件"
    filter: "file_path not in forbidden_paths"

# 根据SKILL过滤知识
skill_filter:
  - skill: "code:read"
    filter: "type == 'code'"

  - skill: "docs:read"
    filter: "type == 'document'"
```

## RAG工作流

```
1. 知识摄入
   代码库/文档/Issue → 分块 → 向量化 → 存储

2. 查询处理
   用户问题 → 向量化 → 检索 → 排序 → 过滤

3. 上下文增强
   检索结果 → 模板渲染 → 注入提示词

4. AI推理
   增强提示词 → AI模型 → 生成结果
```

## 性能优化

### 缓存策略

```yaml
cache:
  # 查询缓存
  query_cache:
    enabled: true
    ttl_minutes: 60
    max_size: 1000

  # 嵌入缓存
  embedding_cache:
    enabled: true
    ttl_days: 7

  # 结果缓存
  result_cache:
    enabled: true
    ttl_minutes: 30
```

### 预加载

```yaml
preload:
  # 热点知识
  hot_knowledge:
    - "src/index.ts"
    - "src/app.ts"
    - "docs/README.md"

  # 预计算
  precompute:
    - type: "dependencies"
      query: "this module imports what?"
    - type: "api"
      query: "what APIs are available?"
```

## RAG评估

### 检索质量指标

```yaml
metrics:
  # 召回率
  recall:
    enabled: true
    threshold: 0.8

  # 精确率
  precision:
    enabled: true
    threshold: 0.7

  # 相关性
  relevance:
    enabled: true
    threshold: 0.8

  # 延迟
  latency:
    enabled: true
    max_ms: 500
```

### A/B测试

```yaml
ab_test:
  enabled: true
  variants:
    - name: "semantic_only"
      strategy: "semantic"
    - name: "hybrid"
      strategy: "hybrid"
  metrics:
    - "relevance"
    - "latency"
```

## 下一步

1. 复制 `rag-architecture.md` 配置到项目
2. 配置知识源路径
3. 选择检索策略
4. 设置更新策略

---

*RAG是AI的知识源，知识越准确，AI越智能*