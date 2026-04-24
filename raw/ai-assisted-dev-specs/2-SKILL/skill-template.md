# PROJECT.skills.md 模板

> 复制此模板到项目，根据实际情况定义AI技能

---

## 元信息

| 字段 | 值 |
|------|-----|
| 项目名称 |  |
| 版本 |  |
| 更新日期 |  |

---

## 技能清单

### 基础技能

```yaml
basic_skills:
  - id: "code:read"
    name: "代码阅读"
    description: "读取和理解代码"
    enabled: true
    risk_level: "low"

  - id: "code:generate"
    name: "代码生成"
    description: "根据需求生成代码"
    enabled: true
    risk_level: "low"

  - id: "code:refactor"
    name: "代码重构"
    description: "重构现有代码"
    enabled: true
    risk_level: "medium"

  - id: "code:review"
    name: "代码审查"
    description: "审查代码质量"
    enabled: true
    risk_level: "low"
```

### 测试技能

```yaml
test_skills:
  - id: "test:generate"
    name: "测试生成"
    description: "生成测试用例"
    enabled: true
    risk_level: "low"

  - id: "test:run"
    name: "测试运行"
    description: "运行测试套件"
    enabled: true
    risk_level: "low"

  - id: "test:coverage"
    name: "覆盖率分析"
    description: "分析测试覆盖率"
    enabled: true
    risk_level: "low"
```

### 数据库技能

```yaml
db_skills:
  - id: "db:read"
    name: "数据库读取"
    description: "查询数据库"
    enabled: true
    risk_level: "low"

  - id: "db:migrate"
    name: "数据库迁移"
    description: "创建和执行迁移"
    enabled: true
    risk_level: "high"
    requires_confirmation: true

  - id: "db:seed"
    name: "数据填充"
    description: "填充测试数据"
    enabled: true
    risk_level: "medium"
    environments: ["development", "staging"]
```

### 部署技能

```yaml
deploy_skills:
  - id: "deploy:staging"
    name: "部署到测试环境"
    description: "部署到staging"
    enabled: true
    risk_level: "medium"
    requires_confirmation: true

  - id: "deploy:production"
    name: "部署到生产环境"
    description: "部署到production"
    enabled: false  # 禁止AI直接部署
    risk_level: "critical"
```

---

## 工具集成

### 文件操作

```yaml
file_tools:
  read:
    enabled: true
    allowed_paths:
      - "src/**"
      - "tests/**"
      - "docs/**"
      - "*.md"
      - "*.json"
      - "*.yaml"
    forbidden_paths:
      - ".env"
      - ".env.*"
      - "secrets/**"
      - "credentials/**"
      - "*.key"
      - "*.pem"

  write:
    enabled: true
    allowed_paths:
      - "src/**"
      - "tests/**"
      - "docs/**"
    forbidden_paths:
      - ".env"
      - "secrets/**"
      - "credentials/**"

  delete:
    enabled: false  # 禁止删除文件

  create:
    enabled: true
    allowed_paths:
      - "src/**"
      - "tests/**"
```

### 命令执行

```yaml
command_tools:
  allowed_commands:
    # 开发命令
    - "npm run dev"
    - "npm run build"
    - "npm run test"
    - "npm run lint"
    - "npm run format"

    # Git命令
    - "git status"
    - "git diff"
    - "git log"
    - "git branch"
    - "git checkout -b *"
    - "git add *"
    - "git commit -m *"

  forbidden_commands:
    # 危险命令
    - "rm -rf"
    - "git push --force"
    - "git reset --hard"
    - "npm publish"
    - "docker system prune"

  requires_confirmation:
    # 需要确认的命令
    - command: "git push"
      confirm_message: "确认要推送到远程仓库？"

    - command: "npm run deploy"
      confirm_message: "确认要执行部署？"

    - command: "docker-compose up -d"
      confirm_message: "确认要启动Docker容器？"
```

### API访问

```yaml
api_tools:
  # 内部API
  internal_apis:
    - name: ""
      base_url: ""
      auth: ""  # none | api_key | oauth
      allowed_methods:
        - method: "GET"
          path: ""
        - method: "POST"
          path: ""
      forbidden_methods:
        - method: "DELETE"
          path: ""

  # 外部API
  external_apis:
    - name: ""
      provider: ""
      allowed: true
      rate_limit: ""
      allowed_endpoints:
        - ""
      forbidden_endpoints:
        - ""
```

