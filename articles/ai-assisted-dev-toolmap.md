# AI辅助研发工具地图

<div align="center">

<table style="border: 2px solid #424242; border-collapse: collapse; background: #fafafa; width: 100%; max-width: 1200px;">
<tr>
<td style="padding: 20px;">

<!-- DevOps 流程 -->
<table style="width: 100%; margin-bottom: 30px; border: 2px solid #1976d2; background: #e3f2fd;">
<tr>
<th colspan="7" style="padding: 10px; background: #1976d2; color: white; font-size: 16px;">DevOps 流程</th>
</tr>
<tr style="text-align: center;">
<td style="padding: 12px; border-right: 1px solid #90caf9;"><b>Plan</b><br><span style="font-size: 12px; color: #666;">规划</span></td>
<td style="padding: 12px; border-right: 1px solid #90caf9;"><b>Code</b><br><span style="font-size: 12px; color: #666;">编码</span></td>
<td style="padding: 12px; border-right: 1px solid #90caf9;"><b>Build</b><br><span style="font-size: 12px; color: #666;">构建</span></td>
<td style="padding: 12px; border-right: 1px solid #90caf9;"><b>Test</b><br><span style="font-size: 12px; color: #666;">测试</span></td>
<td style="padding: 12px; border-right: 1px solid #90caf9;"><b>Release</b><br><span style="font-size: 12px; color: #666;">发布</span></td>
<td style="padding: 12px; border-right: 1px solid #90caf9;"><b>Deploy</b><br><span style="font-size: 12px; color: #666;">部署</span></td>
<td style="padding: 12px;"><b>Operate</b><br><span style="font-size: 12px; color: #666;">运维</span></td>
</tr>
<tr style="text-align: center; font-size: 11px; color: #1565c0;">
<td style="padding: 8px; border-top: 1px solid #90caf9;">Linear<br>Jira</td>
<td style="padding: 8px; border-top: 1px solid #90caf9;">Cursor<br>Copilot</td>
<td style="padding: 8px; border-top: 1px solid #90caf9;">Docker<br>Webpack</td>
<td style="padding: 8px; border-top: 1px solid #90caf9;">Jest<br>Playwright</td>
<td style="padding: 8px; border-top: 1px solid #90caf9;">GitHub Actions</td>
<td style="padding: 8px; border-top: 1px solid #90caf9;">K8s<br>ArgoCD</td>
<td style="padding: 8px; border-top: 1px solid #90caf9;">Prometheus<br>Grafana</td>
</tr>
</table>

<!-- AI Harness -->
<table style="width: 100%; border: 3px solid #424242; background: white;">
<tr>
<th colspan="5" style="padding: 12px; background: #424242; color: white; font-size: 16px;">AI Harness</th>
</tr>

