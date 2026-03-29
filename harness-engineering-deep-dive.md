# Harness Engineering：一个被忽视的真相

## 从一个数字说起

**同一个模型，换一套运行环境，编程基准的成功率就从42%跳到了78%。**

这个数据来自 Nate B Jones 的一项研究——只有一个变量变了：模型外面包裹的那层"壳"。模型没换，数据没换，提示词也没换，只是改了壳，性能翻了将近一倍。

**这层壳，现在有了一个正式的名字：Harness。**

LangChain 用同一个模型（gpt-5.2-codex），只改 Harness，Terminal Bench 2.0 的成绩从 52.8% 升到 66.5%。排名从三十名开外直接冲进前五。

Pi Research 的发现更直接：他们在一个下午内，仅通过修改 Harness，就提升了 15 个不同 LLM 的编程能力。

**Harness 带来的提升，相当于换了一代模型。**

而更震撼的数据来自 OpenAI：

**3名工程师，5个月，1500个PR，100万行代码，人类一行代码都没写。**

这是 OpenAI Codex 团队从空仓库开始的实验。团队后来扩到 7 人，每位工程师每天合并 3.5 个 PR。如果用传统方式手写，工期应该是现在的 10 倍。

**那些工程师在干什么？**

OpenAI 的核心工程师 Ryan Lopopolo 写下了一句总结：

> **"Agent不难，Harness才难。"**

他们不是不工作，而是**从"砌砖"变成了"设计建筑规范"**。

---

## 三层进化：从邮件到办公室

要理解 Harness Engineering，得先看它是怎么一步步"长"出来的。

**2022-2024：Prompt Engineering**

圈子里最火的是怎么写好一条指令。研究的是 few-shot、chain-of-thought、角色扮演——打磨"一次性的输入"。

**2025：Context Engineering**

风向变了。Andrej Karpathy 和 Shopify CEO Tobi Lütke 开始推一个新概念：单条 prompt 不够用了，你得为模型动态构建整个上下文环境——相关文件、历史对话、工具定义、知识库检索结果。

**2026：Harness Engineering**

它来了。打个比方：

- Prompt Engineering = 教你怎么写一封好邮件
- Context Engineering = 教你怎么把相关附件都带上
- Harness Engineering = 教你怎么搭建整个办公室

它包含了 Context Engineering，但在更高层面运作：**约束、反馈循环、架构规则、工具链、生命周期管理，以及对抗熵增的持续治理。**

---

## 我理解的Harness

读完 OpenAI、Anthropic、LangChain 三家分享的内容后，我发现了一个被忽视的真相：

**Harness不是"限制"AI，而是"赋能"AI。**

LangChain创始人Harrison Chase说了一句话：

> "Harness是最重要的东西。Claude模型很好，但真正让Claude Code成功的是它的Harness。"

为什么？因为模型本身已经足够聪明了。它缺的不是能力，是**工作的环境和边界**。

Philipp Schmid 给了一个特别好懂的类比：

> **模型就是CPU，算力再强，没有操作系统也跑不起来。而 Harness，就是给 AI Agent 套上的那层操作系统。**

它包括上下文管理（怎么把信息喂给 Agent）、架构约束（什么能做什么不能做）、反馈循环（怎么让 Agent 知道自己做对了没）、工具链（Agent 能用哪些工具），以及整个生命周期的管理。

过去两年，我们一直在升级 CPU——更大的模型、更长的上下文、更强的推理能力。但操作系统呢？还停留在 DOS 时代。

大多数人用 AI Agent 的方式，还是"打开终端，输入命令，看结果"。没有文件系统的概念，没有进程管理，没有标准驱动，没有权限控制。

**难怪它不好用。**

---

## Harness 的六组件框架

综合行业实践，Harness 大致包括以下六个部分：

| 组件 | 作用 |
|------|------|
| Memory & Context | "Agent应该看到什么信息"——上下文裁剪、压缩、按需检索、外部状态存储 |
| Tools & Skills | 扩展行动能力——工具提供可调用的外部能力，skills提供可复用的任务方法 |
| Orchestration | 编排任务流程——协调每个agent的分工，决定何时规划、何时执行、何时交接 |
| Infra & Guardrails | 运行环境和边界——沙箱、权限控制、失败恢复、安全护栏 |
| Evaluation & Verification | 验证闭环——内置测试、检查、反馈机制，让Agent自行验证工作 |
| Tracing & Observability | 还原行为过程——执行轨迹、日志、监控、成本分析，让黑箱透明可见 |

