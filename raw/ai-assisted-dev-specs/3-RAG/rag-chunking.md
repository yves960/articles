# RAG分块策略

## 为什么分块很重要？

分块决定了AI能"看到"的知识粒度：
- 太大：噪音多，相关性低
- 太小：上下文不完整，理解困难

**目标是找到"刚好合适"的分块大小。**

## 分块方法对比

| 方法 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **AST分块** | 代码 | 保持代码结构完整 | 需要解析器 |
| **行分块** | 代码/配置 | 简单直接 | 可能截断语义 |
| **段落分块** | 文档 | 保持段落完整 | 可能段落过长 |
| **语义分块** | 通用 | 语义连贯 | 计算成本高 |
| **混合分块** | 通用 | 平衡语义和结构 | 配置复杂 |

## 代码分块策略

### AST分块（推荐）

按代码结构分块，保持函数/类的完整性：

```yaml
ast_chunking:
  # JavaScript/TypeScript
  javascript:
    parser: "typescript"
    chunk_types:
      - "function_declaration"
      - "class_declaration"
      - "interface_declaration"
      - "type_declaration"
      - "variable_declaration"
    include_dependencies: true
    include_docstring: true

  # Python
  python:
    parser: "python"
    chunk_types:
      - "function_definition"
      - "class_definition"
    include_dependencies: true
    include_docstring: true

  # Java
  java:
    parser: "java"
    chunk_types:
      - "method_declaration"
      - "class_declaration"
      - "interface_declaration"
```

### 分块示例

```typescript
// 原始代码
export class UserService {
  constructor(private db: Database) {}

  async getUser(id: string): Promise<User | null> {
    return this.db.users.find(id);
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.db.users.create(data);
  }
}

// AST分块结果
Chunk 1: UserService类定义（包含所有方法）
Chunk 2: getUser方法（单独索引，带类上下文）
Chunk 3: createUser方法（单独索引，带类上下文）
```

### 大文件处理

```yaml
large_file_handling:
  # 分块策略
  strategy: "split"

  # 分块大小限制
  max_chunk_size: 500  # tokens

  # 保持结构
  preserve_structure: true

  # 添加上下文
  add_context:
    - "文件路径"
    - "类/模块名称"
    - "依赖关系"
```

## 文档分块策略

### Markdown分块

```yaml
markdown_chunking:
  # 按标题分块
  method: "section"

  # 分块级别
  section_level: 2  # 按 ## 分块

  # 嵌套处理
  nested_handling: "include_subsections"

  # 元数据
  metadata:
    - "title"
    - "section_hierarchy"  # ["文档", "架构", "分层设计"]
    - "url"
```

### 分块示例

```markdown
# 架构设计

## 整体架构
系统采用分层架构...

## 数据层
数据库使用...

## 业务层
服务层实现...

# 分块结果
Chunk 1: 整体架构（包含内容）
Chunk 2: 数据层（包含内容）
Chunk 3: 业务层（包含内容）
```

### API文档分块

```yaml
api_doc_chunking:
  # 按接口分块
  method: "endpoint"

  # 分块内容
  include:
    - "endpoint"
    - "method"
    - "parameters"
    - "response"
    - "examples"

  # 元数据
  metadata:
    - "endpoint"
    - "method"
    - "tags"
```

## 配置文件分块

### JSON/YAML分块

```yaml
config_chunking:
  # 按键分块
  method: "key"

  # 分块深度
  max_depth: 3

  # 处理数组
  array_handling: "flatten"

  # 元数据
  metadata:
    - "file_path"
    - "key_path"  # ["database", "connection", "host"]
```

### 分块示例

```yaml
# 原始配置
database:
  connection:
    host: localhost
    port: 5432
  pool:
    min: 2
    max: 10

api:
  rate_limit: 100

# 分块结果
Chunk 1: database.connection 配置
Chunk 2: database.pool 配置
Chunk 3: api.rate_limit 配置
```

## 混合分块策略

```yaml
hybrid_chunking:
  # 按文件类型选择策略
  by_file_type:
    - types: ["*.ts", "*.js", "*.py"]
      strategy: "ast"

    - types: ["*.md", "*.txt"]
      strategy: "paragraph"

    - types: ["*.json", "*.yaml", "*.toml"]
      strategy: "key"

  # 统一配置
  common:
    max_chunk_size: 500
    min_chunk_size: 100
    overlap: 50
```

## 分块元数据

### 基础元数据

```yaml
base_metadata:
  - "file_path"       # 文件路径
  - "file_type"       # 文件类型
  - "language"        # 编程语言
  - "chunk_id"        # 分块ID
  - "chunk_index"     # 分块序号
  - "total_chunks"    # 总分块数
  - "created_at"      # 创建时间
  - "updated_at"      # 更新时间
```

### 代码元数据

```yaml
code_metadata:
  - "type"            # function | class | module
  - "name"            # 函数/类名
  - "signature"       # 函数签名
  - "docstring"       # 文档字符串
  - "dependencies"    # 依赖列表
  - "exports"         # 导出内容
  - "imports"         # 导入内容
```

### 文档元数据

```yaml
doc_metadata:
  - "title"           # 标题
  - "section"         # 章节名
  - "section_path"    # 章节路径
  - "url"             # URL
  - "author"          # 作者
  - "tags"            # 标签
```

## 分块重叠

### 为什么需要重叠？

防止关键信息被截断：

```yaml
overlap:
  # 重叠大小
  size: 50  # tokens

  # 重叠方式
  method: "sliding"  # sliding | boundary

  # 边界处理
  boundary_handling:
    - type: "function"
      keep_whole: true  # 保持函数完整
    - type: "paragraph"
      keep_whole: true  # 保持段落完整
```

### 重叠示例

```typescript
// Chunk 1 (tokens 0-500)
export class UserService {
  constructor(private db: Database) {}
  async getUser(id: string): Promise<User | null> {
    return this.db.users.find(id);
  }
  // ... (到500 tokens，可能截断)

// Chunk 2 (tokens 450-950) - 重叠50 tokens
  async getUser(id: string): Promise<User | null> {
    return this.db.users.find(id);
  }
  async createUser(data: CreateUserDTO): Promise<User> {
    return this.db.users.create(data);
  }
}
```

## 分块存储

```yaml
storage:
  # 向量存储
  vector_store:
    type: "pinecone"  # pinecone | weaviate | milvus
    dimension: 1536   # ada-002 embedding dimension
    metric: "cosine"

  # 元数据存储
  metadata_store:
    type: "postgres"
    table: "rag_chunks"

  # 原文存储
  content_store:
    type: "s3"
    bucket: "knowledge-base"
```

## 分块最佳实践

1. **保持语义完整**：不要截断函数、段落
2. **添加上下文**：每个分块带足够的背景信息
3. **合理大小**：300-500 tokens通常最佳
4. **记录依赖**：代码分块要记录import/依赖
5. **定期更新**：代码变化后及时更新分块

---

*分块质量决定RAG效果，精心设计分块策略*