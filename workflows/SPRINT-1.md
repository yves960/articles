# Sprint 1 - 冲刺计划

**目标日期：2026年3月22日（周日）**
**开始日期：2026年3月18日（周三）**

---

## 目标

| 项目 | 状态 | 目标 |
|------|------|------|
| FireworksLife | 🔧 基础修复中 | 周日上线生产 |
| mood-diary-wechat | ⏳ 待修复 | 周日上线生产 |
| art-learning-guide | 🔧 基础修复中 | 周日上线生产 |
| zoo | ⏳ 待修复 | 周日本地完整运行 |

---

## 时间线

### 周三（今天）- 补齐短板 ✅ 进行中
- [x] FireworksLife: 后端启动成功（端口8000），markdown+bleach依赖已加
- [x] art-learning-guide: 后端启动成功（端口3003），GLM API已验证
- [x] mood-diary-wechat: 后端启动成功（端口3001），依赖已安装
- [x] zoo: 后端启动成功（端口8001），Python兼容性已修复
- [ ] FireworksLife: Markdown渲染 + XSS防护 实际实现
- [ ] 全部项目：确认部署方案（服务器、域名等）

### 周四 - 核心功能完善
- [ ] FireworksLife: 核心功能测试（发帖、评论、登录），修bug
- [ ] mood-diary-wechat: 核心功能测试（日记记录、情绪分析），修bug
- [ ] art-learning-guide: AI功能验证（智谱集成是否正常）
- [ ] zoo: 前后端联调，多agent通信测试

### 周五 - 部署准备
- [ ] FireworksLife: 生产环境配置、数据库迁移、nginx配置
- [ ] mood-diary-wechat: 微信小程序提审准备、后端部署
- [ ] art-learning-guide: 生产环境配置、AI服务配置
- [ ] zoo: 本地全流程验证（启动、交互、多agent协作）

### 周六 - 上线冲刺
- [ ] FireworksLife: 部署到生产环境，线上验证
- [ ] mood-diary-wechat: 后端部署，小程序提审（或体验版）
- [ ] art-learning-guide: 部署到生产环境，线上验证
- [ ] zoo: 本地全量测试，修复所有阻塞问题

### 周日 - 最终验收
- [ ] FireworksLife: 线上全功能验收 ✅
- [ ] mood-diary-wechat: 线上全功能验收 ✅
- [ ] art-learning-guide: 线上全功能验收 ✅
- [ ] zoo: 本地全流程验收 ✅

---

## 验收标准

### 上线生产标准
- 核心功能全部正常
- 无 P0/P1 bug
- HTTPS 配置完成
- 基本的错误处理和日志
- 响应速度 < 3s
- 移动端适配正常

### zoo 本地运行标准
- 前端能正常启动（npm run dev）
- 后端能正常启动
- 多个 agent 能正常通信
- WebSocket 连接稳定
- 基本交互流程跑通

---

## 团队分工

- 金克丝（PM）：每天2次产品体验（12:00/18:00），输出bug清单
- 艾克（Dev）：修bug、补功能、部署，用 opencode 干活
- 凯特琳（DevOps）：部署配置、环境搭建、验收测试
- 蔚（我）：进度把控、问题决策、协调资源

---

## 每日汇报

每天 18:00 和 22:00 我会在这个群里同步进度。
