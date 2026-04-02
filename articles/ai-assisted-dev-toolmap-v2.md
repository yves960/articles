# AI辅助研发工具地图 (分层版)

> Harness三层架构 × DevOps流程矩阵，每个分类框内放置具体工具

---

## 核心矩阵图

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DevOps 流程（横向）                                         │
│                                                                                              │
│      Plan          Code          Build         Test         Release        Deploy        Operate       │
│     (规划)         (编码)        (构建)        (测试)       (发布)         (部署)        (运维)        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           反馈层 (Feedback Layer)                                    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │  静态检查    │  │  动态验证    │  │  代码审查    │  │  运行验证    │             │    │
│  │  │  Lint        │  │  测试运行    │  │  PR审查      │  │  健康检查    │             │    │
│  │  │  类型检查    │  │  覆盖率      │  │  安全扫描    │  │  告警分析    │             │    │
│  │  │  安全扫描    │  │  契约测试    │  │  性能分析    │  │  故障检测    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           执行层 (Execution Layer)                                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │  代码操作    │  │  开发工具    │  │  测试工具    │  │  部署运维    │             │    │
│  │  │  文件读写    │  │  Shell命令   │  │  测试执行    │  │  Docker/K8s  │             │    │
│  │  │  代码生成    │  │  Git操作     │  │  测试生成    │  │  CI/CD       │             │    │
│  │  │  重构工具    │  │  包管理      │  │  数据准备    │  │  监控查询    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                           信息层 (Information Layer)                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │    │
│  │  │    Memory    │  │   Context    │  │     Spec     │  │   History    │             │    │
│  │  │   记忆系统   │  │   上下文     │  │    规范      │  │    历史      │             │    │
│  │  │              │  │              │  │              │  │              │             │    │
│  │  │ ·长期记忆    │  │ ·RAG索引     │  │ ·代码规范    │  │ ·Git历史     │             │    │
│  │  │ ·会话记忆    │  │ ·知识库      │  │ ·架构规范    │  │ ·Issue/PR    │             │    │
│  │  │ ·工作记忆    │  │ ·文档库      │  │ ·安全规范    │  │ ·运维记录    │             │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘             │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│                              ┌───────────────────┐                                          │
│                              │    Agent Core     │                                          │
│                              │   (AI推理引擎)    │                                          │
│                              └───────────────────┘                                          │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 一、信息层详解

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        信息层                                                │
│                              (为Agent提供知识和上下文)                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐            │
│  │       Memory          │  │       Context         │  │        Spec           │            │
│  │      记忆系统         │  │       上下文          │  │        规范           │            │
│  ├───────────────────────┤  ├───────────────────────┤  ├───────────────────────┤            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   长期记忆      │  │  │  │    RAG索引      │  │  │  │   代码规范      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·项目知识       │  │  │  │ ·Chroma        │  │  │  │ ·ESLint        │  │            │
│  │  │ ·技术决策       │  │  │  │ ·Pinecone      │  │  │  │ ·Prettier      │  │            │
│  │  │ ·经验教训       │  │  │  │ ·Weaviate      │  │  │  │ ·Checkstyle    │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   会话记忆      │  │  │  │    知识库       │  │  │  │   架构规范      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·当前对话       │  │  │  │ ·技术文档       │  │  │  │ ·ArchUnit      │  │            │
│  │  │ ·工作状态       │  │  │  │ ·最佳实践       │  │  │  │ ·分层规则      │  │            │
│  │  │ ·临时数据       │  │  │  │ ·领域知识       │  │  │  │ ·依赖约束      │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   工作记忆      │  │  │  │    文档库       │  │  │  │   安全规范      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·任务上下文     │  │  │  │ ·API文档        │  │  │  │ ·OWASP         │  │            │
│  │  │ ·临时变量       │  │  │  │ ·架构文档       │  │  │  │ ·密钥管理      │  │            │
│  │  │ ·缓存数据       │  │  │  │ ·运维手册       │  │  │  │ ·审计规则      │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘            │
│                                                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐                                      │
│  │       History         │  │     External          │                                      │
│  │        历史           │  │      外部知识         │                                      │
│  ├───────────────────────┤  ├───────────────────────┤                                      │
│  │                       │  │                       │                                      │
│  │  ·Git提交历史         │  │  ·Stack Overflow      │                                      │
│  │  ·Issue/PR讨论        │  │  ·官方文档            │                                      │
│  │  ·运维事件记录        │  │  ·技术博客            │                                      │
│  │  ·用户反馈            │  │  ·开源项目            │                                      │
│  │                       │  │                       │                                      │
│  └───────────────────────┘  └───────────────────────┘                                      │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 信息层工具表

