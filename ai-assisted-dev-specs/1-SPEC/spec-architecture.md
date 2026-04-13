# SPEC规范架构设计

## 什么是SPEC？

SPEC（Specification）是项目级规范的"宪法"，定义AI在这个项目中必须遵循的硬性约束。

**核心问题**："必须怎样做？"

**为什么需要SPEC？**

AI像一个超级聪明但没有上下文的新员工：
- 你说"写一个用户登录功能"，它用React，但你们项目是Vue
- 你说"优化数据库查询"，它用了PostgreSQL特有语法，但你们用MySQL
- 你说"添加错误处理"，它用英文提示，但你们产品是中文

**这不是AI能力不够，是约束不够。**

## SPEC的三层约束

参考得物实战的三层规范体系：

### 第一层：约束层（Constraints）

告诉AI **"禁止什么、必须怎样"**

```yaml
# 约束类型
- 技术栈约束：语言、框架、数据库、中间件
- 架构约束：分层、模块化、API风格
- 代码约束：命名规范、代码风格、禁止模式
- 安全约束：数据脱敏、权限控制、审计日志
- 业务约束：业务规则、数据模型、边界条件
```

### 第二层：示范层（Examples）

告诉AI **"标准产出长什么样"**

```
.claude/code-design/
├── pro-table/          # 通用列表页模板
├── pro-form/           # 通用表单页模板
├── editable-pro-table/ # 可编辑表格模板
├── drawer/             # 抽屉组件模板
├── component/          # 通用组件模板
└── utils/             # 工具函数模板
```

**示范代码的价值**：AI可以直接继承模式，一次生成符合团队风格的代码。

### 第三层：视觉层（Visual）

告诉AI **"页面应该长什么样"**

```
.claude/ui-design/
├── knowledge-spaces.html   # 知识空间列表页设计稿
├── search-strategy.html    # 检索配置页设计稿
└── space-detail.html       # 空间详情页设计稿
```

**实践中，提供HTML设计稿后，AI生成的UI与设计意图吻合度明显更高。**

## SPEC文件结构

```markdown
# PROJECT.spec.md

## 元信息
- 项目名称：
- 业务领域：
- 技术栈：

## 架构约束
### 技术栈
- 前端：
- 后端：
- 数据库：
- 中间件：

### 架构模式
- 分层架构：
- API风格：
- 状态管理：

## 代码约束
### 命名规范
- 文件命名：
- 变量命名：
- 函数命名：

### 代码风格
- 格式化工具：
- Lint规则：
- 注释规范：

### 禁止模式
- 禁止使用any类型
- 禁止直接操作DOM
- 禁止硬编码配置

## 业务约束
### 核心业务规则
- 用户认证：
- 权限模型：
- 数据流：

### 数据模型
- 核心实体：
- 关系图：
- 校验规则：

## 安全约束
### 数据安全
- 敏感字段：
- 加密规则：
- 脱敏规则：

### 权限控制
- 角色定义：
- 权限矩阵：
- 审计要求：
```

## SPEC与OpenSpec的关系

| 维度 | OpenSpec | SPEC |
|------|----------|------|
| 层级 | 功能规格 | 项目约束 |
| 范围 | 单次变更 | 整个项目 |
| 内容 | 做什么 | 怎么做 |
| 生命周期 | 变更完成后归档 | 项目全程有效 |

**整合方式**：

```
OpenSpec的specs/*.md → 定义"做什么功能"
         ↓ 约束
PROJECT.spec.md → 定义"必须怎样做"
         ↓ 验证
AI实现代码
```

## SPEC验证机制

### 静态验证

```bash
# 检查SPEC完整性
spec validate --check-all

# 检查代码是否符合SPEC
spec check src/ --rules spec.md
```

### 动态验证

```yaml
# AI执行前验证
pre_action_hooks:
  - check_spec_compliance
  - validate_constraints

# AI执行后验证
post_action_hooks:
  - lint_check
  - test_coverage
  - security_scan
```

## 实践案例

### 案例1：技术栈约束

```yaml
# PROJECT.spec.md
tech_stack:
  frontend:
    framework: Vue 3
    state: Pinia
    style: Tailwind CSS
  backend:
    framework: NestJS
    database: PostgreSQL
    cache: Redis
```

**效果**：AI不再建议React方案，自动使用Vue组合式API。

### 案例2：命名规范

```yaml
# PROJECT.spec.md
naming:
  files: kebab-case      # user-profile.vue
  components: PascalCase # UserProfile
  functions: camelCase   # getUserProfile
  constants: UPPER_SNAKE  # MAX_RETRY_COUNT
```

**效果**：生成的文件名、组件名自动符合规范。

### 案例3：业务规则

```yaml
# PROJECT.spec.md
business_rules:
  user_auth:
    - 用户名长度：3-20字符
    - 密码规则：至少8位，包含大小写和数字
    - 登录失败锁定：5次失败后锁定15分钟
```

**效果**：AI生成的表单验证规则自动符合业务要求。

## 下一步

1. 复制 `spec-template.md` 到项目
2. 根据项目实际情况填写
3. 配置验证钩子
4. 持续迭代优化

---

*参考：得物技术AI编程能力边界探索*