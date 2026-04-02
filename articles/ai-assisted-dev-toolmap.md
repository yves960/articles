# AI辅助研发工具地图

> 以Agent为核心，Harness为边界，覆盖从设计到部署的完整研发流程

---

## 核心架构图

```mermaid
graph TB
    subgraph 流程层
        REQ[需求分析] --> DES[设计]
        DES --> DEV[开发]
        DEV --> TEST[测试]
        TEST --> DEPLOY[部署]
        DEPLOY --> OPS[运维]
        OPS -.-> REQ
    end
    
    subgraph Harness[AI Harness]
        subgraph FB[反馈层 Feedback]
            LINT[静态检查]
            TEST_V[测试验证]
            REVIEW[代码审查]
            MONITOR[运行监控]
        end
        
        subgraph EXE[执行层 Execution]
            CODE[代码操作]
            SHELL[命令执行]
            BUILD[构建部署]
            TOOL[工具集成]
        end
        
        subgraph INFO[信息层 Information]
            KB[知识库]
            CTX[上下文]
            SPEC[规范]
            HIST[历史]
        end
    end
    
    AGENT((Agent<br/>Core)) --> INFO
    AGENT --> EXE
    AGENT --> FB
    
    REQ --> AGENT
    DES --> AGENT
    DEV --> AGENT
    TEST --> AGENT
    DEPLOY --> AGENT
    OPS --> AGENT
    
    style AGENT fill:#f9f,stroke:#333,stroke-width:4px
    style INFO fill:#bbf,stroke:#333
    style EXE fill:#bfb,stroke:#333
    style FB fill:#fb9,stroke:#333
```

---

## 一、信息层 (Information Layer)

> 为Agent提供知识、上下文、规范和历史信息

### 架构图

```mermaid
graph LR
    subgraph 信息层
        A1[项目知识] --> A11[代码库索引]
        A1 --> A12[API文档]
        A1 --> A13[架构文档]
        
        A2[业务上下文] --> A21[需求文档]
        A2 --> A22[设计文档]
        A2 --> A23[术语表]
        
        A3[规范约束] --> A31[代码规范]
        A3 --> A32[架构规范]
        A3 --> A33[安全规范]
        
        A4[历史信息] --> A41[Git历史]
        A4 --> A42[Issue/PR]
        A4 --> A43[运维记录]
        
        A5[外部知识] --> A51[技术文档]
        A5 --> A52[最佳实践]
        A5 --> A53[领域知识]
    end
```

### 工具列表

