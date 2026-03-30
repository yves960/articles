# 测试计划 - Sprint 1

**原则：测试用例先行，修改后回归验证**

## 测试顺序

| 顺序 | 项目 | 状态 | 测试用例 |
|------|------|------|----------|
| 1 | FireworksLife | 等待测试 | [测试用例](./test-cases/fireworkslife.md) |
| 2 | mood-diary-wechat | 等待测试 | [测试用例](./test-cases/mood-diary.md) |
| 3 | art-learning-guide | 等待测试 | [测试用例](./test-cases/art-learning.md) |
| 4 | zoo | 等待测试 | [测试用例](./test-cases/zoo.md) |

## 测试流程

1. **启动服务** - 后端+前端
2. **执行测试用例** - 逐项验证，记录结果
3. **记录Bug** - 发现问题立即记录到 test-results/
4. **修复** - 安排艾克修复
5. **回归测试** - 按测试用例重测
6. **通过** - 进入下一个项目

## 当前状态

- [x] FireworksLife 测试用例 ✅
- [x] FireworksLife Bug修复 ✅
- [x] FireworksLife 回归测试 ✅
- [x] mood-diary-wechat 测试用例 ✅
- [ ] mood-diary-wechat 测试（艾克进行中）
- [x] art-learning-guide 测试用例 ✅
- [x] art-learning-guide 测试 ✅
- [x] zoo 测试用例 ✅
- [x] zoo 后端测试 ✅
- [ ] zoo 前端修复

## 进度

| 时间 | 动作 |
|------|------|
| 12:05 | FireworksLife 测试完成，发现 P0 Bug |
| 12:08 | 安排艾克修复注册问题 |
| 12:10 | 完成所有项目测试用例编写 |
| 12:14 | FireworksLife 注册修复完成，回归测试通过 |
| 12:16 | art-learning-guide 测试完成 ✅ |
| 12:22 | zoo 后端测试完成 ✅ |
| 12:25 | mood-diary-wechat 测试完成 ✅ |
| 13:54 | 所有测试服务已停止 |