这六个组件可以进一步归成三层：**信息层、执行层、反馈层**。

---

## 三家三种方法，但说的是同一件事

### OpenAI：仓库就是大脑

OpenAI 的第一个核心理念是：**仓库是 Agent 唯一的知识来源**。

代码、markdown、schema、可执行计划，全都版本化地存在仓库里。没有外部 wiki，没有 Notion 文档，没有"口口相传"的潜规则。Agent 看不到仓库之外的东西，所以仓库必须包含 Agent 工作所需的一切。

而且随着项目推进，他们发现需要把越来越多的"隐性知识"显性化，推入仓库。以前靠老员工口头传授的东西，现在必须写成文档，因为 Agent 不会来问你、也不会去茶水间聊天。

第二个理念跟传统认知相反：**代码不仅要对人类可读，更要对 Agent 可读**。

Agent 理解代码的方式跟人类不一样。它们更依赖结构化的线索：严格的分层架构、一致的命名模式、显式的类型定义。那些对人类来说"一看就懂"的隐含约定，对 Agent 来说可能是致命盲区。

他们在架构设计上做了大量工作，确保代码结构本身就能引导 Agent 做出正确的决策。这是一种新的可读性标准：**application legibility**，应用的可读性。

第三个理念是渐进式的自主性提升。他们没有一上来就让 Agent 全权负责所有事情。而是从简单任务开始，逐步提升 Agent 的自主权限。到了后期，单个 Codex 任务可以连续运行 6 个小时以上。

**自主性的提升，必须建立在约束系统成熟的基础上。**

他们的做法让我印象深刻的是**AGENTS.md只有100行**。

不是1000页的操作手册，而是一张"地图"——告诉你系统架构是什么、依赖关系是什么、哪些地方能动哪些不能动。

ETH Zurich 的一项研究发现，CLAUDE.md / AGENTS.md 文件应该控制在 60 行以内。过长的指令文件反而会降低 Agent 的表现。

### Anthropic：对抗思维

Anthropic提出了三agent架构：Planner、Generator、Evaluator。

这明显受GAN（生成对抗网络）启发。Generator负责创造，Evaluator负责评估，两者对抗进化。

**为什么需要Evaluator？**

因为AI有个致命问题：**自我评估倾向**。它会夸自己的工作，很难客观评价输出质量。

Anthropic的方法是：让独立的Evaluator提供客观反馈，不受Generator的心理影响。

这解决了一个深层问题：**确认偏误的数字化**。AI基于内部逻辑形成"信念"，然后倾向于寻找支持这些信念的证据，忽略反面证据。

**独立的评估机制打破了这种自恋循环。**

---

## 信息层设计：精准比求全更重要

信息层解决的问题听起来很简单：给 agent 提供它需要的信息。但在实践中，这却是最容易犯错的地方——错误原因往往不是给得太少，而是**给得太多**。

模型存在 **context decay（上下文衰减）** 的问题。随着上下文不断变长，模型并不是线性地"知道得更多"，而是更容易被无关噪音分散注意力，导致对关键信息点的利用效率下降。

### Trick 1：渐进式披露

把信息做成"分层加载"的系统，让模型在不同阶段只接触当下需要的那一层。

Claude Code 把核心信息做了三层分级：

| 层级 | 内容 | 作用 |
|------|------|------|
| Level 1 | CLAUDE.md | 最关键的元规则，总入口 |
| Level 2 | SKILL.md | 按需调用的小型能力包 |
| Level 3 | references、scripts | 完成任务真正需要的细节 |

本质上，渐进式披露就是控制信息的出场顺序，让模型的注意力始终集中在当前最关键的 1% 信息上。

### Trick 2：工具越少而精越好

这相当反直觉：随着模型能力的提升，它对外部工具的依赖应当是**递减的**，而不是越加越多。

