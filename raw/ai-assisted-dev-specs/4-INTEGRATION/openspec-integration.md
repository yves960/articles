# SPEC/SKILL/RAG与OpenSpec整合方案

## 整合架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        整合架构                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   OpenSpec（设计层）                                               │
│   proposal.md → design.md → specs/*.md → tasks.md                │
│         ↓ 继承                                                    │
│                                                                   │
│   SPEC（项目约束层）                                               │
│   PROJECT.spec.md                                                 │
│         ↓ 实现                                                    │
│                                                                   │
│   SKILL（能力层）                                                  │
│   PROJECT.skills.md                                               │
│         ↓ 执行                                                    │
│                                                                   │
│   Beads（执行追踪层）                                              │
│   Task依赖图 + 状态追踪                                            │
│         ←→                                                        │
│                                                                   │
│   RAG（知识层）                                                    │
│   PROJECT.rag.md                                                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 各层职责对比

| 层级 | 核心问题 | 职责 | 生命周期 |
|------|----------|------|----------|
| **OpenSpec** | 做什么功能？ | 设计文档链 | 单次变更 |
| **SPEC** | 必须怎样做？ | 项目级约束 | 项目全程 |
| **SKILL** | 能做什么？ | AI能力定义 | 项目全程 |
| **Beads** | 做得怎样？ | 任务追踪 | 单次任务 |
| **RAG** | 需要知道什么？ | 知识检索 | 项目全程 |

## OpenSpec与SPEC的关系

### OpenSpec是什么？

OpenSpec定义变更的设计文档链：

```
proposal.md → design.md → specs/*.md → tasks.md → 归档
   (为什么做)   (怎么做)    (做成什么样)  (分几步做)
```

### SPEC与OpenSpec的区别

| 维度 | OpenSpec | SPEC |
|------|----------|------|
| **范围** | 单次变更 | 整个项目 |
| **内容** | 功能规格 | 项目约束 |
| **示例** | "添加登录功能" | "Vue3 + TypeScript + Tailwind" |
| **生命周期** | 变更完成后归档 | 项目全程有效 |

### 整合方式

```yaml
# OpenSpec的specs/*.md定义功能规格
specs:
  - name: "登录功能"
    scenarios:
      - when: "用户输入正确账号密码"
        then: "登录成功，跳转首页"

# SPEC定义项目约束
constraints:
  tech_stack:
    frontend: "Vue 3"
    language: "TypeScript"
  naming:
    files: "kebab-case"
  forbidden:
    - "any类型"

# 整合：OpenSpec的功能规格在SPEC约束下实现
```

## 工作流整合

### 新功能开发流程

```
1. OpenSpec阶段
   ├── 创建proposal.md（为什么做）
   ├── 创建design.md（怎么做）
   ├── 创建specs/*.md（做成什么样）
   └── 创建tasks.md（分几步做）

2. SPEC验证阶段
   ├── 检查是否符合项目约束
   ├── 使用示范模板
   └── 参考视觉设计稿

3. RAG检索阶段
   ├── 检索相关代码
   ├── 检索相关文档
   └── 检索历史Issue/PR

4. SKILL执行阶段
   ├── 选择合适的技能
   ├── 检查操作权限
   └── 需要确认的操作

5. Beads追踪阶段
   ├── 创建Epic
   ├── 创建Task
   ├── 建立依赖关系
   └── 追踪执行状态

6. 实现阶段
   ├── AI生成代码
   ├── SPEC验证
   ├── 测试验证
   └── 提交代码

7. 归档阶段
   ├── OpenSpec归档
   ├── Beads关闭
   └── RAG更新索引
```

### 整合示例

```yaml
# 一个登录功能开发的完整流程

# 1. OpenSpec创建设计文档
proposal.md:
  - title: "添加用户登录功能"
  - why: "用户需要认证后才能访问个人信息"
  - goals: ["登录页面", "认证逻辑", "权限控制"]

design.md:
  - decision: "使用JWT认证"
  - alternative: ["Session认证（已否决）"]
  - risk: ["Token过期处理"]

specs/login.md:
  - scenario_1:
      when: "用户输入正确账号密码"
      then: "登录成功，跳转首页"
  - scenario_2:
      when: "用户输入错误密码"
      then: "显示错误提示，计数失败次数"

tasks.md:
  - [ ] 创建登录页面组件
  - [ ] 实现认证API
  - [ ] 添加权限拦截器
  - [ ] 编写测试用例

# 2. SPEC验证
验证点:
  - 组件使用Vue 3 Composition API ✓
  - 文件命名kebab-case ✓
  - 没有使用any类型 ✓
  - 使用Pinia状态管理 ✓

# 3. RAG检索
检索结果:
  - 相关组件: src/components/Form.vue（表单模板）
  - 相关API: src/api/auth.ts（认证接口）
  - 相关文档: docs/authentication.md

# 4. SKILL执行
技能选择:
  - code:generate（生成代码）
  - test:generate（生成测试）

# 5. Beads追踪
Epic: bd-login-001 "用户登录功能"
Tasks:
  - bd-login-001.1 "创建登录页面"
  - bd-login-001.2 "实现认证API"
  - bd-login-001.3 "添加权限拦截器"
  - bd-login-001.4 "编写测试用例"

依赖关系:
  - bd-login-001.2 blocks bd-login-001.1
  - bd-login-001.3 blocks bd-login-001.2
  - bd-login-001.4 relates_to bd-login-001.*

# 6. 实现
AI生成代码 → SPEC验证 → 测试验证 → 提交

# 7. 归档
OpenSpec归档到 .archive/login-feature/
Beads关闭所有Task
RAG更新索引（新增登录相关代码）
```

## 文件结构整合

```
project/
├── .openspec/                    # OpenSpec设计文档
│   ├── current/                  # 当前变更
│   │   ├── proposal.md
│   │   ├── design.md
│   │   ├── specs/
│   │   │   └── login.md
│   │   └── tasks.md
│   └── archive/                  # 已完成变更
│       └── login-feature/
│
├── .claude/                      # SPEC/SKILL/RAG配置
│   ├── PROJECT.spec.md           # 项目约束
│   ├── PROJECT.skills.md         # AI技能
│   ├── PROJECT.rag.md            # RAG配置
│   ├── code-design/              # 示范模板
│   │   ├── pro-table/
│   │   └── pro-form/
│   └── ui-design/                # 视觉设计稿
│       └── login.html
│
├── .beads/                       # Beads任务追踪
│   ├── beads.db                  # 任务数据库
│   └── config.yaml               # Beads配置
│
├── src/                          # 源代码
│   ├── pages/
│   │   └── login.vue             # 生成的登录页面
│   ├── api/
│   │   └── auth.ts               # 生成的认证API
│   └── stores/
│       └── auth.ts               # 生成的认证状态
│
└── tests/                        # 测试
    └── login.test.ts
```

## 配置整合

```yaml
# 整合配置文件
integration:
  # OpenSpec配置
  openspec:
    enabled: true
    directory: ".openspec"
    auto_archive: true

  # SPEC配置
  spec:
    enabled: true
    file: ".claude/PROJECT.spec.md"
    validate_before_generate: true

  # SKILL配置
  skill:
    enabled: true
    file: ".claude/PROJECT.skills.md"
    log_executions: true

  # RAG配置
  rag:
    enabled: true
    file: ".claude/PROJECT.rag.md"
    auto_update: true

  # Beads配置
  beads:
    enabled: true
    directory: ".beads"
    auto_create_from_tasks: true

  # 整合流程
  workflow:
    - name: "validate_spec"
      trigger: "before_generate"
      action: "SPEC验证"

    - name: "retrieve_context"
      trigger: "before_generate"
      action: "RAG检索"

    - name: "check_skill"
      trigger: "before_execute"
      action: "SKILL权限检查"

    - name: "create_beads"
      trigger: "after_tasks_created"
      action: "创建Beads任务"

    - name: "archive_openspec"
      trigger: "after_completion"
      action: "归档OpenSpec"

    - name: "update_rag"
      trigger: "after_completion"
      action: "更新RAG索引"
```

## 整合收益

### 设计阶段收益

- OpenSpec提供结构化设计流程
- SPEC确保设计符合项目约束
- RAG提供历史决策参考

### 执行阶段收益

- SKILL定义AI操作边界
- Beads追踪任务执行状态
- SPEC验证代码合规

### 追溯阶段收益

- OpenSpec归档提供设计追溯
- Beads记录执行历史
- RAG持续更新知识库

---

*整合是让各层协同工作的关键，设计→约束→能力→追踪→知识，形成完整闭环*