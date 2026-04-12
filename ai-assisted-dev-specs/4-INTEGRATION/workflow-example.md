# 完整工作流示例

## 场景：添加用户登录功能

这是一个完整的工作流示例，展示SPEC/SKILL/RAG与OpenSpec/Beads如何协同工作。

---

## 第一步：需求提出

用户提出需求：

```
需要添加一个用户登录功能：
- 用户可以用账号密码登录
- 登录失败5次后锁定15分钟
- 登录成功后跳转到首页
```

---

## 第二步：OpenSpec设计

### 创建proposal.md

```markdown
# proposal.md

## 为什么做
用户需要认证后才能访问个人信息，当前系统缺少登录功能。

## 目标
- 添加登录页面
- 实现认证逻辑
- 添加权限控制

## 非目标
- 第三方登录（OAuth）
- 多因素认证
- 注册功能（已有）

## 影响范围
- 新增：登录页面、认证API
- 修改：路由配置、权限拦截器
```

### 创建design.md

```markdown
# design.md

## 技术决策
选择JWT认证方案。

## 理由
- 无状态，适合前后端分离
- Token可携带用户信息
- 易于扩展（后续可加OAuth）

## 替代方案
- Session认证：需要服务器存储，不适合分布式
- Cookie认证：跨域问题复杂

## 风险评估
- Token过期处理：需要刷新机制
- 安全性：需要HTTPS传输
```

### 创建specs/login.md

```markdown
# specs/login.md

## Scenario 1: 正常登录
- WHEN: 用户输入正确的账号密码
- THEN: 登录成功，返回Token，跳转首页

## Scenario 2: 密码错误
- WHEN: 用户输入错误的密码
- THEN: 显示"密码错误"，记录失败次数

## Scenario 3: 账号锁定
- WHEN: 用户连续失败5次
- THEN: 显示"账号已锁定，请15分钟后重试"

## Scenario 4: Token过期
- WHEN: Token过期
- THEN: 自动刷新Token或跳转登录页
```

### 创建tasks.md

```markdown
# tasks.md

## 任务清单
- [ ] 创建登录页面组件
- [ ] 实现认证API
- [ ] 添加登录状态管理
- [ ] 添加权限拦截器
- [ ] 实现登录失败锁定逻辑
- [ ] 编写测试用例
- [ ] 更新文档
```

---

## 第三步：SPEC验证

系统自动检查设计是否符合项目约束：

```yaml
验证结果:
  ✓ 技术栈: Vue 3 + TypeScript + Tailwind (符合SPEC)
  ✓ 状态管理: 使用Pinia (符合SPEC)
  ✓ API风格: RESTful (符合SPEC)
  ✓ 命名规范: kebab-case文件名 (符合SPEC)
  ⚠ 提示: 登录锁定时间建议使用环境变量配置
```

---

## 第四步：RAG检索

系统检索相关知识：

```yaml
检索结果:
  代码:
    - src/components/Form.vue (表单模板，相似度0.85)
    - src/api/user.ts (用户API，相似度0.82)
    - src/stores/user.ts (用户状态，相似度0.78)

  文档:
    - docs/authentication.md (认证文档，相似度0.91)
    - docs/components.md (组件规范，相似度0.75)

  Issue/PR:
    - #123: "添加注册功能" (参考实现)
    - #89: "认证安全讨论" (安全建议)
```

---

## 第五步：SKILL选择

系统选择合适的技能：

```yaml
技能选择:
  - code:generate (生成代码)
    权限: ✓ 允许
    路径: src/** ✓

  - test:generate (生成测试)
    权限: ✓ 允许
    路径: tests/** ✓

  - docs:update (更新文档)
    权限: ✓ 允许
    路径: docs/** ✓
```

---

## 第六步：Beads任务创建

系统自动创建Beads任务：

```bash
# 创建Epic
bd create "用户登录功能" -p 0 -t epic
# 输出: bd-login-001

# 创建Tasks
bd create "创建登录页面组件" -p 1 -e bd-login-001
# 输出: bd-login-001.1

bd create "实现认证API" -p 1 -e bd-login-001
# 输出: bd-login-001.2

bd create "添加登录状态管理" -p 1 -e bd-login-001
# 输出: bd-login-001.3

bd create "添加权限拦截器" -p 1 -e bd-login-001
# 输出: bd-login-001.4

bd create "实现登录失败锁定逻辑" -p 1 -e bd-login-001
# 输出: bd-login-001.5

bd create "编写测试用例" -p 1 -e bd-login-001
# 输出: bd-login-001.6

bd create "更新文档" -p 1 -e bd-login-001
# 输出: bd-login-001.7

# 建立依赖
bd dep add bd-login-001.4 bd-login-001.3  # 拦截器依赖状态管理
bd dep add bd-login-001.5 bd-login-001.2  # 锁定逻辑依赖API
bd dep add bd-login-001.6 bd-login-001.1 bd-login-001.2 bd-login-001.5  # 测试依赖实现
bd dep add bd-login-001.7 bd-login-001.*  # 文档依赖所有任务
```