Vercel 团队最初给 agent 配备了涵盖搜索、代码、文件、API 的完整工具库（15 个），结果表现很差；精简到只保留核心工具（2 个）之后，速度和可靠性都显著提升——**准确率从 80% 升到了 100%**。

Claude Code 目前有大约 20 个工具，即使如此，他们团队也一直在审视是否真的需要所有这些工具，并且在非常谨慎地增加新工具。

**Agent 的强大不在于工具箱里有多少把扳手，而在于它是否拥有几把完美的"万能扳手"，以及如何高效地组合它们。**

过于复杂的工具是模型幻觉的温床。一个常见失败模式就是工具集越加越多，导致 agent 陷入决策瘫痪。

### Trick 3：Context window 的"甜蜜区间"

很多独立的工程实践都得出了一个相同的发现：当上下文利用率超过一个区间之后，性能就会开始下降。

一个最新的大海捞针测试显示，当输入 token 数量从 256K 逐渐拉满到 1M 时，几乎所有主流大模型的表现都出现了明显下滑。表现最好的模型（Opus 4.6 系列），长上下文下还能维持七成的检索命中率；表现没那么稳的模型（GPT-5.4、Gemini 3.1 Pro），命中率会直接掉到三成。

为什么有效的 context window 通常没有大家想象中那么长？核心原因是 **Attention 的"稀疏性"**。随着 context 变长，模型的注意力会被摊薄到更多位置上。它虽然看见了更多 token，但未必还能稳定地把注意力放在最关键的那几个点上。

所以很多顶级工程师会频繁进行上下文压缩，把 context window 利用率控制在 **60% 以下**。

### Trick 4：利用 Subagent 做 Context 隔离

当主 agent 的 context 开始变重时，把子任务分配给独立的 subagent。每个 subagent 都在更小、更干净的 context 里完成自己的任务，少受无关信息干扰。

Claude Code 负责人 Boris Cherny 把这套方法叫做 **context firewall**。当遇到复杂任务时，他会直接让主 agent "use subagents"，把看日志、查代码、搜文档这些事情并行拆开，主线程自己只做两件事：调度，以及收口。

### LangChain：模块思维

Harrison Chase总结了四个核心primitive：

| Primitive | 作用 |
|-----------|------|
| System Prompt | 驱动Agent的引擎 |
| Planning Tools | Agent的思维草稿 |
| Subagents | 上下文隔离机制 |
| Filesystem | 让Agent管理自己的上下文 |

还有一个新primitive：**Skills**。

Skills不是加载进System Prompt，而是在System Prompt中引用。Agent被告知"你有code-writing skill"，然后在需要时自己去读取这些文件。

**这就是渐进式披露——告诉LLM它有什么可用，让它按需获取，而不是一开始就塞满所有细节。**

---

## 执行层设计：给 Agent 一套执行规划

如果说信息层关心的是"给 agent 什么信息"，那么执行层关心的就是"让 agent 怎么做事"。

### Trick 5：把研究、计划、执行、验证分开

Top AI labs 的一个很普遍的做法，是把一条任务链拆开，分成四步：**research → plan → execute → verify**。

每个阶段是单独的 session，有单独的 context，而不是期待它一气呵成。这背后同样是因为 Agent 脑容量有限，把四个阶段压进同一个 context，会造成不必要的 context 污染。

Boris Cherny 的 CLAUDE.md 里有一条明确的规则：

> Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions). If something goes sideways, STOP and re-plan immediately — don't keep pushing.

他在 26 年 1 月还做了一层强化：用户接受计划之后，Claude Code 会自动清空 context，让执行阶段从一个干净的起点开始。他的观察是，执行阶段如果继续背着研究阶段留下的大量上下文，很容易被噪音干扰；反过来，把研究和执行切开，反而更能保证计划被准确落实。

### Trick 6：人最该介入的地方，是事前规划

绝大多数人类用户只喜欢验收结果，而不重视前期的规划设计。但实际上，人恰恰应该把精力从事后的 code review，尽量前移到 **research 和 plan** 这两个杠杆更高的环节。

因为一行糟糕的代码，影响的可能只是一行；一行糟糕的计划，往往会长出几百行糟糕的代码。

**越是上游环节，带来的单位时间的影响越大。**

