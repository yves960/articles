# Zoo WebSocket Bug 分析

## 问题描述

前端 WebSocket 连接失败，错误信息：
```
WebSocket connection to 'ws://localhost:8001/api/api/ws' failed: 
WebSocket is closed before the connection is established.
```

## 已确认正常

1. ✅ 后端 API 正常（/api/api/health 返回 healthy）
2. ✅ Python aiohttp 可以成功连接 WebSocket
3. ✅ 后端日志显示 WebSocket 连接被接受
4. ✅ CORS 已配置
5. ✅ 前端 URL 正确（ws://localhost:8001/api/api/ws）

## 问题排查

### 已排除

- ❌ 端口错误 - 已确认 8001
- ❌ URL 路径错误 - 已确认 /api/api/ws
- ❌ 后端未启动 - 后端运行正常
- ❌ 代理设置 - 无代理

### 可能原因

1. **浏览器安全策略**
   - 某些浏览器版本对 localhost WebSocket 有限制
   - 可能需要 HTTPS/WSS

2. **WebSocketManager 实现问题**
   - `ws_manager.connect()` 可能有问题
   - 检查 `core/websocket_manager.py`

3. **FastAPI WebSocket 中间件问题**
   - 可能与静态文件挂载冲突
   - 尝试分离 WebSocket 和静态文件

## 建议解决方案

### 方案1: 检查 WebSocketManager

```bash
# 检查 WebSocketManager 实现
cat ~/Projects/self/zoo/core/websocket_manager.py
```

### 方案2: 简化 WebSocket 端点

在 routes.py 中移除 WebSocketManager，使用简化版本：

```python
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # 简化处理，不使用 manager
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Echo: {data}")
```

### 方案3: 使用轮询替代

修改前端，使用 HTTP 轮询作为后备方案：

```typescript
// 轮询获取消息
const pollMessages = async () => {
  const response = await fetch('/api/api/messages?thread_id=xxx');
  // 处理消息
};
```

### 方案4: 使用不同端口

尝试使用不同的 WebSocket 端口（如 8002），避免与主 API 冲突。

## 临时解决方案

前端可以通过 HTTP API 发送和获取消息：

```bash
# 发送消息
curl -X POST http://localhost:8001/api/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"你好","animal_ids":["openai"]}'

# 获取线程消息
curl http://localhost:8001/api/api/threads/{thread_id}
```

---

**状态**: 待进一步排查
**优先级**: P1
**影响**: 前端无法实时聊天