#### 项目知识

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 代码索引 | **Chroma** | 向量数据库，代码语义搜索 | [chromadb.com](https://www.trychroma.com/) |
| | **Pinecone** | 托管向量数据库 | [pinecone.io](https://www.pinecone.io/) |
| | **Weaviate** | 开源向量搜索引擎 | [weaviate.io](https://weaviate.io/) |
| API文档 | **Swagger** | API文档标准 | [swagger.io](https://swagger.io/) |
| | **Postman** | API平台 | [postman.com](https://www.postman.com/) |
| 架构文档 | **Structurizr** | 架构文档即代码 | [structurizr.com](https://structurizr.com/) |
| | **C4 Model** | 架构图标准 | [c4model.com](https://c4model.com/) |

#### 业务上下文

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 需求管理 | **Linear** | 现代化需求管理 | [linear.app](https://linear.app/) |
| | **Jira** | 企业需求管理 | [atlassian.com/jira](https://www.atlassian.com/jira) |
| 设计协作 | **Figma** | 设计工具 | [figma.com](https://www.figma.com/) |
| 流程图 | **Mermaid** | 文本转图表 | [mermaid.js.org](https://mermaid.js.org/) |
| | **Draw.io** | 在线绘图 | [draw.io](https://app.diagrams.net/) |

#### 规范约束

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 代码规范 | **ESLint** | JS/TS Lint | [eslint.org](https://eslint.org/) |
| | **Prettier** | 代码格式化 | [prettier.io](https://prettier.io/) |
| | **Checkstyle** | Java Lint | [checkstyle.org](https://checkstyle.org/) |
| 架构规范 | **ArchUnit** | Java架构测试 | [archunit.org](https://www.archunit.org/) |
| 安全规范 | **SonarQube** | 代码质量平台 | [sonarqube.org](https://www.sonarqube.org/) |

---

## 二、执行层 (Execution Layer)

> 为Agent提供工具、命令、操作和集成能力

### 架构图

```mermaid
graph LR
    subgraph 执行层
        B1[代码操作] --> B11[文件读写]
        B1 --> B12[代码生成]
        B1 --> B13[重构工具]
        
        B2[开发工具] --> B21[Shell命令]
        B2 --> B22[包管理]
        B2 --> B23[构建工具]
        
        B3[测试工具] --> B31[测试运行]
        B3 --> B32[测试生成]
        B3 --> B33[覆盖率分析]
        
        B4[部署工具] --> B41[容器化]
        B4 --> B42[K8s部署]
        B4 --> B43[CI/CD]
        
        B5[运维工具] --> B51[监控查询]
        B5 --> B52[故障处理]
        B5 --> B53[日志检索]
    end
```

### 工具列表

#### 代码操作

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| AI编码 | **Cursor** | AI代码编辑器 | [cursor.sh](https://cursor.sh/) |
| | **GitHub Copilot** | AI代码助手 | [github.com/features/copilot](https://github.com/features/copilot) |
| | **Claude Code** | Anthropic代码助手 | [anthropic.com](https://www.anthropic.com/) |
| | **Codeium** | 免费代码助手 | [codeium.com](https://codeium.com/) |
| 代码搜索 | **Sourcegraph** | 代码搜索平台 | [sourcegraph.com](https://sourcegraph.com/) |
| | **Ast-grep** | 代码结构搜索 | [ast-grep.github.io](https://ast-grep.github.io/) |

#### 开发工具

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 版本控制 | **Git** | 版本控制 | [git-scm.com](https://git-scm.com/) |
| | **GitHub** | 代码托管 | [github.com](https://github.com/) |
| | **GitLab** | DevOps平台 | [gitlab.com](https://gitlab.com/) |
| 包管理 | **npm** | Node包管理 | [npmjs.com](https://www.npmjs.com/) |
| | **Maven** | Java包管理 | [maven.apache.org](https://maven.apache.org/) |
| 构建 | **Webpack** | JS构建工具 | [webpack.js.org](https://webpack.js.org/) |
| | **Vite** | 下一代构建工具 | [vitejs.dev](https://vitejs.dev/) |

#### 测试工具

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 单元测试 | **Jest** | JS测试框架 | [jestjs.io](https://jestjs.io/) |
| | **Pytest** | Python测试框架 | [docs.pytest.org](https://docs.pytest.org/) |
| | **JUnit** | Java测试框架 | [junit.org](https://junit.org/) |
| E2E测试 | **Playwright** | 跨浏览器测试 | [playwright.dev](https://playwright.dev/) |
| | **Cypress** | Web测试框架 | [cypress.io](https://www.cypress.io/) |
| 测试生成 | **TestGPT** | AI测试生成 | [codium.ai](https://www.codium.ai/) |

#### 部署工具

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 容器化 | **Docker** | 容器平台 | [docker.com](https://www.docker.com/) |
| 编排 | **Kubernetes** | 容器编排 | [kubernetes.io](https://kubernetes.io/) |
| | **Helm** | K8s包管理 | [helm.sh](https://helm.sh/) |
| CI/CD | **GitHub Actions** | GitHub CI/CD | [github.com/features/actions](https://github.com/features/actions) |
| | **GitLab CI** | GitLab CI/CD | [docs.gitlab.com/ee/ci](https://docs.gitlab.com/ee/ci/) |
| | **Jenkins** | 开源CI/CD | [jenkins.io](https://www.jenkins.io/) |
| IaC | **Terraform** | 基础设施即代码 | [terraform.io](https://www.terraform.io/) |
| | **Pulumi** | 现代IaC | [pulumi.com](https://www.pulumi.com/) |

#### 运维工具

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 监控 | **Prometheus** | 指标监控 | [prometheus.io](https://prometheus.io/) |
| | **Grafana** | 可观测平台 | [grafana.com](https://grafana.com/) |
| 日志 | **ELK Stack** | 日志平台 | [elastic.co/elasticsearch](https://www.elastic.co/elasticsearch/) |
| | **Loki** | 日志聚合 | [grafana.com/oss/loki](https://grafana.com/oss/loki/) |
| APM | **Datadog** | 全栈监控 | [datadoghq.com](https://www.datadoghq.com/) |
| | **Jaeger** | 分布式追踪 | [jaegertracing.io](https://www.jaegertracing.io/) |

---

## 三、反馈层 (Feedback Layer)

> 验证、检查、纠正和评估Agent的行为

### 架构图

```mermaid
graph LR
    subgraph 反馈层
        C1[静态检查] --> C11[代码风格]
        C1 --> C12[类型检查]
        C1 --> C13[安全扫描]
        
        C2[动态验证] --> C21[单元测试]
        C2 --> C22[集成测试]
        C2 --> C23[契约测试]
        
        C3[代码审查] --> C31[质量审查]
        C3 --> C32[安全审查]
        C3 --> C33[性能审查]
        
        C4[运行验证] --> C41[健康检查]
        C4 --> C42[冒烟测试]
        C4 --> C43[灰度验证]
    end
```

### 工具列表

#### 静态检查

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 代码质量 | **SonarQube** | 代码质量平台 | [sonarqube.org](https://www.sonarqube.org/) |
| | **Codacy** | 代码质量分析 | [codacy.com](https://www.codacy.com/) |
| 类型检查 | **TypeScript** | JS类型系统 | [typescriptlang.org](https://www.typescriptlang.org/) |
| | **mypy** | Python类型检查 | [mypy-lang.org](https://mypy-lang.org/) |
| 安全扫描 | **Snyk** | 安全漏洞扫描 | [snyk.io](https://snyk.io/) |
| | **Checkmarx** | 应用安全测试 | [checkmarx.com](https://checkmarx.com/) |
| | **Trivy** | 容器安全扫描 | [aquasec.github.io/trivy](https://aquasec.github.io/trivy/) |

#### 动态验证

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 测试框架 | **Jest** | JS测试 | [jestjs.io](https://jestjs.io/) |
| | **Pytest** | Python测试 | [pytest.org](https://docs.pytest.org/) |
| 覆盖率 | **Istanbul** | JS覆盖率 | [istanbul.js.org](https://istanbul.js.org/) |
| | **Coverage.py** | Python覆盖率 | [coverage.readthedocs.io](https://coverage.readthedocs.io/) |
| 契约测试 | **Pact** | 消费者驱动契约 | [pact.io](https://pact.io/) |

#### 代码审查

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| AI审查 | **CodeRabbit** | AI代码审查 | [coderabbit.ai](https://coderabbit.ai/) |
| | **CodeReview.ai** | AI审查助手 | [codereview.ai](https://www.codereview.ai/) |
| PR分析 | **PullRequest** | PR自动审查 | [pullrequest.com](https://www.pullrequest.com/) |
| 质量 | **SonarCloud** | 云端代码质量 | [sonarcloud.io](https://sonarcloud.io/) |

#### 运行验证

| 类型 | 工具 | 说明 | 链接 |
|------|------|------|------|
| 健康检查 | **Healthchecks.io** | 健康监控 | [healthchecks.io](https://healthchecks.io/) |
| 冒烟测试 | **Postman** | API测试 | [postman.com](https://www.postman.com/) |
| 灰度发布 | **Flagger** | 渐进式交付 | [flagger.app](https://flagger.app/) |
| 混沌工程 | **Chaos Monkey** | 故障注入 | [netflix.github.io/chaosmonkey](https://netflix.github.io/chaosmonkey/) |

---

## 四、研发流程全景图

```mermaid
graph TB
    subgraph 需求分析
        R1[需求文档] --> R2[影响分析]
        R2 --> R3[技术方案]
    end
    
    subgraph 设计
        D1[架构设计] --> D2[接口设计]
        D2 --> D3[数据库设计]
    end
    
    subgraph 开发
        V1[代码编写] --> V2[单元测试]
        V2 --> V3[代码审查]
    end
    
    subgraph 测试
        T1[集成测试] --> T2[性能测试]
        T2 --> T3[安全测试]
    end
    
    subgraph 部署
        P1[构建打包] --> P2[环境部署]
        P2 --> P3[发布验证]
    end
    
    subgraph 运维
        O1[监控告警] --> O2[故障处理]
        O2 --> O3[持续优化]
    end
    
    R3 --> D1
    D3 --> V1
    V3 --> T1
    T3 --> P1
    P3 --> O1
    O3 -.-> R1
    
    style R1 fill:#e1f5fe
    style D1 fill:#e8f5e9
    style V1 fill:#fff3e0
    style T1 fill:#fce4ec
    style P1 fill:#f3e5f5
    style O1 fill:#e0f2f1
```

### 各阶段工具矩阵

| 阶段 | 信息层 | 执行层 | 反馈层 |
|------|--------|--------|--------|
| **需求分析** | Linear, Jira, Notion | 需求解析, 影响分析 | 需求评审 |
| **设计** | Figma, Draw.io, Mermaid | 架构图生成, API设计 | 设计评审 |
| **开发** | 代码库索引, 规范文档 | Cursor, Copilot, Claude Code | Lint, 测试, 审查 |
| **测试** | 测试用例库, 测试数据 | Jest, Playwright, Cypress | 测试报告, 覆盖率 |
| **部署** | 部署配置, 环境变量 | Docker, K8s, ArgoCD | 健康检查, 冒烟测试 |
| **运维** | 运维手册, 监控配置 | Prometheus, Grafana | 告警分析, 故障复盘 |

---

## 五、Agent类型

```mermaid
graph TB
    subgraph Agent类型
        DEV[Developer Agent<br/>开发Agent]
        QA[QA Agent<br/>测试Agent]
        OPS[Ops Agent<br/>运维Agent]
        REV[Reviewer Agent<br/>审查Agent]
        PM[Planner Agent<br/>规划Agent]
    end
    
    DEV --> |代码生成/重构| CODE[代码层]
    QA --> |测试生成/执行| TEST[测试层]
    OPS --> |部署/监控| INFRA[基础设施层]
    REV --> |审查/扫描| QUALITY[质量层]
    PM --> |规划/追踪| PLAN[规划层]
    
    style DEV fill:#bbdefb
    style QA fill:#c8e6c9
    style OPS fill:#ffccbc
    style REV fill:#f8bbd9
    style PM fill:#e1bee7
```

### Agent能力矩阵

| Agent类型 | 信息层依赖 | 执行层能力 | 反馈层输出 |
|-----------|------------|------------|------------|
| **Developer** | 代码库, 规范, 模板 | 代码生成, 文件操作, 重构 | Lint结果, 测试结果 |
| **QA** | 测试规范, 用例库 | 测试生成, 测试执行 | 测试报告, 覆盖率报告 |
| **Ops** | 监控配置, 运维手册 | 部署, 扩缩容, 故障处理 | 健康状态, 告警报告 |
| **Reviewer** | 审查规范, 最佳实践 | 代码审查, 安全扫描 | 审查报告, 风险评估 |
| **Planner** | 需求文档, 架构文档 | 任务分解, 进度追踪 | 计划, 进度报告 |

### 代表性工具

| Agent类型 | 工具 | 链接 |
|-----------|------|------|
| Developer | Cursor | [cursor.sh](https://cursor.sh/) |
| | GitHub Copilot | [github.com/features/copilot](https://github.com/features/copilot) |
| | Claude Code | [anthropic.com](https://www.anthropic.com/) |
| QA | TestGPT / CodiumAI | [codium.ai](https://www.codium.ai/) |
| | Katalon | [katalon.com](https://www.katalon.com/) |
| Ops | Datadog AI | [datadoghq.com](https://www.datadoghq.com/) |
| | Runwhen | [runwhen.com](https://www.runwhen.com/) |
| Reviewer | CodeRabbit | [coderabbit.ai](https://coderabbit.ai/) |
| | SonarQube | [sonarqube.org](https://www.sonarqube.org/) |
| Planner | Linear AI | [linear.app](https://linear.app/) |
| | Notion AI | [notion.so](https://www.notion.so/) |

---

## 六、h-agent定位

```mermaid
graph TB
    subgraph h-agent
        subgraph 反馈层
            H_LINT[Lint检查]
            H_TEST[测试运行]
            H_REVIEW[代码审查]
            H_ARCH[架构验证]
        end
        
        subgraph 执行层
            H_FILE[文件操作]
            H_SHELL[Shell命令]
            H_GIT[Git操作]
            H_DOCKER[Docker]
            H_K8S[K8s]
            H_MCP[MCP工具]
        end
        
        subgraph 信息层
            H_MEM[记忆系统]
            H_RAG[RAG索引]
            H_SKILL[技能系统]
            H_SPEC[规范管理]
        end
        
        CORE((Agent Core)) --> H_MEM
        CORE --> H_FILE
        CORE --> H_LINT
    end
    
    style CORE fill:#f9f,stroke:#333,stroke-width:3px
```

### h-agent特性

| 特性 | 说明 | 对应Harness层 |
|------|------|---------------|
| 多Agent协作 | PM/Dev/QA/Ops多角色Agent | 信息层 |
| 记忆系统 | 长期记忆+会话记忆 | 信息层 |
| RAG集成 | 代码库语义索引 | 信息层 |
| 技能系统 | 可扩展能力模块 | 执行层 |
| MCP工具 | 外部工具集成 | 执行层 |
| 权限控制 | 细粒度权限管理 | 反馈层 |
| 任务调度 | Cron+Heartbeat | 执行层 |
| 多渠道 | CLI/REPL/IDE/消息 | 执行层 |

### h-agent覆盖范围

| 阶段 | 覆盖程度 | 说明 |
|------|----------|------|
| 需求分析 | ⚪ 部分 | 可解析需求文档，追踪任务 |
| 设计 | ⚪ 部分 | 可生成Mermaid图表 |
| 开发 | 🟢 完整 | 代码生成、文件操作、Git |
| 测试 | 🟢 完整 | 测试运行、覆盖率分析 |
| 部署 | 🟡 基本 | Docker、K8s操作 |
| 运维 | 🟡 基本 | 监控查询、告警处理 |

---

## 七、工具速查表

### 按能力分类

```mermaid
mindmap
  root((AI研发工具))
    代码生成
      Cursor
      GitHub Copilot
      Claude Code
      Tabnine
      Codeium
    代码审查
      CodeRabbit
      SonarQube
      Codacy
    测试
      TestGPT
      Jest
      Playwright
      Cypress
    文档
      Mintlify
      Swimm
      Scribe
    安全
      Snyk
      Checkmarx
      Trivy
    运维
      Datadog
      PagerDuty
      Runwhen
    低代码
      Retool
      Appsmith
      ToolJet
```

### 精选工具清单

| 领域 | 首选工具 | 备选工具 | 链接 |
|------|----------|----------|------|
| AI编码 | Cursor | Copilot, Claude Code | [cursor.sh](https://cursor.sh/) |
| 代码审查 | CodeRabbit | SonarQube | [coderabbit.ai](https://coderabbit.ai/) |
| 测试生成 | CodiumAI | TestGPT | [codium.ai](https://www.codium.ai/) |
| 监控 | Datadog | Grafana+Prometheus | [datadoghq.com](https://www.datadoghq.com/) |
| CI/CD | GitHub Actions | GitLab CI, Jenkins | [github.com/features/actions](https://github.com/features/actions) |
| 需求管理 | Linear | Jira, Notion | [linear.app](https://linear.app/) |
| 设计协作 | Figma | Draw.io | [figma.com](https://www.figma.com/) |

---

## 八、实施路线

```mermaid
timeline
    title AI辅助研发实施路线
    阶段一 : 基础能力
            : 代码库索引
            : 文件操作
            : Lint检查
    阶段二 : 开发辅助
            : 代码生成
            : 代码审查
            : 测试生成
    阶段三 : 测试部署
            : 自动化测试
            : CI/CD集成
            : 容器化部署
    阶段四 : 运维闭环
            : 监控集成
            : 故障处理
            : 自动修复
    阶段五 : 智能进化
            : 知识积累
            : 能力进化
            : 自主决策
```

---

*本文档使用Mermaid图表展示AI辅助研发工具地图，所有工具链接均可点击访问。*