---

## 反馈层设计：Agent 的复利飞轮

反馈层决定的是系统随时间能变得多好。这是三层里最容易被忽视、也最能产生复利效应的一层。

反馈层的核心逻辑，其实就是 harness engineering 这个概念最原始的定义。Mitchell Hashimoto 在自己的 blog 中是这么写的：

> Anytime you find an agent makes a mistake, you take the time to engineer a solution such that the agent never makes that mistake again.

这背后是一种工程纪律：**每一次失败都不是终点，而是一次让系统永久变好的机会。**

他的做法是，每一次真实翻车的问题，都会被他尽量记到 AGENTS.md 里。包括 Claude Code 团队也会全员共同维护一个 CLAUDE.md，只要 Claude 做错了一件事，就把这条经验补进去，让它下次不要再犯同样的错误。

### Trick 7：构建反馈闭环

Boris Cherny 分享过一个数据：**只要给 Claude 提供有效的验证手段，其最终产出的质量通常能提升 2-3 倍。**

他的做法包括：
- 任务完成后，提醒另一个 agent 验证结果，或者开启 stop hook 自发校验
- 让 Claude 自己打开浏览器、测试 UI、反复迭代直到 UX 过关

Karpathy 最近提出的 **autoresearch** 的思路同样很有启发。重点不是让 AI 一次性想出最好的答案，而是让 AI 进入一个可控闭环：自主提出 idea → 做实验 → 观察实验结果 → 保留有效策略、丢掉无效分支 → 反思后继续提出不一样的改进策略 → 如此反复循环。

---

## OpenAI 的三根支柱

OpenAI 团队把他们的 Harness 拆成了三个部分：

### 上下文工程

他们不仅放了 AGENTS.md，还给 Agent 接了浏览器（通过 Chrome DevTools Protocol），让它能看到 UI 渲染结果，自己判断页面做得对不对。

接了完整的可观测性栈（基于 Vector、Victoria Logs/Metrics/Traces），而且是每个 worktree 都有一套本地的日志、指标和链路追踪。Agent 可以自己查报错，自己看性能数据，自己定位问题在哪一层。

**大多数公司连人类工程师都没配这么齐全的可观测性，OpenAI 倒先给 Agent 配齐了。**

### 架构约束

这才是 Harness 最核心的一环。

他们设计了严格的分层架构：Types → Config → Repo → Service → Runtime → UI，每一层只能依赖下面的层。

这些规则没有靠 prompt 告诉 Agent"请遵守"，用的是确定性的 linter 和结构化测试来机械执行。Agent 违反了架构规则？CI 直接挂掉，没得商量。

而且 linter 的报错信息里，还嵌入了修复指引，告诉 Agent 应该怎么改。这一招，相当于把"老师傅的经验"写进了编译器。

Cursor 团队在他们的"Self-Driving Codebases"研究中，也得出了类似的结论：

> **约束比指令更有效。告诉 Agent"不要留 TODO"比告诉它"完成所有实现"效果更好。**

这背后有一个反直觉的洞察：**约束解空间反而让 Agent 更有生产力。**当 Agent 可以生成任何东西时，它会浪费 token 探索死胡同。当 Harness 定义了清晰的边界，Agent 反而更快收敛到正确答案。

### 熵管理

他们管这个叫"垃圾回收"。

AI 生成的代码写多了，文档会过时，架构会漂移，风格会走样。所以他们定期启动专门的 Agent，去扫描文档不一致、架构违规等问题，提交修复 PR。这些 PR 大多能在一分钟内审查并合并。

OpenAI 团队把这种心态总结成了一句话：

> 当 Agent 遇到困难时，我们把它当作一个信号：找出缺了什么，是工具、是护栏、还是文档，然后把解决方案反哺回仓库。

这其实构成了一个持续改进的飞轮：

**Agent 犯错 → 人类诊断原因 → 改进 Harness → Agent 下次不再犯同样的错 → 新的错误出现 → 循环继续。**

---

## 我发现的两个深层问题

### 问题一：上下文焦虑

随着对话进行，AI的上下文窗口会膨胀，导致性能下降。

Anthropic提出两种解决：

- **Context Reset**：清空重来
- **Context Compaction**：就地压缩

