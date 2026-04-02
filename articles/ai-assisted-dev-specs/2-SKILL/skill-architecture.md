# SKILL技能规范架构设计

## 什么是SKILL？

SKILL定义AI在这个项目中**能做什么**，包括可用工具、操作边界、权限级别。

**核心问题**："能做什么？"

**为什么需要SKILL？**

即使有了SPEC约束"必须怎样做"，AI还需要知道：
- 我能访问哪些API？
- 我能执行哪些命令？
- 我能修改哪些文件？
- 哪些操作需要人工确认？

**SKILL是AI的能力边界定义。**

## SKILL的三层定义

### 第一层：技能清单

定义AI可以使用的技能列表：

```yaml
skills:
  - name: "代码生成"
    description: "根据需求生成代码"
    enabled: true
    risk_level: "low"

  - name: "数据库迁移"
    description: "创建和执行数据库迁移"
    enabled: true
    risk_level: "high"
    requires_confirmation: true

  - name: "部署发布"
    description: "部署到生产环境"
    enabled: false  # 禁止AI直接部署
    risk_level: "critical"
```

### 第二层：工具集成

定义AI可以使用的具体工具：

```yaml
tools:
  # 文件操作
  file:
    read: true
    write: true
    delete: false  # 禁止删除文件
    allowed_paths:
      - "src/**"
      - "tests/**"
    forbidden_paths:
      - ".env"
      - "secrets/**"
      - "credentials/**"

  # 命令执行
  command:
    allowed:
      - "npm run *"
      - "git status"
      - "git diff"
    forbidden:
      - "rm -rf"
      - "git push --force"
    requires_confirmation:
      - "npm run deploy"
      - "git push"

  # API访问
  api:
    internal:
      - name: "user-service"
        base_url: "${USER_SERVICE_URL}"
        allowed_endpoints:
          - "GET /users/*"
          - "POST /users"
        forbidden_endpoints:
          - "DELETE /users/*"

    external:
      - name: "openai"
        allowed: true
        rate_limit: "100/hour"
```

### 第三层：上下文感知

定义AI如何理解项目特定概念：

```yaml
context:
  # 术语表
  glossary:
    - term: "SPU"
      meaning: "标准产品单位，商品的最小分类单位"
      examples: ["iPhone 15", "MacBook Pro"]

    - term: "SKU"
      meaning: "库存单位，SPU的具体规格"
      examples: ["iPhone 15 黑色 128G", "MacBook Pro 银色 512G"]

    - term: "上游"
      meaning: "供应链上游，指供应商"
      context: "采购、入库场景"

    - term: "下游"
      meaning: "供应链下游，指销售渠道"
      context: "订单、发货场景"

  # 领域知识
  domain_knowledge:
    - area: "供应链"
      concepts:
        - "采购单 → 入库单 → 库存"
        - "订单 → 出库单 → 发货"
      key_entities: ["SPU", "SKU", "仓库", "供应商"]

  # 角色理解
  roles:
    - name: "运营"
      permissions: ["read:product", "write:product", "read:order"]
    - name: "财务"
      permissions: ["read:order", "read:finance", "write:finance"]
```

## SKILL文件结构

```markdown
# PROJECT.skills.md

## 技能清单
定义可用的技能

## 工具集成
定义可用的工具和权限

## 上下文感知
定义项目特定概念

## 操作边界
定义允许和禁止的操作

## 审批流程
定义需要确认的操作
```

## SKILL与SPEC的关系

```
SPEC（约束层）
    ↓ 约束
SKILL（能力层）
    ↓ 执行
代码/操作
```

**SPEC定义"必须怎样"，SKILL定义"能做什么"**

```yaml
# SPEC约束
spec:
  code:
    naming: "camelCase for functions"

# SKILL能力
skill:
  tools:
    file:
      write: true
      allowed_paths: ["src/**"]

# 结果：AI只能用camelCase命名函数，且只能在src目录写文件
```

## 操作边界定义

### 允许的操作

```yaml
allowed:
  # 读取操作
  read:
    - "读取源代码"
    - "读取配置文件"
    - "读取文档"

  # 写入操作
  write:
    - "修改源代码"
    - "添加新文件"
    - "修改测试用例"

  # 执行操作
  execute:
    - "运行测试"
    - "运行lint"
    - "运行本地开发服务器"
```