### 数据库访问

```yaml
database_tools:
  query:
    enabled: true
    allowed_operations:
      - "SELECT"
    forbidden_operations:
      - "DROP"
      - "TRUNCATE"
      - "DELETE FROM users"

  migration:
    enabled: true
    requires_confirmation: true
    environments:
      - "development"
      - "staging"

  seed:
    enabled: true
    environments:
      - "development"
      - "staging"
```

---

## 上下文感知

### 术语表

```yaml
glossary:
  # 业务术语
  - term: ""
    meaning: ""
    examples: []
    context: ""

  # 示例
  - term: "SPU"
    meaning: "标准产品单位，商品的最小分类单位"
    examples: ["iPhone 15", "MacBook Pro"]
    context: "商品管理、库存管理"

  - term: "SKU"
    meaning: "库存单位，SPU的具体规格"
    examples: ["iPhone 15 黑色 128G"]
    context: "库存、订单"
```

### 领域知识

```yaml
domain_knowledge:
  - area: ""
    description: ""
    key_concepts: []
    key_entities: []
    business_flows: []

  # 示例
  - area: "订单"
    description: "订单管理领域"
    key_concepts:
      - "订单状态流转：待支付 → 已支付 → 待发货 → 已发货 → 已完成"
      - "订单金额 = 商品金额 + 运费 - 优惠金额"
    key_entities:
      - "Order"
      - "OrderItem"
      - "Payment"
    business_flows:
      - "创建订单 → 支付 → 发货 → 完成"
      - "创建订单 → 取消"
```

### 角色理解

```yaml
roles:
  - name: ""
    description: ""
    permissions: []

  # 示例
  - name: "运营"
    description: "日常运营人员"
    permissions:
      - "read:product"
      - "write:product"
      - "read:order"

  - name: "财务"
    description: "财务人员"
    permissions:
      - "read:order"
      - "read:finance"
      - "write:finance"
```

---

## 操作边界

### 允许的操作

```yaml
allowed_operations:
  # 代码相关
  code:
    - "读取任何代码文件"
    - "修改源代码"
    - "添加新文件"
    - "修改测试用例"

  # 文档相关
  docs:
    - "读取文档"
    - "修改文档"

  # 配置相关
  config:
    - "读取配置文件"
    - "修改非敏感配置"
```

### 禁止的操作

```yaml
forbidden_operations:
  # 安全相关
  security:
    - "读取或修改密钥文件"
    - "读取或修改环境变量"
    - "导出敏感数据"

  # 基础设施相关
  infrastructure:
    - "修改生产环境配置"
    - "部署到生产环境"
    - "修改CI/CD配置"

  # 数据相关
  data:
    - "批量删除数据"
    - "修改审计日志"
    - "执行高危SQL"
```

### 需要确认的操作

```yaml
requires_confirmation_operations:
  - operation: ""
    trigger: ""
    confirm_message: ""
    confirm_with: ""  # who needs to confirm

  # 示例
  - operation: "删除文件"
    trigger: "任何文件删除操作"
    confirm_message: "确认要删除文件 ${file_path}？"
    confirm_with: "developer"

  - operation: "数据库迁移"
    trigger: "创建或执行迁移"
    confirm_message: "确认要执行数据库迁移？"
    confirm_with: "tech_lead"
```

---

## 条件性技能

```yaml
conditional_skills:
  # 根据分支调整
  - condition: "branch == 'main'"
    effect:
      requires_confirmation:
        - "任何代码修改"
      forbidden:
        - "直接修改代码"

  # 根据环境调整
  - condition: "environment == 'production'"
    effect:
      enabled: false
      skills:
        - "deploy:production"

  # 根据用户角色调整
  - condition: "user.role == 'admin'"
    effect:
      enabled: true
      skills:
        - "deploy:production"
```

---

## 更新日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
|  |  |  |  |

---

*此模板根据项目实际情况填写，建议随项目演进持续更新*