LangChain的做法更巧妙：**把Compaction后的原始历史dump到文件系统**。

这样Agent在需要时可以回去查看完整细节。摘要可能覆盖80-95%的场景，但那5%呢？**文件系统给了Agent回头的能力。**

更进一步：LangChain正在开发一个新能力——**给Agent一个工具，让它自己决定何时触发Compaction**。

> "如果你让Agent去做Y，但当前上下文全是X相关的内容——即便只用了60%上下文，也应该压缩，因为那些信息对做Y来说是干扰。"

这是"让模型做更多"理念的体现——不只是被动触发，而是让Agent主动判断。

### 问题二：通信是最难的部分

Subagent解决了上下文爆炸问题，但带来了新问题：**隔离是优势，也是劣势**。

Harrison Chase说得很直接：

> "主Agent启动一个Subagent，Subagent做了一大堆工作，关键的发现都在中间，但最后只返回'Done'。主Agent懵了：Done？你Done了个啥？"

**通信是最难的部分。**这不是技术问题，是信息设计问题。

---

---

## 行业案例：谁在做 Harness Engineering？

### Stripe：每周 1300 个 PR

Stripe 内部的"Minions"系统，可能是目前规模最大的 Agent 编程实践。

**每周合并 1300 多个 PR，全部由无人值守的 Agent 完成。**

它的架构有个值得细看的设计：Blueprint 编排系统，把工作流拆成确定性节点和 Agentic 节点的混合体。

确定性节点（比如"运行 linter""推送更改"）按固定路径执行，不调用 LLM。Agentic 节点（比如"实现这个功能""修复 CI 失败"）才让 LLM 行使判断。

这就像一条生产线：传送带是确定性的，工人的手艺活是 Agentic 的。

Stripe 还有一个硬性限制：**CI 最多跑两轮**。第一轮 CI 失败了，Agent 自动修复，再跑一次。如果还失败，直接转交人类。不允许 Agent 在 CI 上无限重试。

他们的内部工具平台"Toolshed"挂载了大约 500 个 MCP 工具，但给每个 Agent 的只是精心筛选过的子集。因为他们发现了一个关键规律：**更多的工具并不等于更好的表现。**

Stripe 工程团队的总结：

> 成功取决于可靠的开发者环境、测试基础设施和反馈循环，跟模型选择关系不大。如果对人类友好，对 LLM 也一样友好。

### Cursor：每小时 1000 个 commit

Cursor 的"Self-Driving Codebases"研究走得更远。

他们搭建了一个多 Agent 系统，能实现约每小时 1000 个 commit，一周内超过 1000 万次工具调用。启动后无需任何人工干预。

但他们走过的弯路恰恰说明了 Harness 设计的难度：

- 第一版：单 Agent，复杂任务扛不住
- 第二版：多 Agent 共享状态文件，结果锁竞争严重，Agent 之间互相打架
- 第三版：结构化角色分工（Planner → Executor → Workers → Judge），太僵硬了
- 第四版：持续执行器，角色过载导致各种诡异行为

最终版本是递归 Planner-Worker 模型：一个根级 Planner 拥有全局视野，生成子 Planner 处理细分任务，Worker 在仓库副本上独立操作。

他们还发现了一个有点黑色幽默的现象：**差的初始指令会在数百个 Agent 间被放大**。一条模糊的指令，一个 Agent 犯的错，乘以几百个并发 Agent……结果可想而知。

### Peter Steinberger：一个人的军队

这位前 iOS 圈的知名开发者，靠着 Agent 驱动的工作流，2026 年 1 月单月产出了**6600 多个 commit**。

他同时运行 5 到 10 个 Agent，OpenClaw 项目在 4 个月内拿到了 18 万 stars，成了 GitHub 上增长最快的仓库。

他的做法相当激进：他不逐行审查 Agent 生成的代码。在他看来，代码审查应该变成"prompt review"。他更关心的是生成代码的那个提示词写得好不好，代码本身长什么样倒在其后了。

他还发现了一个反常识的现象：

> **喜欢算法谜题的工程师反而很难适应 Agent 工作流，而产品导向的工程师适应得更快。**

