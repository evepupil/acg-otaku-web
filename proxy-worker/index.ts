import { PixivProxy, createPixivProxy } from './pixiv-proxy';
import { Env, ApiResponse, PixivHeaders, ExecutionContext } from './types';

/**
 * CORS 头部设置
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

/**
 * 处理 CORS 预检请求
 */
function handleCORS(): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * 创建 JSON 响应
 */
function createJsonResponse<T>(
  data: ApiResponse<T>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * 创建图片响应
 */
function createImageResponse(
  imageBuffer: ArrayBuffer,
  contentType: string
): Response {
  return new Response(imageBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // 缓存1年
      ...corsHeaders,
    },
  });
}

/**
 * 从环境变量或请求头获取 Pixiv 头部信息
 */
function getPixivHeaders(request: Request, env: Env): PixivHeaders {
  // 优先从请求头获取
  const userAgent = request.headers.get('X-Pixiv-User-Agent') || 
                   env.PIXIV_USER_AGENT || 
                   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  const cookie = request.headers.get('X-Pixiv-Cookie') || 
                env.PIXIV_COOKIE || 
                '';
  
  const referer = request.headers.get('X-Pixiv-Referer') || 
                 env.PIXIV_REFERER || 
                 'https://www.pixiv.net/';
  
  const acceptLanguage = request.headers.get('X-Pixiv-Accept-Language') || 
                        env.PIXIV_ACCEPT_LANGUAGE || 
                        'zh-CN,zh;q=0.9,en;q=0.8';

  return {
    'User-Agent': userAgent,
    'cookie': cookie,
    'Referer': referer,
    'Accept-Language': acceptLanguage,
  };
}

/**
 * 解析 URL 路径和查询参数
 */
function parseRequest(request: Request): {
  pathname: string;
  searchParams: URLSearchParams;
  segments: string[];
} {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  const segments = pathname.split('/').filter(Boolean);
  
  return { pathname, searchParams, segments };
}

/**
 * 处理图片代理请求
 * GET /proxy/{pid}?size={size}
 */
async function handleImageProxy(
  request: Request,
  env: Env,
  pid: string
): Promise<Response> {
  try {
    const { searchParams } = parseRequest(request);
    const targetSize = searchParams.get('size') || undefined;
    const taskId = searchParams.get('taskId') || `proxy_${Date.now()}`;
    
    // 获取 Pixiv 头部信息
    const headers = getPixivHeaders(request, env);
    
    // 检查必要的认证信息
    if (!headers.cookie) {
      return createJsonResponse<null>({
        success: false,
        error: '缺少 Pixiv Cookie 认证信息',
        message: '请在请求头中设置 X-Pixiv-Cookie 或在环境变量中配置 PIXIV_COOKIE'
      }, 401);
    }
    
    // 创建代理实例
    const proxy = createPixivProxy(headers, undefined, taskId);
    
    // 代理访问图片
    const result = await proxy.proxyImage(pid, targetSize);
    
    if (result.success && result.imageBuffer && result.contentType) {
      return createImageResponse(result.imageBuffer, result.contentType);
    } else {
      return createJsonResponse<null>({
        success: false,
        error: result.error || '图片代理失败',
        message: `无法代理访问插画 ${pid}`
      }, 404);
    }
  } catch (error) {
    console.error('图片代理处理异常:', error);
    return createJsonResponse<null>({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '服务器内部错误'
    }, 500);
  }
}

/**
 * 处理健康检查请求
 * GET /health
 */
function handleHealthCheck(): Response {
  return createJsonResponse({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'pixiv-proxy-worker'
    },
    message: 'Pixiv Proxy Worker is running'
  });
}

/**
 * 处理 API 信息请求
 * GET /api/info
 */
function handleApiInfo(): Response {
  return createJsonResponse({
    success: true,
    data: {
      name: 'Pixiv Proxy Worker',
      version: '1.0.0',
      description: 'Cloudflare Worker for proxying Pixiv images',
      endpoints: {
        'GET /proxy/{pid}': {
          description: '代理访问 Pixiv 插画',
          parameters: {
            pid: '插画 ID',
            size: '图片尺寸 (可选): thumb_mini, small, regular, original',
            taskId: '任务 ID (可选)'
          },
          headers: {
            'X-Pixiv-Cookie': 'Pixiv Cookie (必需)',
            'X-Pixiv-User-Agent': 'User Agent (可选)',
            'X-Pixiv-Referer': 'Referer (可选)',
            'X-Pixiv-Accept-Language': 'Accept Language (可选)'
          }
        },
        'GET /health': {
          description: '健康检查'
        },
        'GET /api/info': {
          description: 'API 信息'
        }
      }
    },
    message: 'API 信息获取成功'
  });
}

/**
 * 主要的请求处理函数
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      const { pathname, segments } = parseRequest(request);
      
      // 路由处理
      switch (true) {
        // 健康检查
        case pathname === '/health':
          return handleHealthCheck();
        
        // API 信息
        case pathname === '/api/info':
          return handleApiInfo();
        
        // 图片代理 - /proxy/{pid}
        case segments[0] === 'proxy' && segments[1] && request.method === 'GET':
          const pid = segments[1];
          return await handleImageProxy(request, env, pid);
        
        // 根路径 - 重定向到 API 信息
        case pathname === '/' || pathname === '':
          return Response.redirect(new URL('/api/info', request.url).toString(), 302);
        
        // 404 - 未找到路由
        default:
          return createJsonResponse<null>({
            success: false,
            error: '未找到请求的路由',
            message: `路径 ${pathname} 不存在，请查看 /api/info 获取可用的 API 端点`
          }, 404);
      }
    } catch (error) {
      console.error('请求处理异常:', error);
      return createJsonResponse<null>({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '服务器内部错误'
      }, 500);
    }
  },
};