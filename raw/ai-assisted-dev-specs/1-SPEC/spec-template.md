# PROJECT.spec.md 模板

> 复制此模板到项目根目录，根据实际情况填写

---

## 元信息

| 字段 | 值 |
|------|-----|
| 项目名称 |  |
| 项目标识 |  |
| 业务领域 |  |
| 技术负责人 |  |
| 创建日期 |  |
| 更新日期 |  |

---

## 架构约束

### 技术栈

```yaml
frontend:
  framework: ""     # 例：Vue 3 / React 18 / Angular
  language: ""      # 例：TypeScript
  state: ""         # 例：Pinia / Redux / Zustand
  style: ""         # 例：Tailwind CSS / Less / SCSS
  build: ""         # 例：Vite / Webpack

backend:
  framework: ""     # 例：NestJS / Spring Boot / FastAPI
  language: ""      # 例：TypeScript / Java / Python
  database: ""      # 例：PostgreSQL / MySQL / MongoDB
  cache: ""         # 例：Redis
  mq: ""            # 例：Kafka / RabbitMQ

infrastructure:
  container: ""     # 例：Docker
  orchestration: "" # 例：K8s
  ci_cd: ""         # 例：GitHub Actions / GitLab CI
```

### 架构模式

```yaml
pattern:
  style: ""         # 例：微服务 / 单体 / Serverless
  api_style: ""     # 例：REST / GraphQL / gRPC
  communication: "" # 例：同步HTTP / 异步消息

layers:
  - name: ""        # 例：表现层
    responsibility: ""
    directory: ""   # 例：src/controllers
  - name: ""        # 例：业务层
    responsibility: ""
    directory: ""   # 例：src/services
  - name: ""        # 例：数据层
    responsibility: ""
    directory: ""   # 例：src/repositories
```

---

## 代码约束

### 命名规范

```yaml
naming:
  # 文件命名
  files:
    components: ""   # 例：PascalCase.vue
    pages: ""        # 例：kebab-case.vue
    utils: ""        # 例：camelCase.ts
    types: ""        # 例：PascalCase.ts

  # 代码命名
  variables: ""      # 例：camelCase
  functions: ""      # 例：camelCase
  classes: ""        # 例：PascalCase
  interfaces: ""     # 例：IPascalCase
  types: ""          # 例：PascalCase
  constants: ""      # 例：UPPER_SNAKE_CASE
  enums: ""          # 例：PascalCase
```

### 代码风格

```yaml
style:
  formatter: ""      # 例：Prettier
  linter: ""         # 例：ESLint
  config_file: ""    # 例：.eslintrc.js

  rules:
    indent: ""       # 例：2 spaces
    quotes: ""       # 例：single
    semicolons: ""   # 例：none
    trailing_comma: "" # 例：es5
```

### 注释规范

```yaml
comments:
  # 文件头注释
  file_header: |
    // 例：
    // @ai-context: [模块描述]
    // @author: [作者]
    // @date: [日期]

  # 函数注释
  function: ""       # 例：JSDoc

  # TODO规范
  todo: ""           # 例：TODO(author): description
```

### 禁止模式

```yaml
forbidden:
  - pattern: ""
    reason: ""
    alternative: ""

  # 例：
  - pattern: "any类型"
    reason: "类型安全"
    alternative: "使用具体类型或泛型"

  - pattern: "console.log"
    reason: "生产环境不应有调试代码"
    alternative: "使用logger工具"

  - pattern: "硬编码配置"
    reason: "配置应可配置"
    alternative: "使用环境变量或配置文件"
```

---

## 业务约束

### 核心业务规则

```yaml
business_rules:
  # 例：用户认证
  user_auth:
    username_min_length: 3
    username_max_length: 20
    password_rules:
      - "至少8个字符"
      - "包含大小写字母"
      - "包含数字"
    login_attempts_limit: 5
    lock_duration_minutes: 15

  # 例：订单状态
  order_status:
    valid_transitions:
      - from: "pending"
        to: ["paid", "cancelled"]
      - from: "paid"
        to: ["shipped", "refunded"]
```

### 数据模型

```yaml
data_models:
  - name: ""
    fields:
      - name: ""
        type: ""
        required: false
        validation: ""

  # 例：
  - name: "User"
    fields:
      - name: "id"
        type: "UUID"
        required: true
      - name: "username"
        type: "string"
        required: true
        validation: "3-20 characters, alphanumeric"
      - name: "email"
        type: "string"
        required: true
        validation: "valid email format"
```

### API规范

```yaml
api:
  base_path: ""      # 例：/api/v1
  auth: ""           # 例：JWT Bearer
  pagination:
    default_page_size: 20
    max_page_size: 100
  response_format:
    success:
      code: 200
      data: "<actual_data>"
    error:
      code: "<http_code>"
      message: "<error_message>"
      details: "<error_details>"
```

---

## 安全约束

### 数据安全

```yaml
security:
  # 敏感字段
  sensitive_fields:
    - name: ""
      action: ""      # 例：encrypt / mask / hash

  # 例：
  - name: "password"
    action: "hash"
  - name: "phone"
    action: "mask"    # 显示为 138****1234
  - name: "id_card"
    action: "encrypt"

  # 加密规则
  encryption:
    algorithm: ""    # 例：AES-256-GCM
    key_management: "" # 例：AWS KMS

  # 脱敏规则
  masking:
    phone: "middle_4"
    id_card: "middle_10"
    email: "name_domain"
```

### 权限控制

```yaml
permissions:
  # 角色定义
  roles:
    - name: ""
      permissions: []

  # 例：
  - name: "admin"
    permissions: ["*"]
  - name: "user"
    permissions: ["read:own", "update:own"]

  # 权限矩阵
  matrix:
    - resource: ""
      actions: []
      roles: []
```

### 审计要求

```yaml
audit:
  # 需要审计的操作
  actions:
    - type: ""       # 例：login, create, update, delete
      log_level: ""  # 例：info, warning, critical

  # 日志格式
  log_format:
    timestamp: ""
    user_id: ""
    action: ""
    resource: ""
    details: ""
```

---

## 示范代码

### 目录结构

```
.claude/code-design/
├── component/          # 组件模板
│   ├── base-component.vue
│   └── form-component.vue
├── page/               # 页面模板
│   ├── list-page.vue
│   └── detail-page.vue
└── utils/              # 工具函数模板
    ├── request.ts
    └── auth.ts
```

### 示例模板

```vue
<!-- 组件模板示例 -->
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// @ai-context: [组件用途描述]
// @author: [作者]
// @date: [日期]

// Props定义
interface Props {
  // 属性定义
}

// Emits定义
interface Emits {
  // 事件定义
}

// 组件逻辑
</script>

<style scoped>
/* 样式 */
</style>
```

---

## 更新日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
|  |  |  |  |

---

*此模板根据项目实际情况填写，建议随项目演进持续更新*