今年 2 月，他加入了 OpenAI。这件事本身，大概也算是对 Harness Engineering 价值的一种认可吧。

---

## Memory的三种类型：我看过最清晰的框架

Harrison Chase提出的Memory分类让我豁然开朗：

| 类型 | 是什么 | 技术实现 |
|------|--------|----------|
| Semantic Memory | 事实和知识 | RAG |
| Episodic Memory | 对话历史 | 历史记录查询 |
| Procedural Memory | "如何做某事的指令" | System Prompt + Skills + Tools |

**Procedural Memory是最有趣的一种。**

LangChain Deep Agents的设计：把System Prompt、Skills、Tools都表示为文件。这意味着**Agent可以修改自己的程序记忆——它可以学习、可以进化**。

> "当我们说Agent可以学习，真正意思是它可以修改自己的程序记忆，这些记忆以文件形式存储在文件系统中。"

这打开了一个全新的可能性。

---

## 路线之争：Big Model vs Big Harness

Latent Space 在 3 月初做了一期专题分析，标题就是《Is Harness Engineering Real?》，把整个行业分成了两大阵营。

### Big Model 阵营

核心观点：模型能力的增长才是主旋律，Harness 只是权宜之计。

OpenAI 的 Noam Brown 在访谈中直接表态：

> Harness 就像一根拐杖，我们终将能够超越它。

他的论据有历史支撑。在推理模型出现之前，开发者们在 GPT-4o 上搭建了大量复杂的 Agentic 系统来模拟推理能力。路由器、编排器、multi-agent 协作……一整套基础设施。

然后呢？推理模型一出来，这些基础设施一夜之间就不需要了。

> 之前投入了大量工程来构建这些 Agentic 系统……结果我们造了推理模型之后，你根本不需要那些复杂的行为了。事实上，在很多时候，这些东西反而让效果更差了。

Claude Code 团队的 Boris Cherny 和 Cat Wu 在受访时表示：

> 所有的秘密武器都在模型本身。我们追求的是最薄的那层包装。

### Big Harness 阵营

核心观点：模型是引擎，Harness 是方向盘和刹车。引擎再强，没有方向盘你也到不了目的地。

Jerry Liu（LlamaIndex 创始人）的话代表了这一派的立场：

> Model Harness 就是一切。从 AI 那里获取价值的最大障碍，是你自己为模型做上下文工程和工作流工程的能力。

支撑这个观点的数据也不少。调研显示，开发者在 60% 的工作中使用 AI，但真正完全委托给 AI 的任务只有 0 到 20%。这中间的巨大鸿沟，在 Harness 阵营看来，问题出在 Harness 上，跟模型本身关系不大。

Cursor 的 $50B 估值（算是 Harness 公司的代表），某种程度上也在印证这个方向的价值。

---

## 护栏悖论：我的核心判断

我觉得两边都对了一半，但都忽略了一个更深层的东西。

Philipp Schmid 观察到一个现象：Harness 本身也在不断被简化。

- Manus 在 6 个月内重构了 5 次 Harness
- LangChain 一年内重新架构了 3 次研究型 Agent
- Vercel 砍掉了 80% 的 Agent 工具

这说明 Harness 并非一劳永逸的。它需要跟着模型能力一起演化。模型变强了，Harness 就该变薄。

但"变薄"和"消失"是两回事。

Böckeler 在 Martin Fowler 网站上的分析提出了一个关键洞察：Harness 真正的价值，其实在于**约束解空间**。

她认为，要大规模维护 AI 生成的代码，关键在于通过特定的架构模式、强制的边界、标准化的结构，把解空间收窄到一个可控的范围内。

这就是我想说的**护栏悖论**：

> **车速越快，护栏越重要。**

公路上，时速 30 公里的自行车道可以没有护栏。时速 120 公里的高速公路，护栏是标配。时速 300 公里的磁悬浮列车呢？不仅有护栏，整个轨道都是封闭的。

模型就是引擎。引擎越强，速度越快，你就越需要精心设计的约束系统来确保它跑在正确的方向上。

Noam Brown 当然也说得对，很多脚手架确实会随着模型进化而被淘汰。但架构约束、反馈循环、熵管理这些东西，本质上不会消失，只会换一种形态。