<!-- 反馈层 -->
<tr>
<td colspan="5" style="padding: 15px; background: #fff3e0;">
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td colspan="5" style="padding: 8px; font-weight: bold; color: #e65100; border-bottom: 2px solid #ffb74d;">反馈层 Feedback</td>
</tr>
<tr>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #ffcc80; vertical-align: top;">
<b style="color: #e65100;">静态检查</b><br>
<span style="font-size: 11px;">代码风格</span><br>
<span style="font-size: 11px;">类型检查</span><br>
<span style="font-size: 11px;">安全扫描</span>
<hr style="border: none; border-top: 1px dashed #ffcc80; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">ESLint • TypeScript<br>Snyk • SonarQube</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #ffcc80; vertical-align: top;">
<b style="color: #e65100;">动态验证</b><br>
<span style="font-size: 11px;">单元测试</span><br>
<span style="font-size: 11px;">集成测试</span><br>
<span style="font-size: 11px;">覆盖率</span>
<hr style="border: none; border-top: 1px dashed #ffcc80; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Jest • Pytest • JUnit<br>Playwright • Cypress</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #ffcc80; vertical-align: top;">
<b style="color: #e65100;">代码审查</b><br>
<span style="font-size: 11px;">质量审查</span><br>
<span style="font-size: 11px;">安全审查</span><br>
<span style="font-size: 11px;">性能审查</span>
<hr style="border: none; border-top: 1px dashed #ffcc80; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">CodeRabbit • SonarQube<br>Snyk • Lighthouse</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #ffcc80; vertical-align: top;">
<b style="color: #e65100;">运行验证</b><br>
<span style="font-size: 11px;">健康检查</span><br>
<span style="font-size: 11px;">冒烟测试</span><br>
<span style="font-size: 11px;">灰度验证</span>
<hr style="border: none; border-top: 1px dashed #ffcc80; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Healthchecks.io<br>Flagger • Argo Rollouts</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #ffcc80; vertical-align: top;">
<b style="color: #e65100;">反馈闭环</b><br>
<span style="font-size: 11px;">错误学习</span><br>
<span style="font-size: 11px;">规范更新</span><br>
<span style="font-size: 11px;">能力进化</span>
<hr style="border: none; border-top: 1px dashed #ffcc80; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">错误模式记录<br>规范迭代优化</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- 执行层 -->
<tr>
<td colspan="5" style="padding: 15px; background: #e8f5e9;">
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td colspan="6" style="padding: 8px; font-weight: bold; color: #2e7d32; border-bottom: 2px solid #81c784;">执行层 Execution</td>
</tr>
<tr>
<td style="width: 16%; padding: 10px; background: white; border: 1px solid #a5d6a7; vertical-align: top;">
<b style="color: #2e7d32;">代码操作</b><br>
<span style="font-size: 11px;">文件读写</span><br>
<span style="font-size: 11px;">代码生成</span><br>
<span style="font-size: 11px;">代码重构</span>
<hr style="border: none; border-top: 1px dashed #a5d6a7; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">read/write/edit<br>Cursor • Copilot<br>Claude Code</span>
</td>
<td style="width: 16%; padding: 10px; background: white; border: 1px solid #a5d6a7; vertical-align: top;">
<b style="color: #2e7d32;">开发工具</b><br>
<span style="font-size: 11px;">Shell命令</span><br>
<span style="font-size: 11px;">Git操作</span><br>
<span style="font-size: 11px;">包管理</span>
<hr style="border: none; border-top: 1px dashed #a5d6a7; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">bash • exec<br>git-commit/push<br>npm • pip • maven</span>
</td>
<td style="width: 16%; padding: 10px; background: white; border: 1px solid #a5d6a7; vertical-align: top;">
<b style="color: #2e7d32;">测试工具</b><br>
<span style="font-size: 11px;">测试执行</span><br>
<span style="font-size: 11px;">测试生成</span><br>
<span style="font-size: 11px;">覆盖率</span>
<hr style="border: none; border-top: 1px dashed #a5d6a7; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Jest • Pytest • JUnit<br>TestGPT • CodiumAI<br>Istanbul • JaCoCo</span>
</td>
<td style="width: 16%; padding: 10px; background: white; border: 1px solid #a5d6a7; vertical-align: top;">
<b style="color: #2e7d32;">部署工具</b><br>
<span style="font-size: 11px;">容器化</span><br>
<span style="font-size: 11px;">K8s部署</span><br>
<span style="font-size: 11px;">CI/CD</span>
<hr style="border: none; border-top: 1px dashed #a5d6a7; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Docker • Podman<br>kubectl • Helm • ArgoCD<br>GitHub Actions • Jenkins</span>
</td>
<td style="width: 16%; padding: 10px; background: white; border: 1px solid #a5d6a7; vertical-align: top;">
<b style="color: #2e7d32;">运维工具</b><br>
<span style="font-size: 11px;">监控查询</span><br>
<span style="font-size: 11px;">日志检索</span><br>
<span style="font-size: 11px;">故障处理</span>
<hr style="border: none; border-top: 1px dashed #a5d6a7; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Prometheus • Grafana<br>ELK • Loki<br>扩缩容 • 回滚</span>
</td>
<td style="width: 16%; padding: 10px; background: white; border: 1px solid #a5d6a7; vertical-align: top;">
<b style="color: #2e7d32;">外部集成</b><br>
<span style="font-size: 11px;">数据库</span><br>
<span style="font-size: 11px;">消息队列</span><br>
<span style="font-size: 11px;">API调用</span>
<hr style="border: none; border-top: 1px dashed #a5d6a7; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">PostgreSQL • MySQL<br>Kafka • RabbitMQ<br>HTTP • MCP Tools</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- 信息层 -->
<tr>
<td colspan="5" style="padding: 15px; background: #e3f2fd;">
<table style="width: 100%; border-collapse: collapse;">
<tr>
<td colspan="5" style="padding: 8px; font-weight: bold; color: #1565c0; border-bottom: 2px solid #64b5f6;">信息层 Information</td>
</tr>
<tr>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #90caf9; vertical-align: top;">
<b style="color: #1565c0;">Memory 记忆</b><br>
<span style="font-size: 11px;">长期记忆</span><br>
<span style="font-size: 11px;">会话记忆</span><br>
<span style="font-size: 11px;">工作记忆</span>
<hr style="border: none; border-top: 1px dashed #90caf9; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">h-agent Memory<br>LangChain Memory<br>Mem0 • Redis</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #90caf9; vertical-align: top;">
<b style="color: #1565c0;">Context 上下文</b><br>
<span style="font-size: 11px;">RAG索引</span><br>
<span style="font-size: 11px;">知识库</span><br>
<span style="font-size: 11px;">文档库</span>
<hr style="border: none; border-top: 1px dashed #90caf9; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Chroma • Pinecone<br>Weaviate • Milvus<br>LlamaIndex • Sourcegraph</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #90caf9; vertical-align: top;">
<b style="color: #1565c0;">Spec 规范</b><br>
<span style="font-size: 11px;">代码规范</span><br>
<span style="font-size: 11px;">架构规范</span><br>
<span style="font-size: 11px;">安全规范</span>
<hr style="border: none; border-top: 1px dashed #90caf9; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">ESLint • Prettier<br>ArchUnit • 分层规则<br>OWASP • Snyk</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #90caf9; vertical-align: top;">
<b style="color: #1565c0;">History 历史</b><br>
<span style="font-size: 11px;">Git历史</span><br>
<span style="font-size: 11px;">Issue/PR</span><br>
<span style="font-size: 11px;">运维记录</span>
<hr style="border: none; border-top: 1px dashed #90caf9; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">Git • GitHub • GitLab<br>Jira • Linear<br>PagerDuty • Opsgenie</span>
</td>
<td style="width: 20%; padding: 10px; background: white; border: 1px solid #90caf9; vertical-align: top;">
<b style="color: #1565c0;">Skill 技能</b><br>
<span style="font-size: 11px;">技能平台</span><br>
<span style="font-size: 11px;">推荐技能</span><br>
<span style="font-size: 11px;">自定义技能</span>
<hr style="border: none; border-top: 1px dashed #90caf9; margin: 8px 0;">
<span style="font-size: 10px; color: #666;">ClawHub • MCP Registry<br>Playwright • Draw.io<br>flow-trace • web-search</span>
</td>
</tr>
</table>
</td>
</tr>