### 禁止的操作

```yaml
forbidden:
  # 安全相关
  security:
    - "删除生产数据库"
    - "修改用户权限"
    - "暴露敏感信息"

  # 基础设施相关
  infrastructure:
    - "修改生产环境配置"
    - "部署到生产环境"
    - "修改CI/CD配置"

  # 数据相关
  data:
    - "批量删除用户数据"
    - "修改审计日志"
    - "导出敏感数据"
```

### 需要确认的操作

```yaml
requires_confirmation:
  # 代码相关
  code:
    - action: "删除文件"
      confirm_with: "确认要删除 ${file_path}？"

    - action: "修改核心模块"
      confirm_with: "这是核心模块，确认要修改？"

  # 数据库相关
  database:
    - action: "创建迁移"
      confirm_with: "确认要创建数据库迁移？"

    - action: "执行迁移"
      confirm_with: "确认要执行数据库迁移？这将修改数据库结构。"

  # 发布相关
  release:
    - action: "合并到main"
      confirm_with: "确认要合并到main分支？"

    - action: "创建发布"
      confirm_with: "确认要创建发布？"
```

## 技能注册表

维护一个技能索引，方便查找和复用：

```yaml
# skill-registry.yaml
skills:
  # 基础技能
  - id: "code:generate"
    name: "代码生成"
    description: "根据需求生成代码"
    category: "基础"
    risk: "low"

  - id: "code:refactor"
    name: "代码重构"
    description: "重构现有代码"
    category: "基础"
    risk: "medium"

  - id: "test:generate"
    name: "测试生成"
    description: "生成测试用例"
    category: "测试"
    risk: "low"

  - id: "db:migrate"
    name: "数据库迁移"
    description: "创建和执行数据库迁移"
    category: "数据库"
    risk: "high"
    requires_confirmation: true

  - id: "deploy:staging"
    name: "部署到测试环境"
    description: "部署到staging环境"
    category: "部署"
    risk: "medium"
    requires_confirmation: true

  - id: "deploy:production"
    name: "部署到生产环境"
    description: "部署到production环境"
    category: "部署"
    risk: "critical"
    enabled: false  # 禁止
```

## SKILL与Beads的整合

每个SKILL可以映射到Beads任务：

```yaml
# SKILL到Beads的映射
skill_to_beads:
  - skill: "code:generate"
    beads:
      - type: "task"
        name: "分析需求"
      - type: "task"
        name: "生成代码"
      - type: "task"
        name: "验证代码"

  - skill: "db:migrate"
    beads:
      - type: "task"
        name: "创建迁移文件"
      - type: "task"
        name: "审查迁移SQL"
        requires_confirmation: true
      - type: "task"
        name: "执行迁移"
        requires_confirmation: true
```

## 动态SKILL

根据上下文动态调整SKILL：

```yaml
# 条件性SKILL
conditional_skills:
  - condition: "branch == 'main'"
    effect:
      forbidden:
        - "直接修改代码"
      requires_confirmation:
        - "任何修改"

  - condition: "environment == 'production'"
    effect:
      enabled: false
      skills:
        - "deploy:production"

  - condition: "user.role == 'admin'"
    effect:
      enabled: true
      skills:
        - "deploy:production"
```

## SKILL执行日志

记录AI执行的所有操作：

```yaml
# 执行日志
execution_log:
  - timestamp: "2024-01-15T10:30:00Z"
    skill: "code:generate"
    action: "生成用户登录页面"
    user: "developer"
    result: "success"
    files_modified:
      - "src/pages/login.vue"
      - "src/api/auth.ts"

  - timestamp: "2024-01-15T10:35:00Z"
    skill: "db:migrate"
    action: "创建用户表迁移"
    user: "developer"
    result: "confirmed"
    confirmed_by: "tech_lead"
```

## 下一步

1. 复制 `skill-template.md` 到项目
2. 定义项目特定技能
3. 配置工具权限
4. 设置审批流程

---

*SKILL是AI能力的边界，定义清晰才能安全使用*