#### Memory (记忆系统)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 长期记忆 | **h-agent Memory** | 项目级持久记忆 | 内置 |
| | **LangChain Memory** | 对话记忆管理 | [python.langchain.com](https://python.langchain.com/) |
| | **Mem0** | AI记忆层 | [mem0.ai](https://mem0.ai/) |
| 会话记忆 | **h-agent Session** | 会话状态管理 | 内置 |
| | **Redis** | 会话缓存 | [redis.io](https://redis.io/) |

#### Context (上下文) - RAG工具

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 向量数据库 | **Chroma** | 开源向量数据库 | [trychroma.com](https://www.trychroma.com/) |
| | **Pinecone** | 托管向量数据库 | [pinecone.io](https://www.pinecone.io/) |
| | **Weaviate** | 开源向量搜索引擎 | [weaviate.io](https://weaviate.io/) |
| | **Milvus** | 云原生向量数据库 | [milvus.io](https://milvus.io/) |
| | **Qdrant** | 高性能向量数据库 | [qdrant.tech](https://qdrant.tech/) |
| RAG框架 | **LlamaIndex** | 数据框架 | [llamaindex.ai](https://www.llamaindex.ai/) |
| | **LangChain RAG** | RAG链 | [langchain.com](https://www.langchain.com/) |
| 代码索引 | **h-agent RAG** | 代码库索引 | 内置 |
| | **Sourcegraph** | 代码搜索 | [sourcegraph.com](https://sourcegraph.com/) |

#### Context (上下文) - 知识库

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 知识管理 | **Notion** | 知识库 | [notion.so](https://www.notion.so/) |
| | **Confluence** | 企业知识库 | [atlassian.com/confluence](https://www.atlassian.com/confluence) |
| | **Obsidian** | 本地知识库 | [obsidian.md](https://obsidian.md/) |
| 文档索引 | **Mintlify** | API文档 | [mintlify.com](https://mintlify.com/) |
| | **Swimm** | 代码文档 | [swimm.io](https://swimm.io/) |

#### Spec (规范)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 代码规范 | **ESLint** | JS/TS Lint | [eslint.org](https://eslint.org/) |
| | **Prettier** | 代码格式化 | [prettier.io](https://prettier.io/) |
| | **Checkstyle** | Java Lint | [checkstyle.org](https://checkstyle.org/) |
| | **Ruff** | Python Lint | [docs.astral.sh/ruff](https://docs.astral.sh/ruff/) |
| 架构规范 | **ArchUnit** | Java架构测试 | [archunit.org](https://www.archunit.org/) |
| | **NetArchTest** | .NET架构测试 | [github.com/BenMorris/NetArchTest](https://github.com/BenMorris/NetArchTest) |
| 安全规范 | **OWASP ZAP** | 安全扫描 | [zaproxy.org](https://www.zaproxy.org/) |
| | **Snyk** | 漏洞扫描 | [snyk.io](https://snyk.io/) |

#### History (历史)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| Git历史 | **Git** | 版本控制 | [git-scm.com](https://git-scm.com/) |
| | **GitHub** | 代码托管 | [github.com](https://github.com/) |
| | **GitLab** | DevOps平台 | [gitlab.com](https://gitlab.com/) |
| Issue/PR | **GitHub Issues** | 问题追踪 | [github.com](https://github.com/) |
| | **Jira** | 项目管理 | [atlassian.com/jira](https://www.atlassian.com/jira) |
| | **Linear** | 现代项目管理 | [linear.app](https://linear.app/) |
| 运维记录 | **PagerDuty** | 事件管理 | [pagerduty.com](https://www.pagerduty.com/) |
| | **Opsgenie** | 告警管理 | [atlassian.com/opsgenie](https://www.atlassian.com/opsgenie) |

#### External (外部知识)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 技术问答 | **Stack Overflow** | 技术问答社区 | [stackoverflow.com](https://stackoverflow.com/) |
| 文档搜索 | **Perplexity** | AI搜索引擎 | [perplexity.ai](https://www.perplexity.ai/) |
| | **Phind** | 开发者搜索 | [phind.com](https://www.phind.com/) |
| 官方文档 | **MDN** | Web文档 | [developer.mozilla.org](https://developer.mozilla.org/) |
| | **DevDocs** | API文档聚合 | [devdocs.io](https://devdocs.io/) |

---

## 二、执行层详解

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        执行层                                                │
│                              (为Agent提供工具和操作能力)                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐            │
│  │    Code Operations    │  │   Development Tools   │  │    Testing Tools      │            │
│  │       代码操作        │  │       开发工具        │  │       测试工具        │            │
│  ├───────────────────────┤  ├───────────────────────┤  ├───────────────────────┤            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   文件读写      │  │  │  │   Shell命令     │  │  │  │   测试执行      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·read/write     │  │  │  │ ·bash          │  │  │  │ ·Jest          │  │            │
│  │  │ ·edit/glob      │  │  │  │ ·exec          │  │  │  │ ·Pytest        │  │            │
│  │  │ ·文件搜索       │  │  │  │ ·脚本执行       │  │  │  │ ·JUnit         │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   代码生成      │  │  │  │   Git操作       │  │  │  │   测试生成      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·Cursor        │  │  │  │ ·git-commit    │  │  │  │ ·TestGPT       │  │            │
│  │  │ ·Copilot       │  │  │  │ ·git-push      │  │  │  │ ·CodiumAI      │  │            │
│  │  │ ·Claude Code   │  │  │  │ ·git-merge     │  │  │  │ ·Diffblue      │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   代码重构      │  │  │  │   包管理       │  │  │  │   覆盖分析      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·重命名         │  │  │  │ ·npm           │  │  │  │ ·Istanbul      │  │            │
│  │  │ ·提取方法       │  │  │  │ ·pip           │  │  │  │ ·Coverage.py   │  │            │
│  │  │ ·移动文件       │  │  │  │ ·maven         │  │  │  │ ·JaCoCo        │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘            │
│                                                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐            │
│  │   Deployment Tools    │  │   Operations Tools    │  │   External Tools      │            │
│  │       部署工具        │  │       运维工具        │  │      外部集成         │            │
│  ├───────────────────────┤  ├───────────────────────┤  ├───────────────────────┤            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   容器化        │  │  │  │   监控查询      │  │  │  │   数据库        │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·Docker        │  │  │  │ ·Prometheus    │  │  │  │ ·PostgreSQL    │  │            │
│  │  │ ·Podman        │  │  │  │ ·Grafana       │  │  │  │ ·MySQL         │  │            │
│  │  │ ·镜像构建       │  │  │  │ ·Datadog       │  │  │  │ ·MongoDB       │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   K8s部署       │  │  │  │   日志检索      │  │  │  │   消息队列      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·kubectl       │  │  │  │ ·ELK Stack     │  │  │  │ ·Kafka         │  │            │
│  │  │ ·Helm          │  │  │  │ ·Loki          │  │  │  │ ·RabbitMQ      │  │            │
│  │  │ ·ArgoCD        │  │  │  │ ·Splunk        │  │  │  │ ·Redis Pub/Sub │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   CI/CD        │  │  │  │   故障处理      │  │  │  │   API调用       │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·GitHub Actions│  │  │  │ ·自动重启      │  │  │  │ ·HTTP Client   │  │            │
│  │  │ ·GitLab CI     │  │  │  │ ·扩缩容        │  │  │  │ ·gRPC          │  │            │
│  │  │ ·Jenkins       │  │  │  │ ·回滚          │  │  │  │ ·MCP Tools     │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘            │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 执行层工具表

#### Code Operations (代码操作)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 文件读写 | **read/write/edit** | 基础文件操作 | h-agent内置 |
| | **glob** | 文件搜索 | h-agent内置 |
| 代码生成 | **Cursor** | AI代码编辑器 | [cursor.sh](https://cursor.sh/) |
| | **GitHub Copilot** | AI代码助手 | [github.com/features/copilot](https://github.com/features/copilot) |
| | **Claude Code** | AI编程助手 | [anthropic.com](https://www.anthropic.com/) |
| | **Codeium** | 免费代码助手 | [codeium.com](https://codeium.com/) |
| 代码重构 | **IntelliJ IDEA** | 重构工具 | [jetbrains.com/idea](https://www.jetbrains.com/idea/) |
| | **VS Code** | 编辑器 | [code.visualstudio.com](https://code.visualstudio.com/) |

#### Development Tools (开发工具)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| Shell命令 | **bash** | Shell执行 | h-agent内置 |
| | **exec** | 命令执行 | h-agent内置 |
| Git操作 | **git-commit/push/merge** | Git工具 | h-agent内置 |
| | **GitHub CLI** | GitHub命令行 | [cli.github.com](https://cli.github.com/) |
| 包管理 | **npm/yarn/pnpm** | Node包管理 | [npmjs.com](https://www.npmjs.com/) |
| | **pip/poetry** | Python包管理 | [pypi.org](https://pypi.org/) |
| | **maven/gradle** | Java构建 | [maven.apache.org](https://maven.apache.org/) |

#### Testing Tools (测试工具)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 测试执行 | **Jest** | JS测试框架 | [jestjs.io](https://jestjs.io/) |
| | **Pytest** | Python测试 | [docs.pytest.org](https://docs.pytest.org/) |
| | **JUnit** | Java测试 | [junit.org](https://junit.org/) |
| | **Go test** | Go测试 | 内置 |
| 测试生成 | **TestGPT/CodiumAI** | AI测试生成 | [codium.ai](https://www.codium.ai/) |
| | **Diffblue Cover** | Java单元测试 | [diffblue.com](https://www.diffblue.com/) |
| E2E测试 | **Playwright** | 跨浏览器测试 | [playwright.dev](https://playwright.dev/) |
| | **Cypress** | Web测试 | [cypress.io](https://www.cypress.io/) |
| 覆盖率 | **Istanbul/nyc** | JS覆盖率 | [istanbul.js.org](https://istanbul.js.org/) |
| | **Coverage.py** | Python覆盖率 | [coverage.readthedocs.io](https://coverage.readthedocs.io/) |
| | **JaCoCo** | Java覆盖率 | [jacoco.org](https://www.jacoco.org/) |

#### Deployment Tools (部署工具)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 容器化 | **Docker** | 容器平台 | [docker.com](https://www.docker.com/) |
| | **Podman** | 无守护进程容器 | [podman.io](https://podman.io/) |
| K8s部署 | **kubectl** | K8s命令行 | [kubernetes.io](https://kubernetes.io/) |
| | **Helm** | K8s包管理 | [helm.sh](https://helm.sh/) |
| | **ArgoCD** | GitOps部署 | [argo-cd.readthedocs.io](https://argo-cd.readthedocs.io/) |
| | **Flux** | GitOps工具 | [fluxcd.io](https://fluxcd.io/) |
| CI/CD | **GitHub Actions** | GitHub CI/CD | [github.com/features/actions](https://github.com/features/actions) |
| | **GitLab CI** | GitLab CI/CD | [docs.gitlab.com/ee/ci](https://docs.gitlab.com/ee/ci/) |
| | **Jenkins** | 开源CI/CD | [jenkins.io](https://www.jenkins.io/) |
| IaC | **Terraform** | 基础设施即代码 | [terraform.io](https://www.terraform.io/) |
| | **Pulumi** | 现代IaC | [pulumi.com](https://www.pulumi.com/) |

#### Operations Tools (运维工具)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 监控 | **Prometheus** | 指标监控 | [prometheus.io](https://prometheus.io/) |
| | **Grafana** | 可视化平台 | [grafana.com](https://grafana.com/) |
| | **Datadog** | 全栈监控 | [datadoghq.com](https://www.datadoghq.com/) |
| 日志 | **ELK Stack** | 日志平台 | [elastic.co](https://www.elastic.co/) |
| | **Loki** | 日志聚合 | [grafana.com/oss/loki](https://grafana.com/oss/loki/) |
| 追踪 | **Jaeger** | 分布式追踪 | [jaegertracing.io](https://www.jaegertracing.io/) |
| | **Zipkin** | 分布式追踪 | [zipkin.io](https://zipkin.io/) |
| 告警 | **PagerDuty** | 事件管理 | [pagerduty.com](https://www.pagerduty.com/) |
| | **AlertManager** | Prometheus告警 | [prometheus.io/docs/alerting](https://prometheus.io/docs/alerting/) |

#### External Tools (外部集成)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 数据库 | **PostgreSQL** | 关系数据库 | [postgresql.org](https://www.postgresql.org/) |
| | **MySQL** | 关系数据库 | [mysql.com](https://www.mysql.com/) |
| | **MongoDB** | 文档数据库 | [mongodb.com](https://www.mongodb.com/) |
| | **Redis** | 缓存数据库 | [redis.io](https://redis.io/) |
| 消息队列 | **Kafka** | 事件流平台 | [kafka.apache.org](https://kafka.apache.org/) |
| | **RabbitMQ** | 消息代理 | [rabbitmq.com](https://www.rabbitmq.com/) |
| | **RocketMQ** | 分布式消息 | [rocketmq.apache.org](https://rocketmq.apache.org/) |
| API调用 | **HTTP Client** | HTTP请求 | h-agent内置 |
| | **MCP Tools** | 外部工具集成 | h-agent内置 |

---

## 三、反馈层详解

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        反馈层                                                │
│                              (验证、检查、纠正Agent行为)                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐            │
│  │    Static Analysis    │  │  Dynamic Verification │  │     Code Review       │            │
│  │       静态检查        │  │       动态验证        │  │       代码审查        │            │
│  ├───────────────────────┤  ├───────────────────────┤  ├───────────────────────┤            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   代码风格      │  │  │  │   单元测试      │  │  │  │   质量审查      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·ESLint        │  │  │  │ ·Jest          │  │  │  │ ·CodeRabbit    │  │            │
│  │  │ ·Prettier      │  │  │  │ ·Pytest        │  │  │  │ ·SonarQube     │  │            │
│  │  │ ·Checkstyle    │  │  │  │ ·JUnit         │  │  │  │ ·Codacy        │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   类型检查      │  │  │  │   集成测试      │  │  │  │   安全审查      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·TypeScript    │  │  │  │ ·Playwright    │  │  │  │ ·Snyk          │  │            │
│  │  │ ·mypy          │  │  │  │ ·Cypress       │  │  │  │ ·Checkmarx     │  │            │
│  │  │ ·pyright       │  │  │  │ ·Postman       │  │  │  │ ·Trivy         │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │            │
│  │  │   安全扫描      │  │  │  │   覆盖率        │  │  │  │   性能审查      │  │            │
│  │  │                 │  │  │  │                 │  │  │  │                 │  │            │
│  │  │ ·Snyk          │  │  │  │ ·Istanbul      │  │  │  │ ·Lighthouse    │  │            │
│  │  │ ·SonarQube     │  │  │  │ ·Coverage.py   │  │  │  │ ·WebPageTest   │  │            │
│  │  │ ·Semgrep       │  │  │  │ ·JaCoCo        │  │  │  │ ·k6            │  │            │
│  │  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │            │
│  │                       │  │                       │  │                       │            │
│  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘            │
│                                                                                              │
│  ┌───────────────────────┐  ┌───────────────────────┐                                      │
│  │  Runtime Validation   │  │   Feedback Loop       │                                      │
│  │       运行验证        │  │       反馈闭环        │                                      │
│  ├───────────────────────┤  ├───────────────────────┤                                      │
│  │                       │  │                       │                                      │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │                                      │
│  │  │   健康检查      │  │  │  │   错误学习      │  │                                      │
│  │  │                 │  │  │  │                 │  │                                      │
│  │  │ ·Healthchecks  │  │  │  │ ·错误模式记录   │  │                                      │
│  │  │ ·kube-probe    │  │  │  │ ·避免策略       │  │                                      │
│  │  │ ·服务发现       │  │  │  │ ·经验沉淀       │  │                                      │
│  │  └─────────────────┘  │  │  └─────────────────┘  │                                      │
│  │                       │  │                       │                                      │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │                                      │
│  │  │   冒烟测试      │  │  │  │   规范更新      │  │                                      │
│  │  │                 │  │  │  │                 │  │                                      │
│  │  │ ·Postman       │  │  │  │ ·Lint规则更新   │  │                                      │
│  │  │ ·自定义脚本     │  │  │  │ ·规范补充       │  │                                      │
│  │  │ ·端点验证       │  │  │  │ ·模板更新       │  │                                      │
│  │  └─────────────────┘  │  │  └─────────────────┘  │                                      │
│  │                       │  │                       │                                      │
│  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │                                      │
│  │  │   灰度验证      │  │  │  │   能力进化      │  │                                      │
│  │  │                 │  │  │  │                 │  │                                      │
│  │  │ ·Flagger       │  │  │  │ ·技能优化       │  │                                      │
│  │  │ ·Istio         │  │  │  │ ·工具升级       │  │                                      │
│  │  │ ·渐进发布       │  │  │  │ ·模型迭代       │  │                                      │
│  │  └─────────────────┘  │  │  └─────────────────┘  │                                      │
│  │                       │  │                       │                                      │
│  └───────────────────────┘  └───────────────────────┘                                      │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 反馈层工具表

#### Static Analysis (静态检查)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 代码风格 | **ESLint** | JS/TS Lint | [eslint.org](https://eslint.org/) |
| | **Prettier** | 代码格式化 | [prettier.io](https://prettier.io/) |
| | **Checkstyle** | Java Lint | [checkstyle.org](https://checkstyle.org/) |
| | **Ruff** | Python Lint | [docs.astral.sh/ruff](https://docs.astral.sh/ruff/) |
| 类型检查 | **TypeScript** | JS类型系统 | [typescriptlang.org](https://www.typescriptlang.org/) |
| | **mypy** | Python类型检查 | [mypy-lang.org](https://mypy-lang.org/) |
| | **pyright** | Python静态类型 | [github.com/microsoft/pyright](https://github.com/microsoft/pyright) |
| 安全扫描 | **Snyk** | 漏洞扫描 | [snyk.io](https://snyk.io/) |
| | **SonarQube** | 代码质量 | [sonarqube.org](https://www.sonarqube.org/) |
| | **Semgrep** | 静态分析 | [semgrep.dev](https://semgrep.dev/) |
| | **Trivy** | 容器安全 | [aquasec.github.io/trivy](https://aquasec.github.io/trivy/) |

#### Dynamic Verification (动态验证)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 单元测试 | **Jest** | JS测试 | [jestjs.io](https://jestjs.io/) |
| | **Pytest** | Python测试 | [pytest.org](https://docs.pytest.org/) |
| | **JUnit** | Java测试 | [junit.org](https://junit.org/) |
| 集成测试 | **Playwright** | E2E测试 | [playwright.dev](https://playwright.dev/) |
| | **Cypress** | Web测试 | [cypress.io](https://www.cypress.io/) |
| | **Postman** | API测试 | [postman.com](https://www.postman.com/) |
| 覆盖率 | **Istanbul** | JS覆盖率 | [istanbul.js.org](https://istanbul.js.org/) |
| | **Coverage.py** | Python覆盖率 | [coverage.readthedocs.io](https://coverage.readthedocs.io/) |
| | **JaCoCo** | Java覆盖率 | [jacoco.org](https://www.jacoco.org/) |

#### Code Review (代码审查)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 质量审查 | **CodeRabbit** | AI代码审查 | [coderabbit.ai](https://coderabbit.ai/) |
| | **SonarQube** | 代码质量平台 | [sonarqube.org](https://www.sonarqube.org/) |
| | **Codacy** | 代码质量分析 | [codacy.com](https://www.codacy.com/) |
| 安全审查 | **Snyk** | 安全扫描 | [snyk.io](https://snyk.io/) |
| | **Checkmarx** | 应用安全测试 | [checkmarx.com](https://checkmarx.com/) |
| | **Trivy** | 容器安全 | [aquasec.github.io/trivy](https://aquasec.github.io/trivy/) |
| 性能审查 | **Lighthouse** | Web性能 | [developer.chrome.com/lighthouse](https://developer.chrome.com/docs/lighthouse/) |
| | **WebPageTest** | 性能测试 | [webpagetest.org](https://www.webpagetest.org/) |
| | **k6** | 负载测试 | [k6.io](https://k6.io/) |

#### Runtime Validation (运行验证)

| 子类 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 健康检查 | **Healthchecks.io** | 健康监控 | [healthchecks.io](https://healthchecks.io/) |
| | **kube-probe** | K8s探针 | 内置 |
| 冒烟测试 | **Postman** | API测试 | [postman.com](https://www.postman.com/) |
| | **自定义脚本** | 部署验证 | - |
| 灰度验证 | **Flagger** | 渐进式交付 | [flagger.app](https://flagger.app/) |
| | **Istio** | 服务网格 | [istio.io](https://istio.io/) |
| | **Argo Rollouts** | 渐进部署 | [argoproj.github.io/argo-rollouts](https://argoproj.github.io/argo-rollouts/) |

---

## 四、DevOps流程交叉矩阵

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              DevOps流程 × Harness层级                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│           │     Plan      │    Code     │   Build    │   Test    │  Release  │  Deploy  │  Operate  │
│           │    (规划)     │   (编码)    │  (构建)   │  (测试)  │  (发布)  │  (部署)  │  (运维)   │
├───────────┼───────────────┼─────────────┼───────────┼──────────┼──────────┼──────────┼───────────┤
│           │               │             │           │          │          │          │           │
│  信息层   │ ·需求文档     │ ·代码库索引 │ ·构建配置 │ ·测试用例│ ·发布清单│ ·部署配置│ ·运维手册 │
│           │ ·术语表       │ ·API文档    │ ·依赖列表 │ ·测试数据│ ·变更日志│ ·环境变量│ ·监控配置 │
│           │ ·设计文档     │ ·架构文档   │ ·环境配置 │ ·覆盖率  │ ·回滚预案│ ·密钥    │ ·告警规则 │
│  ──────── │ ·Jira/Linear  │ ·RAG索引    │ ·Dockerfile│ ·Jest等  │ ·版本号  │ ·K8s YAML│ ·Runbook  │
│           │               │             │           │          │          │          │           │
├───────────┼───────────────┼─────────────┼───────────┼──────────┼──────────┼──────────┼───────────┤
│           │               │             │           │          │          │          │           │
│  执行层   │ ·需求解析     │ ·代码生成   │ ·构建执行 │ ·测试运行│ ·版本打标│ ·镜像推送│ ·监控查询 │
│           │ ·任务分解     │ ·文件操作   │ ·打包     │ ·测试生成│ ·变更记录│ ·K8s部署 │ ·故障处理 │
│           │ ·进度追踪     │ ·Git操作    │ ·依赖安装 │ ·数据准备│ ·公告发布│ ·配置注入│ ·扩缩容   │
│  ──────── │ ·Notion AI    │ ·Cursor等   │ ·npm/build│ ·Playwright│ ·Git tag│ ·kubectl │ ·kubectl  │
│           │               │             │           │          │          │          │           │
├───────────┼───────────────┼─────────────┼───────────┼──────────┼──────────┼──────────┼───────────┤
│           │               │             │           │          │          │          │           │
│  反馈层   │ ·需求评审     │ ·Lint检查   │ ·构建验证 │ ·测试报告│ ·发布验证│ ·健康检查│ ·告警分析 │
│           │ ·影响评估     │ ·类型检查   │ ·安全扫描 │ ·覆盖率  │ ·冒烟测试│ ·冒烟测试│ ·故障复盘 │
│           │ ·风险分析     │ ·单元测试   │ ·依赖检查 │ ·契约验证│ ·灰度验证│ ·回滚检测│ ·优化建议 │
│  ──────── │ ·设计评审     │ ·代码审查   │ ·SonarQube│ ·测试报告│ ·验收测试│ ·验证脚本│ ·事后总结 │
│           │               │             │           │          │          │          │           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 各阶段详细工具

| 阶段 | 信息层 | 执行层 | 反馈层 |
|------|--------|--------|--------|
| **Plan** | Jira, Linear, Notion, 需求文档 | 需求解析, 任务分解, 进度追踪 | 需求评审, 影响评估, 风险分析 |
| **Code** | RAG索引, API文档, 架构文档, 代码规范 | Cursor, Copilot, 文件操作, Git | ESLint, TypeScript, 单元测试, CodeRabbit |
| **Build** | 构建配置, Dockerfile, 依赖列表, 环境配置 | npm run build, docker build, maven | 构建验证, 安全扫描, 依赖检查 |
| **Test** | 测试用例库, 测试数据, 覆盖率要求 | Jest, Playwright, 测试生成 | 测试报告, 覆盖率分析, 契约验证 |
| **Release** | 发布清单, 变更日志, 回滚预案, 版本号 | Git tag, 版本打标, 公告发布 | 发布验证, 冒烟测试, 灰度验证 |
| **Deploy** | 部署配置, 环境变量, K8s YAML, 密钥 | kubectl, Helm, ArgoCD, 配置注入 | 健康检查, 冒烟测试, 回滚检测 |
| **Operate** | 运维手册, 监控配置, 告警规则, Runbook | 监控查询, 故障处理, 扩缩容 | 告警分析, 故障复盘, 优化建议 |

---

## 五、h-agent定位

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        h-agent                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                    反馈层                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │  │
│  │  │ Lint检查        │  │ 测试运行        │  │ 代码审查        │  │ 架构验证        │   │  │
│  │  │ ·ESLint集成    │  │ ·Jest/Pytest   │  │ ·PR分析        │  │ ·依赖检查      │   │  │
│  │  │ ·权限验证      │  │ ·覆盖率报告    │  │ ·质量评分      │  │ ·规范校验      │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                    执行层                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │  │
│  │  │ 文件操作        │  │ Shell命令       │  │ Git操作         │  │ Docker/K8s      │   │  │
│  │  │ ·read/write    │  │ ·bash执行      │  │ ·commit/push   │  │ ·镜像操作      │   │  │
│  │  │ ·edit/glob     │  │ ·脚本运行      │  │ ·branch/merge  │  │ ·kubectl       │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                        │  │
│  │  │ MCP工具         │  │ 任务调度        │  │ 外部集成        │                        │  │
│  │  │ ·Playwright    │  │ ·Cron任务      │  │ ·HTTP调用      │                        │  │
│  │  │ ·自定义工具    │  │ ·Heartbeat     │  │ ·数据库查询    │                        │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘                        │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                    信息层                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │  │
│  │  │ Memory          │  │ Context         │  │ Spec            │  │ History         │   │  │
│  │  │ ·长期记忆      │  │ ·RAG索引       │  │ ·代码规范      │  │ ·Git历史       │   │  │
│  │  │ ·会话记忆      │  │ ·知识库        │  │ ·架构规范      │  │ ·Issue/PR      │   │  │
│  │  │ ·工作记忆      │  │ ·文档库        │  │ ·安全规范      │  │ ·运维记录      │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                              │
│                              ┌───────────────────────────┐                                  │
│                              │       Agent Core          │                                  │
│                              │  ·多Agent协作             │                                  │
│                              │  ·任务编排               │                                  │
│                              │  ·权限控制               │                                  │
│                              │  ·会话管理               │                                  │
│                              └───────────────────────────┘                                  │
│                                                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  覆盖阶段: Plan(部分) → Code(完整) → Build(部分) → Test(完整) → Release(部分) → Deploy(基本)  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  核心特性: 多Agent协作 │ 记忆系统 │ RAG集成 │ 技能系统 │ MCP工具 │ 权限控制 │ 任务调度      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### h-agent vs 其他工具对比

| 能力 | h-agent | Cursor | Copilot | Claude Code |
|------|---------|--------|---------|-------------|
| 文件操作 | ✅ 完整 | ✅ 完整 | ⚪ 部分 | ✅ 完整 |
| Shell命令 | ✅ 完整 | ⚪ 部分 | ❌ 无 | ⚪ 部分 |
| Git操作 | ✅ 完整 | ⚪ 部分 | ❌ 无 | ⚪ 部分 |
| 多Agent协作 | ✅ 完整 | ❌ 无 | ❌ 无 | ❌ 无 |
| 记忆系统 | ✅ 完整 | ❌ 无 | ❌ 无 | ⚪ 会话 |
| RAG集成 | ✅ 完整 | ❌ 无 | ⚪ 项目索引 | ⚪ 项目索引 |
| 技能系统 | ✅ 可扩展 | ❌ 固定 | ❌ 固定 | ❌ 固定 |
| 权限控制 | ✅ 细粒度 | ❌ 无 | ❌ 无 | ❌ 无 |
| 任务调度 | ✅ Cron+Heartbeat | ❌ 无 | ❌ 无 | ❌ 无 |
| 部署运维 | ⚪ 基本 | ❌ 无 | ❌ 无 | ❌ 无 |

---

## 六、实施路线

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      实施阶段                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  阶段一: 基础能力                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  信息层                     │  执行层                    │  反馈层                   │    │
│  │  ·代码库索引(RAG)           │  ·文件读写                 │  ·Lint检查               │    │
│  │  ·会话记忆                  │  ·Shell命令                │  ·单元测试运行           │    │
│  │  ·代码规范                  │  ·Git基础操作              │  ·基本验证               │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│  阶段二: 开发辅助                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  信息层                     │  执行层                    │  反馈层                   │    │
│  │  ·长期记忆                  │  ·代码生成(集成)           │  ·代码审查               │    │
│  │  ·API文档索引               │  ·重构工具                 │  ·类型检查               │    │
│  │  ·架构文档                  │  ·包管理                   │  ·安全扫描               │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│  阶段三: 测试部署                                                                            │
  │  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  信息层                     │  执行层                    │  反馈层                   │    │
│  │  ·测试用例库                │  ·测试执行                 │  ·测试报告               │    │
│  │  ·部署配置                  │  ·Docker操作               │  ·覆盖率分析             │    │
│  │  ·环境配置                  │  ·CI/CD触发                │  ·部署验证               │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│  阶段四: 运维闭环                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  信息层                     │  执行层                    │  反馈层                   │    │
│  │  ·运维手册                  │  ·K8s操作                  │  ·健康检查               │    │
│  │  ·监控配置                  │  ·监控查询                 │  ·告警分析               │    │
│  │  ·故障历史                  │  ·故障处理                 │  ·故障复盘               │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│  阶段五: 智能进化                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  信息层                     │  执行层                    │  反馈层                   │    │
│  │  ·知识图谱                  │  ·自动化决策               │  ·持续学习               │    │
│  │  ·经验积累                  │  ·智能修复                 │  ·能力进化               │    │
│  │  ·最佳实践库                │  ·自主优化                 │  ·效果评估               │    │
│  └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

*本文档使用ASCII图表展示清晰的分层分类结构，每个框内的工具可在上方表格中找到详细信息和链接。*