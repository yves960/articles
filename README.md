# 个人知识库

这是一个面向 AI Agent 协作的个人知识库。设计原则来自 Andrej Karpathy 的
LLM knowledge base 思路：**原始材料保持稳定，LLM 负责维护可检索、可更新、
可交叉引用的 wiki 层**。

## 快速入口

- [知识库首页](wiki/index.md)
- [主题索引](wiki/topics/README.md)
- [资料映射](wiki/source-map.md)
- [处理日志](wiki/log.md)
- [开放问题](wiki/questions.md)

## 结构

```text
.
├── AGENTS.md                 # Agent 操作规范
├── raw/                      # 新增原始资料，默认不改写
├── inbox/                    # 临时收集区，等待整理
├── wiki/                     # LLM 维护的知识层
│   ├── index.md              # 知识库入口
│   ├── source-map.md         # 源材料到主题页的映射
│   ├── log.md                # 每次整理记录
│   ├── questions.md          # 未解决问题
│   ├── topics/               # 主题页
│   └── templates/            # 模板
└── scripts/                  # 维护脚本
```

## 使用方式

1. 把新资料放进 `inbox/` 或 `raw/`。
2. 让 Agent 根据 `AGENTS.md` 读取资料并更新 `wiki/`。
3. 从 `wiki/index.md` 进入主题页，而不是直接在所有原文里搜索。
4. 如果知识发生重组，更新 `wiki/source-map.md` 和 `wiki/log.md`。

## 维护命令

```bash
python3 scripts/check_kb_links.py
```

这个脚本会检查 `README.md`、`AGENTS.md`、`wiki/`、`raw/`、`inbox/`
里的本地 Markdown 链接是否能解析到真实文件。

## 核心约束

- `raw/` 默认是事实来源，不做随意改写。
- `wiki/` 是综合层，可以重构、拆分、合并。
- 重要结论必须能追溯到本地文件或外部链接。
