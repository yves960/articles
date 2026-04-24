# SPEC/SKILL/RAG与Beads整合方案

## Beads是什么？

Beads是AI代理的任务追踪器，核心特点：

- **Hash IDs**：`bd-a1b2`格式，多代理协作不会冲突
- **依赖图**：`bd dep add`建立任务依赖关系
- **原子抢占**：`bd update --claim`抢占任务
- **Compaction**：压缩旧任务，节省上下文

**核心问题**："做得怎样？"

## Beads与SKILL的整合

### 技能到任务的映射

```yaml
# SKILL定义能力，Beads追踪执行
skill_to_beads:
  - skill: "code:generate"
    beads_workflow:
      - step: "分析需求"
        type: "task"
        name: "分析需求并设计方案"
      - step: "生成代码"
        type: "task"
        name: "根据SPEC生成代码"
      - step: "验证代码"
        type: "task"
        name: "运行lint和测试"

  - skill: "db:migrate"
    beads_workflow:
      - step: "创建迁移文件"
        type: "task"
        name: "创建数据库迁移文件"
      - step: "审查迁移SQL"
        type: "task"
        name: "审查迁移SQL语句"
        requires_confirmation: true
      - step: "执行迁移"
        type: "task"
        name: "执行数据库迁移"
        requires_confirmation: true
```

### 执行示例

```bash
# 1. 选择SKILL
skill: code:generate "用户登录页面"

# 2. Beads自动创建任务
bd create "用户登录页面" -p 0 -t epic
# 输出: bd-login-epic

bd create "分析需求并设计方案" -p 1 -e bd-login-epic
# 输出: bd-login-epic.1

bd create "根据SPEC生成代码" -p 1 -e bd-login-epic
# 输出: bd-login-epic.2

bd create "运行lint和测试" -p 1 -e bd-login-epic
# 输出: bd-login-epic.3

# 3. 建立依赖
bd dep add bd-login-epic.2 bd-login-epic.1  # 生成依赖分析
bd dep add bd-login-epic.3 bd-login-epic.2  # 测试依赖生成

# 4. 执行
bd ready  # 显示: bd-login-epic.1 (无阻塞)
bd update bd-login-epic.1 --claim  # 抢占任务
# ... 执行分析 ...
bd close bd-login-epic.1 "分析完成"

bd ready  # 显示: bd-login-epic.2 (已无阻塞)
bd update bd-login-epic.2 --claim
# ... 执行生成 ...
bd close bd-login-epic.2 "生成完成"

bd ready  # 显示: bd-login-epic.3
bd update bd-login-epic.3 --claim
# ... 执行测试 ...
bd close bd-login-epic.3 "测试通过"

bd close bd-login-epic "功能完成"
```

## Beads与SPEC的整合

### SPEC作为任务约束

```yaml
# 在Beads任务中注入SPEC约束
task_hooks:
  - trigger: "task_claim"
    action: "inject_spec_constraints"
    template: |
      ## SPEC约束提醒
      
      你正在执行任务: {task_name}
      
      必须遵循以下约束:
      - 技术栈: {tech_stack}
      - 命名规范: {naming_rules}
      - 禁止模式: {forbidden_patterns}
      
      参考模板: {example_templates}

  - trigger: "task_complete"
    action: "validate_spec_compliance"
    checks:
      - "代码风格"
      - "命名规范"
      - "架构约束"
```

### 验证示例

```bash
# 任务完成时自动验证SPEC
bd close bd-login-epic.2 "生成完成"

# 自动触发验证
Validating SPEC compliance for bd-login-epic.2...
✓ 文件命名: login.vue (kebab-case)
✓ 组件语法: Composition API
✓ 没有使用any类型
✓ 使用了Pinia状态管理
⚠ 建议添加注释

# 验证通过，任务关闭
Task bd-login-epic.2 closed successfully.
```

## Beads与RAG的整合

### RAG为任务提供上下文

```yaml
# 任务开始时检索相关知识
task_hooks:
  - trigger: "task_claim"
    action: "retrieve_rag_context"
    query_template: |
      我正在执行任务: {task_name}
      需要了解:
      - 相关的现有代码
      - 相关的文档
      - 类似的历史实现

    inject_to: "task_context"
```

### 检索示例

