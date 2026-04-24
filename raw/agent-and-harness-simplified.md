# Agent和Harness：我为什么说这不是两个概念，而是一套世界观

## 从一个困惑开始

刚接触AI编程的时候，我有一个困惑：

**为什么有些人叫它"AI Agent"，有些人叫它"AI助手"，还有些人根本不叫它名字，就说"用AI写代码"？**

后来我明白了，这不只是叫法的问题，而是**理解AI的方式不同**。

有些人把AI当成一个工具，像锤子、螺丝刀，拿来用就行。

有些人把AI当成一个员工，给它任务、给它资源、给它边界。

**这两种理解，对应着两个概念：Agent和Harness。**

---

## Agent：不是框架，是模型本身

我看过很多文章把Agent说得很复杂——框架、提示词链、工作流编排、决策树……

**但learn-claude-code项目说得很清楚：Agent就是模型本身。**

不是框架，不是提示词链，不是工作流。**Agent是一个神经网络**——经过数十亿次训练，学会了感知、推理、行动。

这听起来很抽象，但看看历史就明白了：

| 里程碑 | 做了什么 |
|--------|----------|
| DeepMind DQN | 一个神经网络打7款Atari游戏，超越人类 |
| OpenAI Five | 五个神经网络打Dota 2，击败世界冠军OG |
| AlphaStar | 一个神经网络打星际争霸II，达到宗师段位 |
| 腾讯绝悟 | 一个神经网络打王者荣耀，击败职业选手 |

注意到了吗？**每一个里程碑，核心都是神经网络本身**，不是外面包的那层代码。

**Agency（智能体能力）是学出来的，不是编出来的。**

你可以用if-else串起一个工作流，让LLM在不同节点做文本补全。但这不是Agent，这是"有着宏大妄想的shell脚本"。

真正的Agent，它的决策能力来自模型本身，不是外面的规则。

---

## Harness：给智能体一个栖居的世界

如果Agent是"脑"，那Harness是什么？

**Harness是Agent在特定领域工作所需要的一切环境。**

```
Harness = Tools + Knowledge + Observation + Action + Permissions
```

- **Tools**：文件读写、Shell、网络、浏览器——给它一双手
- **Knowledge**：产品文档、API规范、风格指南——给它领域知识
- **Observation**：git diff、错误日志、浏览器状态——给它眼睛
- **Action**：CLI命令、API调用、UI交互——让它能做事
- **Permissions**：沙箱隔离、审批流程、信任边界——给它边界

**模型是驾驶者，Harness是载具。**

编程Agent的Harness是IDE、终端、文件系统。

农业Agent的Harness是传感器、灌溉控制、气象数据。

酒店Agent的Harness是预订系统、客户沟通渠道、设施管理API。

**Agent做决策，Harness执行。Agent做推理，Harness提供上下文。**

---

## 我理解的Agent Pattern

learn-claude-code里有一张图，我看了很久：

```
User --> messages[] --> LLM (Agent) --> response
                              |
                    stop_reason == "tool_use"?
                   /                          \
                 yes                           no
                  |                             |
            execute tools                    return text
            (Harness干活)
            append results
            loop back -----------------> messages[]
```

这张图的关键在于：**Agent在中心做决策，Harness在外围执行**。

循环不变，Harness机制一层层叠加。

这让我想到了一个问题：**那我们这些做AI应用的人，到底在做什么？**

---

## Harness工程师的自觉

如果你在读这篇文章，你很可能不是在训练模型，而是在做AI应用。

**那你不是在创造智能，你是在构建智能栖居的世界。**

| 职责 | 做什么 |
|------|--------|
| 实现工具 | 给Agent一双手 |
| 策划知识 | 给Agent领域专长 |
| 管理上下文 | 给Agent干净的记忆 |
| 控制权限 | 给Agent边界 |
| 收集数据 | Agent的行动序列是训练下一代模型的信号 |

**这不只是技术工作，是环境设计。**

你设计的环境越好，Agent能发挥的空间就越大。

---

## Claude Code给我的启示

Claude Code是我见过最优雅的Agent Harness实现。

**不是因为它做了什么，而是因为它没做什么。**

它没有：
- 试图成为Agent本身
- 强加僵化工作流
- 用决策树替模型做判断

它做了：
- 给模型提供工具
- 给模型提供知识
- 给模型提供上下文管理
- 给模型提供权限边界

**然后让开了。**

这就是关键。

**Harness没有让Claude变聪明。Claude本来就聪明。Harness给了Claude双手、双眼和一个工作空间。**

---

## 我的思考

我越来越觉得，Agent和Harness不是两个概念，而是一套世界观。

这套世界观说的是：

**智能不在工具里，在模型里。工具只是让智能有了用武之地。**

你可以花大量时间设计提示词链、工作流、决策树，但那不会让模型更聪明。它只是把模型当成了文本补全节点。

**真正有效的做法是：给模型好的工具、好的知识、好的边界，然后让它自己决策。**

这需要信任。你相信模型有能力做正确的判断，而不是替它做判断。

**Claude Code的设计者有这种信任。他们让开了。**

---

## 总结

| 概念 | 一句话 |
|------|--------|
| Agent | 模型本身，会思考、会决策的"脑" |
| Harness | Agent工作的环境，提供工具、知识、上下文、权限 |

**造好Harness，Agent会完成剩下的。**

但更重要的是：**理解这套世界观，才能做好AI应用。**

你不是在编写智能。你是在构建智能栖居的世界。

---

## 参考资料

- [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) — 这篇文章的核心来源，一个关于Agent Harness工程的教学项目

---

本文由 GLM-5 模型和孙越共同编写。