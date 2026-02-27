# Pixiv Proxy Worker

一个基于 Cloudflare Workers 的 Pixiv 图片代理服务，完全按照原始的 `pixiv-proxy.ts` 实现，提供相同的 API 接口和功能。

## 功能特性

- 🚀 **高性能**: 基于 Cloudflare Workers 的边缘计算
- 🌍 **全球分布**: 利用 Cloudflare 的全球 CDN 网络
- 🔒 **安全**: 支持 CORS，安全的头部处理
- 📝 **完整日志**: 详细的操作日志记录
- 🎯 **多尺寸支持**: 支持 thumb_mini, small, regular, original 等多种图片尺寸
- ⚡ **智能缓存**: 自动缓存图片和 API 响应

## API 接口

### 1. 图片代理

```http
GET /proxy/{pid}?size={size}&taskId={taskId}
```

**参数说明:**
- `pid`: Pixiv 插画 ID（必需）
- `size`: 图片尺寸（可选）
  - `thumb_mini`: 缩略图
  - `small`: 小图
  - `regular`: 常规尺寸
  - `original`: 原图
- `taskId`: 任务 ID（可选，用于日志追踪）

**请求头:**
- `X-Pixiv-Cookie`: Pixiv Cookie（必需）
- `X-Pixiv-User-Agent`: User Agent（可选）
- `X-Pixiv-Referer`: Referer（可选）
- `X-Pixiv-Accept-Language`: Accept Language（可选）

**示例:**
```bash
curl -X GET "https://your-worker.your-subdomain.workers.dev/proxy/123456?size=regular" \
  -H "X-Pixiv-Cookie: your_pixiv_cookie_here"
```

### 2. 健康检查

```http
GET /health
```

返回服务状态信息。

### 3. API 信息

```http
GET /api/info
```

返回 API 的详细信息和使用说明。

## 部署指南

### 前置要求

- Node.js 18+
- npm 或 yarn
- Cloudflare 账户
- Wrangler CLI

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

#### 方法一：使用 Wrangler Secrets（推荐）

```bash
# 设置 Pixiv Cookie（必需）
wrangler secret put PIXIV_COOKIE

# 可选的其他配置
wrangler secret put PIXIV_USER_AGENT
wrangler secret put PIXIV_REFERER
wrangler secret put PIXIV_ACCEPT_LANGUAGE
```

#### 方法二：在 wrangler.toml 中配置

编辑 `wrangler.toml` 文件：

```toml
[vars]
PIXIV_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
PIXIV_REFERER = "https://www.pixiv.net/"
PIXIV_ACCEPT_LANGUAGE = "zh-CN,zh;q=0.9,en;q=0.8"
```

### 3. 本地开发

```bash
npm run dev
```

服务将在 `http://localhost:8787` 启动。

### 4. 部署到生产环境

```bash
npm run deploy
```

## 使用示例

### JavaScript/TypeScript

```typescript
// 代理访问 Pixiv 图片
async function proxyPixivImage(pid: string, size?: string) {
  const response = await fetch(`https://your-worker.your-subdomain.workers.dev/proxy/${pid}?size=${size}`, {
    headers: {
      'X-Pixiv-Cookie': 'your_pixiv_cookie_here'
    }
  });
  
  if (response.ok) {
    const imageBlob = await response.blob();
    return imageBlob;
  } else {
    const error = await response.json();
    throw new Error(error.message);
  }
}

// 使用示例
proxyPixivImage('123456', 'regular')
  .then(imageBlob => {
    // 处理图片数据
    const imageUrl = URL.createObjectURL(imageBlob);
    document.getElementById('image').src = imageUrl;
  })
  .catch(error => {
    console.error('代理失败:', error);
  });
```

### Python

```python
import requests

def proxy_pixiv_image(pid: str, size: str = None):
    url = f"https://your-worker.your-subdomain.workers.dev/proxy/{pid}"
    if size:
        url += f"?size={size}"
    
    headers = {
        'X-Pixiv-Cookie': 'your_pixiv_cookie_here'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.content
    else:
        raise Exception(f"代理失败: {response.json()['message']}")

# 使用示例
try:
    image_data = proxy_pixiv_image('123456', 'regular')
    with open('pixiv_image.jpg', 'wb') as f:
        f.write(image_data)
except Exception as e:
    print(f"错误: {e}")
```

## 配置说明

### 环境变量

| 变量名 | 描述 | 必需 | 默认值 |
|--------|------|------|--------|
| `PIXIV_COOKIE` | Pixiv Cookie | 是 | - |
| `PIXIV_USER_AGENT` | User Agent | 否 | Chrome 120 |
| `PIXIV_REFERER` | Referer | 否 | https://www.pixiv.net/ |
| `PIXIV_ACCEPT_LANGUAGE` | Accept Language | 否 | zh-CN,zh;q=0.9,en;q=0.8 |

### 获取 Pixiv Cookie

1. 在浏览器中登录 Pixiv
2. 打开开发者工具（F12）
3. 切换到 Network 标签
4. 刷新页面
5. 找到任意请求，复制 Cookie 头部的值

## 错误处理

### 常见错误码

- `401`: 缺少或无效的 Pixiv Cookie
- `404`: 插画不存在或无法访问
- `500`: 服务器内部错误

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述",
  "message": "详细错误信息"
}
```

## 性能优化

- **缓存策略**: API 响应缓存 5 分钟，图片缓存 1 小时
- **尺寸优先级**: 自动按 thumb_mini → small → regular → original 顺序尝试
- **边缘计算**: 利用 Cloudflare 的全球边缘节点

## 限制说明

- CPU 时间限制: 50 秒
- 内存限制: 128MB
- 请求超时: 15 秒
- 并发限制: 根据 Cloudflare Workers 计划

## 开发命令

```bash
# 本地开发
npm run dev

# 部署到生产环境
npm run deploy

# 构建检查（不部署）
npm run build

# 查看实时日志
npm run tail

# 生成类型定义
npm run types
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Pixiv API 文档](https://hackmd.io/@ZgotmplST0-btxtbuvVizQ/pixiv-api)