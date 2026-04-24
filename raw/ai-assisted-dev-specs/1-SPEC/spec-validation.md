# SPEC规范验证机制

## 为什么需要验证？

有了SPEC，还需要确保AI真的遵循它。验证机制分三层：

```
┌─────────────────────────────────────────────────┐
│                  SPEC验证三层                    │
├─────────────────────────────────────────────────┤
│  静态验证    │  动态验证    │  运行验证    │
│  代码生成前   │  代码生成后   │  代码运行时   │
└─────────────────────────────────────────────────┘
```

## 第一层：静态验证

在AI生成代码**之前**，检查SPEC本身的完整性和一致性。

### SPEC完整性检查

```bash
# 检查SPEC文件是否完整
spec validate PROJECT.spec.md

# 输出示例
✓ 元信息: 完整
✓ 架构约束: 完整
✓ 代码约束: 完整
✗ 业务约束: 缺少核心业务规则
✗ 安全约束: 缺少敏感字段定义
```

### 约束一致性检查

```yaml
# 检查约束之间是否有冲突
constraints_check:
  - rule: "禁止使用any类型"
    check: "代码约束.禁止模式"

  - rule: "TypeScript项目"
    check: "架构约束.技术栈.language == TypeScript"
    depends_on: "禁止使用any类型"

  - rule: "REST API"
    check: "架构约束.api_style == REST"
    conflicts_with: "GraphQL查询语法"
```

### AI提示词注入

在AI生成代码前，自动注入SPEC约束：

```markdown
# AI提示词模板

你现在正在为项目 [PROJECT_NAME] 生成代码。

## 必须遵循的约束

### 技术栈
- 前端框架：Vue 3 (Composition API)
- 状态管理：Pinia
- 样式：Tailwind CSS
- 后端框架：NestJS
- 数据库：PostgreSQL

### 代码规范
- 文件命名：kebab-case
- 组件命名：PascalCase
- 禁止使用 any 类型
- 禁止硬编码配置

### 业务规则
- 用户名长度：3-20字符
- 密码规则：至少8位，包含大小写和数字
- 登录失败锁定：5次失败后锁定15分钟

### 安全要求
- 密码必须哈希存储
- 手机号脱敏显示
- 敏感操作需要审计日志

## 参考模板

请参考 .claude/code-design/ 目录下的模板代码。
```

## 第二层：动态验证

在AI生成代码**之后**，自动检查是否符合SPEC。

### 代码风格检查

```yaml
# .claude/hooks/post_generate.yaml
hooks:
  - name: "lint_check"
    command: "npm run lint"
    on_fail: "warn"  # warn | error | block

  - name: "type_check"
    command: "npm run type-check"
    on_fail: "error"

  - name: "format_check"
    command: "npm run format:check"
    on_fail: "warn"
```

### 架构约束检查

```yaml
# 检查生成的代码是否符合架构约束
architecture_check:
  - rule: "Vue组件必须使用Composition API"
    pattern: "setup\\(\\)"
    files: "**/*.vue"

  - rule: "API必须返回统一格式"
    pattern: "\\{ code: \\d+, data: .+, message: .+ \\}"
    files: "**/controllers/**/*.ts"

  - rule: "Service不能直接访问数据库"
    pattern: "repository\\."
    files: "**/services/**/*.ts"
    allow: false  # 不允许出现
```

### 命名规范检查

```yaml
# 检查命名是否符合规范
naming_check:
  - rule: "组件文件使用PascalCase"
    pattern: "[A-Z][a-zA-Z]+\\.vue$"
    files: "**/components/**/*.vue"

  - rule: "页面文件使用kebab-case"
    pattern: "[a-z]+(-[a-z]+)*\\.vue$"
    files: "**/pages/**/*.vue"

  - rule: "常量使用UPPER_SNAKE_CASE"
    pattern: "[A-Z][A-Z0-9_]*"
    type: "const"
```

### 业务规则检查

```yaml
# 检查业务逻辑是否符合规则
business_check:
  - rule: "密码验证规则"
    find: "password.*validate"
    must_contain:
      - "minLength.*8"
      - "pattern.*[A-Z]"
      - "pattern.*[a-z]"
      - "pattern.*[0-9]"

  - rule: "登录失败锁定"
    find: "login.*attempt"
    must_contain:
      - "attempts.*limit.*5"
      - "lock.*duration.*15"
```

## 第三层：运行验证

代码生成后，通过**测试**验证实际行为是否符合SPEC。

### 测试生成

根据SPEC自动生成测试用例：

```yaml
# 从业务规则生成测试
test_generation:
  - from: "business_rules.user_auth"
    generate:
      - "test_username_length_boundaries"
      - "test_password_complexity"
      - "test_login_lockout"

  - from: "business_rules.order_status"
    generate:
      - "test_order_status_transitions"
      - "test_invalid_transitions"
```

### 测试模板

```typescript
// 从SPEC生成的测试模板
describe('用户认证', () => {
  // 从 business_rules.user_auth.username_min_length 生成
  test('用户名最小长度为3', () => {
    // 测试代码
  });

  // 从 business_rules.user_auth.password_rules 生成
  test('密码必须包含大小写和数字', () => {
    // 测试代码
  });

  // 从 business_rules.user_auth.login_attempts_limit 生成
  test('登录失败5次后锁定15分钟', () => {
    // 测试代码
  });
});
```

### 运行时检查

```typescript
// 运行时约束检查
import { validateSpec } from '@project/spec-validator';

// 在关键路径添加检查
async function login(username: string, password: string) {
  // 运行时验证
  validateSpec('user_auth', {
    username_length: username.length >= 3 && username.length <= 20,
    password_complexity: checkPasswordComplexity(password),
  });

  // 业务逻辑
}
```

## 验证工作流

```
AI生成代码
    ↓
静态验证（SPEC完整性）
    ↓ 不通过 → 提示补充SPEC
动态验证（代码风格、架构约束）
    ↓ 不通过 → 自动修复或提示
运行验证（测试）
    ↓ 不通过 → AI修复
代码提交
```

## 验证结果反馈

```yaml
# 验证报告格式
validation_report:
  timestamp: "2024-01-15T10:30:00Z"
  spec_version: "1.2.0"

  static:
    status: "pass"
    checks: 15
    passed: 15

  dynamic:
    status: "warn"
    checks: 10
    passed: 8
    warnings:
      - "文件命名不规范: userProfile.vue → UserProfile.vue"
      - "缺少类型定义: getUserProfile返回值"

  runtime:
    status: "fail"
    tests: 20
    passed: 18
    failures:
      - "test_password_complexity: 密码验证规则不完整"
```

## 持续改进

### 验证规则演进

```yaml
# 从验证失败中学习
learning:
  - trigger: "naming_check.fail"
    action: "add_to_spec"
    suggest: "是否需要添加此命名规则到SPEC？"

  - trigger: "business_check.fail"
    action: "update_spec"
    suggest: "业务规则可能需要更新"
```

### SPEC版本管理

```yaml
# SPEC版本演进
spec_versions:
  - version: "1.0.0"
    date: "2024-01-01"
    changes:
      - "初始版本"

  - version: "1.1.0"
    date: "2024-01-15"
    changes:
      - "添加密码复杂度规则"
      - "添加登录锁定规则"
    reason: "从验证失败中学到的规则"
```

---

*验证是SPEC落地的保障，没有验证的SPEC只是一份文档*