就像从马车到汽车，马鞭消失了，但方向盘和刹车不会消失。

Philipp Schmid 的建议可以用三个词概括：**Start Simple. Build to Delete.**

---

## 模型 vs Harness：更深的关系

关于 harness，所有人都在好奇的一个问题是：模型会吃掉脚手架吗？

### 训练即部署

Agent 能力的上限，越来越由环境质量决定，而不只是模型本身。所以在 agentic RL 的训练逻辑里，模型和 harness 从一开始就不是分开设计的。

普通 chatbot 的 RLHF 是单轮的，奖励信号密集，反馈直接。Agentic RL 则非常不同：

- 多轮、长链路、带工具调用（一次 rollout 可能调用上百次工具）
- 动作空间极大
- 奖励信号非常稀疏，复杂任务可能 1000 次尝试才成功一次
- 很依赖真实环境中的反馈（测试有没有通过、代码跑没跑起来、lint 报没报错）

这意味着，训练效果在很大程度上取决于"训练场设计得好不好，像不像真实世界"。

Windsurf 在训练 SWE-1.5 时表达得更直接：

> 我们认为，在 RL 过程中，coding 环境本身的质量，对模型最终表现的影响是最大的。

> 我们的思路是把模型和 harness 当成一个整体来共同优化：一边反复使用模型，一边暴露 harness 中的问题，再去调整工具和 prompt，最后基于新的 harness 继续训练模型。

### Harness 即数据

Philipp Schmid 有一个金句：

> **Harness 本身就是数据集。现在真正的竞争优势，在于你的 harness 能捕获到怎样的执行轨迹。**

现在真正有价值的数据，不再只是静态语料，还包括了 agent 在具体业务流程中跑出来的执行轨迹：它看到了什么信息，使用了什么工具，做了什么决策，哪一步容易出错，什么反馈会让它变得更好。

在这种情况下，harness 不再只是模型外面的脚手架，而是**模型能力生成的土壤**。土壤的质量，会一定程度上决定和反哺智能的生长。

以 Anthropic 为例，它在 harness 上的探索比 OpenAI 领先了一段时间，但就是这几个月的窗口期给了它巨大的机会。现在市场的情况是：即使目前的模型水平两家已经基本打平了，但大多数人依然在用 Claude Code。

---

## 七个杠杆：具体怎么做？

从目前行业的实践来看，Harness 的配置杠杆大概有这么几类：

| 杠杆 | 做法 |
|------|------|
| AGENTS.md | 在仓库根目录放一个 markdown 文件（控制在 60 行以内），写上架构约定、命名规范。每次 Agent 犯了一个错，就加一条规则 |
| 确定性约束 | linter、类型检查、结构化测试、pre-commit hooks。这些是"硬约束"，Agent 无法绕过 |
| 工具精简 | 别给 Agent 塞太多工具。Stripe 有 500 个工具，但每个 Agent 只能看到精心筛选过的子集 |
| Sub-Agent 隔离 | 把复杂任务拆成多个子任务，每个子 Agent 有自己的上下文窗口 |
| 反馈循环 | Agent 写完代码后，必须能自己跑测试、看截图、查日志 |
| CI 限速 | Stripe 的做法：最多两轮 CI。跑两次还不过，就交给人类 |
| 垃圾回收 | 定期启动 Agent 扫描技术债、过时文档、架构漂移 |

---

## 我的核心观点

读完三家内容后，我有一个核心观点：

**Harness不是"限制"AI，而是"定义"AI。**

Memory定义了Agent的身份。System Prompt和Skills才是核心资产。

无论你用一个大Agent带20个Skills，还是20个Subagents，**不变的是每个部门的指令和工具**。这些才是有价值的资产。

**模型会进步。Harness会变化。但你编码进System Prompt的智慧、你设计的工具和Skills——这些才是真正属于你的东西。**

---

## 最后的思考：这不就是管理吗？

写到这里，我忽然意识到一件事。

Harness Engineering 说的这些，上下文管理、架构约束、反馈循环、定期清理……这不就是管理吗？

想想看，一个好的技术 leader 是怎么带团队的？