<!-- Agent Core -->
<tr>
<td colspan="5" style="padding: 20px; text-align: center; background: #fce4ec;">
<table style="margin: 0 auto; border: 3px solid #e91e63; background: white; border-radius: 50px;">
<tr>
<td style="padding: 15px 40px; text-align: center;">
<b style="font-size: 18px; color: #c2185b;">Agent Core</b><br>
<span style="font-size: 12px; color: #666;">AI推理引擎</span><br>
<span style="font-size: 11px; color: #999;">多Agent协作 • 任务编排 • 权限控制 • 会话管理</span>
</td>
</tr>
</table>
</td>
</tr>
</table>

</td>
</tr>
</table>

</div>

---

## 工具链接速查

### 信息层

| 分类 | 工具 | 链接 |
|------|------|------|
| RAG索引 | Chroma | [trychroma.com](https://www.trychroma.com/) |
| | Pinecone | [pinecone.io](https://www.pinecone.io/) |
| | Weaviate | [weaviate.io](https://weaviate.io/) |
| 知识库 | Notion | [notion.so](https://www.notion.so/) |
| | LlamaIndex | [llamaindex.ai](https://www.llamaindex.ai/) |
| 代码搜索 | Sourcegraph | [sourcegraph.com](https://sourcegraph.com/) |
| 规范 | ESLint | [eslint.org](https://eslint.org/) |
| | ArchUnit | [archunit.org](https://www.archunit.org/) |
| 技能平台 | ClawHub | [clawhub.ai](https://clawhub.ai/) |

### 执行层

| 分类 | 工具 | 链接 |
|------|------|------|
| 代码生成 | Cursor | [cursor.sh](https://cursor.sh/) |
| | GitHub Copilot | [github.com/features/copilot](https://github.com/features/copilot) |
| | Claude Code | [anthropic.com](https://www.anthropic.com/) |
| 测试 | Jest | [jestjs.io](https://jestjs.io/) |
| | Playwright | [playwright.dev](https://playwright.dev/) |
| | TestGPT | [codium.ai](https://www.codium.ai/) |
| 部署 | Docker | [docker.com](https://www.docker.com/) |
| | Kubernetes | [kubernetes.io](https://kubernetes.io/) |
| | ArgoCD | [argo-cd.readthedocs.io](https://argo-cd.readthedocs.io/) |
| CI/CD | GitHub Actions | [github.com/features/actions](https://github.com/features/actions) |
| | Jenkins | [jenkins.io](https://www.jenkins.io/) |
| 监控 | Prometheus | [prometheus.io](https://prometheus.io/) |
| | Grafana | [grafana.com](https://grafana.com/) |
| | Datadog | [datadoghq.com](https://www.datadoghq.com/) |

### 反馈层

| 分类 | 工具 | 链接 |
|------|------|------|
| 代码质量 | SonarQube | [sonarqube.org](https://www.sonarqube.org/) |
| | CodeRabbit | [coderabbit.ai](https://coderabbit.ai/) |
| 安全扫描 | Snyk | [snyk.io](https://snyk.io/) |
| | Trivy | [aquasec.github.io/trivy](https://aquasec.github.io/trivy/) |
| 性能 | Lighthouse | [developer.chrome.com/docs/lighthouse](https://developer.chrome.com/docs/lighthouse/) |

---

*此地图展示AI辅助研发的完整工具生态，Harness三层包围Agent，DevOps流程独立在外*