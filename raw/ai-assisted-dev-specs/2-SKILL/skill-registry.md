# 技能注册表

> 维护一个技能索引，方便查找和复用

## 技能分类

### 代码类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| code:read | 代码阅读 | 读取和理解代码 | low | 否 |
| code:generate | 代码生成 | 根据需求生成代码 | low | 否 |
| code:refactor | 代码重构 | 重构现有代码 | medium | 否 |
| code:review | 代码审查 | 审查代码质量 | low | 否 |
| code:document | 代码文档 | 生成代码文档 | low | 否 |
| code:optimize | 代码优化 | 优化代码性能 | medium | 否 |

### 测试类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| test:generate | 测试生成 | 生成测试用例 | low | 否 |
| test:run | 测试运行 | 运行测试套件 | low | 否 |
| test:coverage | 覆盖率分析 | 分析测试覆盖率 | low | 否 |
| test:mock | Mock生成 | 生成Mock数据 | low | 否 |

### 数据库类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| db:read | 数据库读取 | 查询数据库 | low | 否 |
| db:query | 查询优化 | 优化SQL查询 | medium | 否 |
| db:migrate | 数据库迁移 | 创建和执行迁移 | high | 是 |
| db:seed | 数据填充 | 填充测试数据 | medium | 否 |
| db:backup | 数据备份 | 备份数据库 | medium | 是 |

### 部署类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| deploy:build | 构建 | 构建项目 | low | 否 |
| deploy:staging | 部署测试环境 | 部署到staging | medium | 是 |
| deploy:production | 部署生产环境 | 部署到production | critical | 禁止 |

### Git类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| git:status | 状态查看 | 查看git状态 | low | 否 |
| git:diff | 差异查看 | 查看代码差异 | low | 否 |
| git:branch | 分支操作 | 创建/切换分支 | low | 否 |
| git:commit | 提交代码 | 提交更改 | low | 否 |
| git:push | 推送代码 | 推送到远程 | medium | 是 |
| git:merge | 合并代码 | 合并分支 | medium | 是 |
| git:reset | 重置代码 | 重置提交 | high | 是 |

### 文档类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| docs:read | 文档阅读 | 读取文档 | low | 否 |
| docs:generate | 文档生成 | 生成文档 | low | 否 |
| docs:update | 文档更新 | 更新文档 | low | 否 |

### API类技能

| ID | 名称 | 描述 | 风险等级 | 需确认 |
|----|------|------|----------|--------|
| api:read | API读取 | 调用GET接口 | low | 否 |
| api:write | API写入 | 调用POST/PUT接口 | medium | 否 |
| api:delete | API删除 | 调用DELETE接口 | high | 是 |

## 技能依赖关系

```yaml
dependencies:
  code:generate:
    requires:
      - code:read
      - docs:read

  code:refactor:
    requires:
      - code:read
      - test:run

  db:migrate:
    requires:
      - db:read
      - code:generate

  deploy:production:
    requires:
      - test:run
      - deploy:build
      - deploy:staging
```

## 技能组合

```yaml
skill_combinations:
  # 功能开发流程
  feature_development:
    name: "功能开发"
    skills:
      - code:read
      - code:generate
      - test:generate
      - test:run
      - git:commit

  # 代码重构流程
  code_refactoring:
    name: "代码重构"
    skills:
      - code:read
      - code:refactor
      - test:run
      - test:coverage
      - git:commit

  # 问题修复流程
  bug_fix:
    name: "问题修复"
    skills:
      - code:read
      - test:generate
      - code:generate
      - test:run
      - git:commit
```

## 技能标签

```yaml
tags:
  safe:
    - code:read
    - docs:read
    - test:run
    - git:status

  moderate:
    - code:generate
    - code:refactor
    - test:generate
    - git:commit

  dangerous:
    - db:migrate
    - git:push
    - deploy:staging

  forbidden:
    - deploy:production
    - git:reset --hard
```

---

*技能注册表帮助管理AI能力边界，确保安全可控*