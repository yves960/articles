# RAG索引与更新策略

## 索引策略

### 索引类型

```yaml
index_types:
  # 向量索引（语义检索）
  vector:
    model: "text-embedding-ada-002"
    dimension: 1536
    metric: "cosine"  # cosine | euclidean | dot_product
    advantage: "语义理解能力强"
    disadvantage: "计算成本高"

  # 关键词索引（精确检索）
  keyword:
    model: "bm25"
    advantage: "精确匹配、速度快"
    disadvantage: "无法理解语义"

  # 混合索引（推荐）
  hybrid:
    vector_weight: 0.6
    keyword_weight: 0.4
    advantage: "兼顾语义和精确"
    disadvantage: "需要维护两个索引"
```

### 索引配置

```yaml
index_config:
  # 主索引
  primary:
    type: "hybrid"
    vector:
      model: "text-embedding-ada-002"
      top_k: 10
      threshold: 0.7
    keyword:
      model: "bm25"
      top_k: 10

  # 辅助索引
  auxiliary:
    - name: "api_index"
      type: "keyword"
      scope: "api_endpoints"

    - name: "dependency_index"
      type: "keyword"
      scope: "imports_exports"
```

## 更新策略

### 增量更新

```yaml
incremental_update:
  # 触发条件
  triggers:
    # 文件变化触发
    - type: "file_change"
      events:
        - "create"
        - "modify"
        - "delete"
      paths:
        - "src/**"
        - "docs/**"
      debounce_ms: 5000  # 5秒内多次变化合并处理

    # Git事件触发
    - type: "git_event"
      events:
        - "push"
      branches:
        - "main"
        - "develop"

    # 定时触发
    - type: "schedule"
      cron: "0 */4 * * *"  # 每4小时

  # 更新流程
  workflow:
    - step: "detect_changes"
      action: "检测变化的文件"
    - step: "compute_diff"
      action: "计算新旧分块差异"
    - step: "update_index"
      action: "更新索引"
    - step: "cleanup"
      action: "清理失效分块"
```

### 全量重建

```yaml
full_rebuild:
  # 触发条件
  triggers:
    # 手动触发
    - type: "manual"
      command: "rag rebuild"
      requires_confirmation: true

    # 配置变化触发
    - type: "config_change"
      files:
        - "PROJECT.rag.md"
        - ".rag/config.yaml"

    # 定时触发
    - type: "schedule"
      cron: "0 3 * * 0"  # 每周日凌晨3点

  # 重建流程
  workflow:
    - step: "backup"
      action: "备份现有索引"
    - step: "clean"
      action: "清空索引"
    - step: "scan"
      action: "扫描所有文件"
    - step: "chunk"
      action: "分块处理"
    - step: "embed"
      action: "向量嵌入"
    - step: "index"
      action: "构建索引"
    - step: "validate"
      action: "验证索引完整性"
    - step: "switch"
      action: "切换到新索引"
```

## 索引失效处理

### TTL失效

```yaml
ttl_invalidation:
  # 全局TTL
  global_ttl_days: 90

  # 按类型TTL
  by_type:
    - type: "code"
      ttl_days: 30  # 代码变化快
    - type: "document"
      ttl_days: 90  # 文档变化慢
    - type: "config"
      ttl_days: 60

  # 清理策略
  cleanup:
    schedule: "0 4 * * *"  # 每天凌晨4点
    batch_size: 1000
```

### 依赖失效

```yaml
dependency_invalidation:
  # 当A变化时，失效依赖A的分块
  enabled: true

  # 依赖关系
  dependencies:
    - source: "src/types/*.ts"
      affects:
        - "src/**/*.ts"  # 类型文件变化影响所有使用它的文件

    - source: "docs/api/*.md"
      affects:
        - "docs/**/*.md"  # API文档变化影响相关文档
```

## 索引版本管理

```yaml
versioning:
  # 版本策略
  strategy: "snapshot"  # snapshot | incremental

  # 版本保留
  retention:
    max_versions: 5
    keep_duration_days: 30

  # 版本切换
  switching:
    automatic: false
    requires_confirmation: true

  # 版本回滚
  rollback:
    enabled: true
    command: "rag rollback --version <version_id>"
```

## 索引监控

```yaml
monitoring:
  # 索引健康检查
  health_check:
    schedule: "0 */6 * * *"  # 每6小时
    checks:
      - "索引大小是否正常"
      - "向量质量是否正常"
      - "更新延迟是否正常"

  # 性能监控
  performance:
    metrics:
      - "检索延迟"
      - "更新延迟"
      - "索引大小"
      - "分块数量"
    thresholds:
      retrieval_latency_ms: 500
      update_latency_s: 60
      index_size_mb: 100

  # 告警
  alerts:
    - condition: "retrieval_latency > 500ms"
      severity: "warning"
      action: "发送告警"

    - condition: "update_failure"
      severity: "critical"
      action: "发送告警并暂停自动更新"
```

## 索引优化

### 空间优化

```yaml
space_optimization:
  # 去重
  deduplication:
    enabled: true
    method: "content_hash"  # content_hash | semantic_similarity

  # 压缩
  compression:
    enabled: true
    method: "quantization"  # quantization | pruning
    target_dimension: 256  # 压缩后维度

  # 清理
  cleanup:
    orphan_chunks: true  # 清理无引用的分块
    stale_chunks: true   # 清理过期分块
```

### 性能优化

```yaml
performance_optimization:
  # 预计算
  precompute:
    - type: "common_queries"
      queries:
        - "项目架构是什么？"
        - "主要API有哪些？"
        - "如何部署？"
      cache_duration_hours: 24

    - type: "dependencies"
      for_files:
        - "src/index.ts"
        - "src/app.ts"

  # 缓存
  cache:
    query_cache:
      enabled: true
      size: 1000
      ttl_minutes: 60

    embedding_cache:
      enabled: true
      size: 10000
      ttl_days: 7

  # 并行处理
  parallel:
    embedding_workers: 4
    indexing_workers: 2
```

## 索引迁移

```yaml
migration:
  # 迁移触发
  triggers:
    - type: "model_change"
      from: "ada-002"
      to: "ada-003"

    - type: "vector_db_change"
      from: "pinecone"
      to: "weaviate"

  # 迁移流程
  workflow:
    - step: "prepare"
      action: "准备新索引配置"
    - step: "parallel_index"
      action: "并行构建新索引"
    - step: "validate"
      action: "验证新索引"
    - step: "switch"
      action: "切换到新索引"
    - step: "cleanup"
      action: "清理旧索引"
```

---

*索引是RAG的基石，好的索引策略让AI更智能*