给新人写 onboarding 文档（AGENTS.md），定代码规范和架构原则（linter 和结构测试），做 code review 确保质量（CI/CD 检查），定期还得做技术债清理（垃圾回收），给工具做精简和选型（工具链管理），遇到反复出现的问题就写进 wiki（反馈循环）。

**AI Agent 越强，就越像一个能力很强但需要管理的员工。**

你不会把一个刚入职的天才工程师扔进一个没有文档、没有规范、没有 CI 的项目里，然后指望他写出完美的代码。

同样的道理，你也不该把一个强大的 AI 模型扔进一个没有 Harness 的环境里，然后抱怨它不好用。

Peter Steinberger 说，喜欢算法谜题的工程师反而很难适应 Agent 工作流，产品导向的工程师适应得更快。

这也印证了一个趋势：**未来最吃香的 AI 工程师，可能是最懂"管理"的那种。**

管理谁？管理 Agent。

Stripe 的工程师们已经不写代码了，他们写的是 Blueprint、是规则、是约束。OpenAI 的工程师们也不写代码了，他们设计的是环境、反馈循环和控制系统。

---

## What's Next：Coordination Engineering？

如果把 prompt engineering、context engineering 和 harness engineering 放在一起看，它们其实很像一个初级员工的成长过程。

最开始，你只能和他做简单问答；再往后，你可以把完整的业务背景交给他，让他独立完成一轮深入调研；再往后，你开始给他工具、权限和反馈机制，让他自己拆任务、调工具，甚至带着几个 subagents 一起干活。

那我们不禁在想，再下一个范式会是什么？

在人类现实职场中，大部分人都会有相对明确的 career path：从一名初级员工，逐渐积累经验，甚至升级为一个高管，从执行者变成规划者，带领几十个下属完成一个高度复杂的项目。

如果沿着人类员工的经验做一个自然推演，那么下一阶段 Agents 需要达到的，大概也是**协调无数 agent / 人类节点共同完成复杂任务**。

我们或许可以暂且叫做——**Coordination Engineering**。

OpenAI 的工程负责人在播客采访里也多次提到了他们在思考 multi-agent networks：

> 一旦进入 multi-agent 世界，复杂度会迅速上升，那你怎么才能管理这一切？用户怎么才能始终知道每个 agent 在做什么、执行了哪些动作、流程推进到哪一步？

所以从这个角度看，下一代 AI 产品未必是一个更聪明的小龙虾，而更像一个小龙虾版飞书——本质是一个有效的监工看板 + 一个能让各种节点有效协作的 IM 平台。

最终这四个层级叠加起来，可能就构成了 Agentic engineering 的终极范式：

- L1 解决问答质量（Prompt Engineering）
- L2 解决认知边界（Context Engineering）
- L3 解决执行闭环（Harness Engineering）
- L4 解决组织协同（Coordination Engineering）

再往终极推演呢？一切似乎就只剩下了 **intention engineering**，人的价值只剩下了"设定目标函数"，其余 AI 都可自行包揽。

---

## 参考资料

### 核心文章
- [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/)
- [Mitchell Hashimoto 博客：My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [Martin Fowler 站点分析](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
- [Philipp Schmid 博文：Agent Harness 2026](https://www.philschmid.de/agent-harness-2026)

### 行业案例
- [Stripe Minions 博文](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Cursor Self-Driving Codebases](https://cursor.com/blog/self-driving-codebases)

### 分析与讨论
- [Latent Space 分析：Is Harness Engineering Real?](https://www.latent.space/p/ainews-is-harness-engineering-real)
- [Harrison Chase访谈 (YouTube)](https://www.youtube.com/watch?v=rSKh6bVuVZI)
- [arxiv 论文：Building Effective AI Coding Agents](https://arxiv.org/abs/2603.05344v3)
- [METR 研究：Many SWE-bench Passing PRs Would Not Be Merged](https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/)

### 微信文章（参考资料）
- [AGI Hunt：模型不是关键，Harness才是](https://mp.weixin.qq.com/s/sVGeofV9uTgvhgR44q8pNA)
- [海外独角兽：Harness is the New Dataset](https://mp.weixin.qq.com/s/9qI83Ne-Ac_R9y-yJ6SVnQ)

### 其他
- [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)