---

## 第七步：任务执行

### 执行Task 1: 创建登录页面组件

```bash
bd ready
# 显示: bd-login-001.1, bd-login-001.2, bd-login-001.3 (无依赖阻塞)

bd update bd-login-001.1 --claim
# 注入SPEC约束 + RAG上下文
# AI生成: src/pages/login.vue
bd close bd-login-001.1 "创建完成: login.vue"
```

生成的代码符合SPEC：

```vue
<!-- src/pages/login.vue -->
<script setup lang="ts">
// @ai-context: 用户登录页面
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { loginApi } from '@/api/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLocked = ref(false)

async function handleLogin() {
  // 实现登录逻辑...
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <!-- 使用Tailwind样式 -->
  </form>
</template>
```

### 执行Task 2: 实现认证API

```bash
bd update bd-login-001.2 --claim
# AI生成: src/api/auth.ts
bd close bd-login-001.2 "创建完成: auth.ts"
```

### 执行Task 3: 添加登录状态管理

```bash
bd update bd-login-001.3 --claim
# AI生成: src/stores/auth.ts
bd close bd-login-001.3 "创建完成: auth.ts (Pinia store)"
```

### 执行Task 4: 添加权限拦截器

```bash
bd ready
# 显示: bd-login-001.4 (依赖bd-login-001.3已完成)

bd update bd-login-001.4 --claim
# AI生成: src/router/guards.ts
bd close bd-login-001.4 "创建完成: guards.ts"
```

### 执行Task 5: 实现登录失败锁定逻辑

```bash
bd ready
# 显示: bd-login-001.5 (依赖bd-login-001.2已完成)

bd update bd-login-001.5 --claim
# AI修改: src/api/auth.ts, src/stores/auth.ts
bd close bd-login-001.5 "添加锁定逻辑"
```

### 执行Task 6: 编写测试用例

```bash
bd ready
# 显示: bd-login-001.6 (所有依赖已完成)

bd update bd-login-001.6 --claim
# AI生成: tests/login.test.ts
bd close bd-login-001.6 "测试用例完成，覆盖率92%"
```

### 执行Task 7: 更新文档

```bash
bd update bd-login-001.7 --claim
# AI更新: docs/authentication.md
bd close bd-login-001.7 "文档更新完成"
```

### 关闭Epic

```bash
bd close bd-login-001 "登录功能完成"
```

---

## 第八步：验证与提交

```yaml
验证结果:
  SPEC验证:
    ✓ 命名规范: login.vue, auth.ts
    ✓ 技术栈: Vue 3 Composition API
    ✓ 状态管理: Pinia
    ✓ 没有使用any类型

  测试验证:
    ✓ 单元测试: 12个测试全部通过
    ✓ 覆盖率: 92%

  安全验证:
    ✓ 密码哈希存储
    ✓ 登录失败锁定
    ✓ Token HTTPS传输
```

提交代码：

```bash
git add src/pages/login.vue src/api/auth.ts src/stores/auth.ts tests/login.test.ts
git commit -m "feat: 添加用户登录功能"
git push
```

---

## 第九步：归档与更新

### OpenSpec归档

```bash
mv .openspec/current .openspec/archive/login-feature
```

### Beads Compaction

```bash
bd compact
# 压缩bd-login-001所有任务，保留关键信息
```

### RAG更新

```yaml
# 自动更新索引
新增:
  - src/pages/login.vue
  - src/api/auth.ts
  - src/stores/auth.ts
  - tests/login.test.ts

更新:
  - docs/authentication.md
```

---

## 总结

| 步骤 | 使用的规范 | 输出 |
|------|-----------|------|
| 需求提出 | 无 | 需求描述 |
| OpenSpec设计 | OpenSpec | proposal.md, design.md, specs/*.md, tasks.md |
| SPEC验证 | SPEC | 验证报告 |
| RAG检索 | RAG | 相关代码、文档、Issue |
| SKILL选择 | SKILL | 技能调用计划 |
| Beads创建 | Beads | Epic + Tasks + 依赖关系 |
| 任务执行 | SPEC+SKILL+RAG+Beads | 代码、测试、文档 |
| 验证提交 | SPEC+测试 | 验证报告 + Git提交 |
| 归档更新 | OpenSpec+Beads+RAG | 归档 + Compaction + 索引更新 |

---

*这是一个完整的"设计→约束→能力→追踪→知识→执行→验证→归档"闭环*