```bash
bd update bd-login-epic.2 --claim

# 自动触发RAG检索
Retrieving RAG context for task: "根据SPEC生成代码"

Relevant code:
- src/components/Form.vue (相似度 0.85)
- src/api/auth.ts (相似度 0.82)
- src/stores/user.ts (相似度 0.78)

Relevant docs:
- docs/authentication.md (相似度 0.91)
- docs/components.md (相似度 0.75)

Context injected into task bd-login-epic.2

# AI开始执行，有RAG上下文支持
```

## 多代理协作整合

### Beads天然支持多代理

```yaml
# Hash IDs避免冲突
agent_a:
  creates: bd-agent-a-001
  claims: bd-login-epic.1

agent_b:
  creates: bd-agent-b-002
  claims: bd-login-epic.4  # 不依赖agent-a的任务

# 两者可以并行工作
```

### SKILL多代理配置

```yaml
# 定义不同代理的技能范围
agents:
  - id: "code_agent"
    skills:
      - "code:generate"
      - "code:refactor"
      - "test:generate"

  - id: "doc_agent"
    skills:
      - "docs:generate"
      - "docs:update"

  - id: "review_agent"
    skills:
      - "code:review"
      - "test:run"

# Beads任务分配
task_assignment:
  - task_type: "代码生成"
    assign_to: "code_agent"

  - task_type: "文档更新"
    assign_to: "doc_agent"

  - task_type: "代码审查"
    assign_to: "review_agent"
```

### 协作示例

```bash
# 任务分配
bd create "生成登录页面" -p 1
# 输出: bd-login-001

bd create "更新登录文档" -p 1
# 输出: bd-login-002

bd create "审查登录代码" -p 1
# 输出: bd-login-003

# 建立依赖
bd dep add bd-login-003 bd-login-001  # 审查依赖生成

# 不同代理并行执行
# Agent A (code_agent)
bd update bd-login-001 --claim
# ... 生成代码 ...

# Agent B (doc_agent)
bd update bd-login-002 --claim
# ... 更新文档 ...

# Agent A完成后
bd close bd-login-001 "代码生成完成"

# Agent C (review_agent) 可以开始
bd ready  # 显示: bd-login-003
bd update bd-login-003 --claim
# ... 审查代码 ...
```

## Compaction与RAG整合

### Beads Compaction

```bash
# 压缩旧任务，保留关键信息
bd compact

# 原始任务日志（500 tokens）
bd-login-epic.1: 分析需求...
  - 详细分析过程...
  - 中间思考...
  - 最终方案...

bd-login-epic.2: 生成代码...
  - 生成的代码片段...
  - 修改过程...
  - 最终代码...

# Compaction后（50 tokens）
bd-login-epic.1: 分析需求 → 完成
bd-login-epic.2: 生成代码 → login.vue, auth.ts → 完成
```

### RAG存储压缩内容

```yaml
# Compaction内容存入RAG
compaction_to_rag:
  enabled: true
  store_type: "task_history"
  metadata:
    - "task_id"
    - "task_name"
    - "result_summary"
    - "files_modified"
    - "completion_time"
```

## 整合配置

```yaml
# beads-integration.yaml
integration:
  # Beads基础配置
  beads:
    directory: ".beads"
    db: "beads.db"
    auto_compact:
      enabled: true
      schedule: "0 4 * * *"  # 每天凌晨4点

  # SKILL整合
  skill:
    auto_create_tasks: true
    task_prefix: "bd-{skill_id}"
    log_executions: true

  # SPEC整合
  spec:
    validate_on_task_complete: true
    inject_constraints: true

  # RAG整合
  rag:
    retrieve_on_task_claim: true
    store_compaction: true
    update_on_task_complete: true

  # 多代理配置
  multi_agent:
    enabled: true
    agents:
      - id: "code_agent"
        skills: ["code:*"]
      - id: "doc_agent"
        skills: ["docs:*"]
      - id: "review_agent"
        skills: ["code:review", "test:run"]
```

## 整合收益

| 整合点 | 收益 |
|--------|------|
| **SKILL→Beads** | 技能执行有追踪，知道"做得怎样" |
| **SPEC→Beads** | 任务执行有约束，知道"必须怎样" |
| **RAG→Beads** | 任务执行有知识，知道"参考什么" |
| **Beads→RAG** | 任务历史存知识，持续积累经验 |

---

*Beads让SPEC/SKILL/RAG的执行可追踪，形成完整的"设计→约束→能力→追踪→知识"闭环*