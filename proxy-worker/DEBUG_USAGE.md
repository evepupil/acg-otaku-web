# Pixiv 代理调试使用说明

## 问题描述
代理请求返回 `{"success":false,"error":"未找到插画页面信息","message":"无法代理访问插画 133915289"}` 错误，需要查看详细的 Pixiv API 响应信息来诊断问题。

## 解决方案

### 1. 增强的日志记录
已为代理服务添加了详细的日志记录功能，包括：
- 请求 URL 和请求头信息
- 响应状态码和响应头信息
- 完整的响应体内容
- JSON 解析结果和错误详情
- 异常堆栈信息

### 2. 新增调试端点
添加了 `/debug/{pid}` 端点，用于获取详细的调试信息而不实际代理图片。

#### 使用方法：
```bash
# 调试插画 133915289
GET /debug/133915289?taskId=debug_001

# 请求头（必需）
X-Pixiv-Cookie: your_pixiv_cookie_here
X-Pixiv-User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
X-Pixiv-Referer: https://www.pixiv.net/
X-Pixiv-Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

#### 响应格式：
```json
{
  "success": true,
  "data": {
    "pid": "133915289",
    "taskId": "debug_001",
    "logs": [
      {
        "message": "获取插画 133915289 页面信息",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "message": "请求URL: https://www.pixiv.net/ajax/illust/133915289/pages?lang=zh",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "message": "请求头信息:",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "message": "  User-Agent: Mozilla/5.0...",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "message": "  cookie: your_cookie_here",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "message": "响应状态: 200 OK",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "message": "响应体内容: {\"error\":false,\"body\":[...]}",
        "type": "info",
        "taskId": "debug_001",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "logCount": 7,
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "调试信息获取成功，共 7 条日志"
}
```

### 3. 诊断步骤

1. **使用调试端点**：
   ```bash
   curl -X GET "https://your-worker-domain.workers.dev/debug/133915289" \
        -H "X-Pixiv-Cookie: your_cookie_here" \
        -H "X-Pixiv-User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
   ```

2. **检查日志信息**：
   - 查看请求 URL 是否正确
   - 检查请求头是否完整（特别是 Cookie）
   - 查看响应状态码（200 表示成功）
   - 检查响应体内容，查看 Pixiv 返回的具体错误信息

3. **常见问题诊断**：
   - **HTTP 403/401**: Cookie 无效或过期
   - **HTTP 404**: 插画不存在或已被删除
   - **HTTP 429**: 请求过于频繁，需要等待
   - **响应体 error: true**: Pixiv API 返回错误，查看 message 字段

### 4. 部署和测试

1. **部署更新**：
   ```bash
   cd proxy-worker
   npm run deploy
   ```

2. **测试调试端点**：
   ```bash
   # 测试健康检查
   curl https://your-worker-domain.workers.dev/health
   
   # 测试 API 信息
   curl https://your-worker-domain.workers.dev/api/info
   
   # 测试调试端点
   curl -X GET "https://your-worker-domain.workers.dev/debug/133915289" \
        -H "X-Pixiv-Cookie: your_cookie_here"
   ```

### 5. 日志级别说明

- **info**: 一般信息，如请求开始、成功响应等
- **warning**: 警告信息，如某些尺寸不可用等
- **error**: 错误信息，如请求失败、解析错误等
- **success**: 成功信息，如代理成功等

通过使用调试端点，你可以获得完整的请求-响应流程信息，帮助快速定位和解决代理问题。