import {
  PixivHeaders,
  PixivIllustPagesResponse,
  PixivIllustInfo,
  ProxyImageResult,
  ILogManager,
  LogType,
  CloudflareRequestInit
} from './types';

/**
 * Cloudflare Worker 版本的简单日志管理器
 */
class WorkerLogManager implements ILogManager {
  private logs: Array<{ message: string; type: LogType; taskId?: string; timestamp: string }> = [];

  /**
   * 添加日志
   */
  addLog(message: string, type: LogType, taskId?: string): void {
    const logEntry = {
      message,
      type,
      taskId,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    
    // 在 Worker 环境中输出到控制台
    const logMessage = `[${type.toUpperCase()}] ${taskId ? `[${taskId}] ` : ''}${message}`;
    
    switch (type) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warning':
        console.warn(logMessage);
        break;
      case 'info':
      case 'success':
      default:
        console.log(logMessage);
        break;
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(): Array<{ message: string; type: LogType; taskId?: string; timestamp: string }> {
    return this.logs;
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Cloudflare Worker 版本的 Pixiv 代理类
 */
export class PixivProxy {
  private headers: PixivHeaders;
  private logManager: ILogManager;
  private taskId: string;

  constructor(
    headers: PixivHeaders,
    logManager?: ILogManager,
    taskId?: string
  ) {
    this.headers = headers;
    this.logManager = logManager || new WorkerLogManager();
    this.taskId = taskId || `task_${Date.now()}`;
  }

  /**
   * 获取插画页面信息
   */
  private async getIllustPages(pid: string): Promise<PixivIllustPagesResponse | null> {
    try {
      this.logManager.addLog(`获取插画 ${pid} 页面信息`, 'info', this.taskId);
      
      // 记录请求详情
      const requestUrl = `https://www.pixiv.net/ajax/illust/${pid}/pages?lang=zh`;
      this.logManager.addLog(`请求URL: ${requestUrl}`, 'info', this.taskId);
      this.logManager.addLog(`请求头信息:`, 'info', this.taskId);
      for (const key in this.headers) {
        if (this.headers.hasOwnProperty(key)) {
          this.logManager.addLog(`  ${key}: ${this.headers[key]}`, 'info', this.taskId);
        }
      }
      
      const response = await fetch(requestUrl, {
        headers: this.headers,
        cf: {
          // Cloudflare 特定配置
          cacheTtl: 300, // 缓存 5 分钟
          cacheEverything: true
        }
      } as CloudflareRequestInit);

      // 记录响应状态和头部信息
      this.logManager.addLog(`响应状态: ${response.status} ${response.statusText}`, 'info', this.taskId);
      this.logManager.addLog(`响应头信息:`, 'info', this.taskId);
      response.headers.forEach((value, key) => {
        this.logManager.addLog(`  ${key}: ${value}`, 'info', this.taskId);
      });

      if (!response.ok) {
        // 尝试读取响应体内容
        let responseText = '';
        try {
          responseText = await response.text();
          this.logManager.addLog(`响应体内容: ${responseText}`, 'error', this.taskId);
        } catch (readError) {
          this.logManager.addLog(`无法读取响应体: ${readError instanceof Error ? readError.message : String(readError)}`, 'error', this.taskId);
        }
        
        this.logManager.addLog(`获取插画 ${pid} 页面信息失败: HTTP ${response.status}`, 'error', this.taskId);
        return null;
      }

      // 读取响应体
      const responseText = await response.text();
      this.logManager.addLog(`响应体长度: ${responseText.length} 字符`, 'info', this.taskId);
      this.logManager.addLog(`响应体内容: ${responseText}`, 'info', this.taskId);

      let resJson: PixivIllustPagesResponse;
      try {
        resJson = JSON.parse(responseText);
      } catch (parseError) {
        this.logManager.addLog(`JSON解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`, 'error', this.taskId);
        this.logManager.addLog(`原始响应: ${responseText}`, 'error', this.taskId);
        return null;
      }
      
      // 记录解析后的JSON结构
      this.logManager.addLog(`解析后的JSON结构:`, 'info', this.taskId);
      this.logManager.addLog(`  error: ${resJson.error}`, 'info', this.taskId);
      this.logManager.addLog(`  message: ${resJson.message || 'N/A'}`, 'info', this.taskId);
      this.logManager.addLog(`  body存在: ${!!resJson.body}`, 'info', this.taskId);
      this.logManager.addLog(`  body长度: ${resJson.body ? resJson.body.length : 0}`, 'info', this.taskId);
      
      if (resJson.error === false && resJson.body && resJson.body.length > 0) {
        this.logManager.addLog(`获取插画 ${pid} 页面信息成功，共 ${resJson.body.length} 张图片`, 'info', this.taskId);
        
        // 打印所有可用的图片尺寸和链接
        const urls = resJson.body[0].urls;
        this.logManager.addLog(`插画 ${pid} 可用图片尺寸:`, 'info', this.taskId);
        for (const size in urls) {
          if (urls.hasOwnProperty(size)) {
            this.logManager.addLog(`  ${size}: ${urls[size as keyof typeof urls]}`, 'info', this.taskId);
          }
        }
        
        return resJson;
      } else {
        this.logManager.addLog(`获取插画 ${pid} 页面信息失败或为空`, 'warning', this.taskId);
        this.logManager.addLog(`错误详情: error=${resJson.error}, message=${resJson.message || 'N/A'}`, 'warning', this.taskId);
        return null;
      }
    } catch (error) {
      this.logManager.addLog(`获取插画 ${pid} 页面信息异常: ${error instanceof Error ? error.message : String(error)}`, 'error', this.taskId);
      this.logManager.addLog(`异常堆栈: ${error instanceof Error ? error.stack : 'N/A'}`, 'error', this.taskId);
      return null;
    }
  }

  /**
   * 获取画师名字
   */
  private async getArtistName(pid: string): Promise<string | null> {
    try {
      // 使用新的API方法获取插画信息，更加高效
      const requestUrl = `https://www.pixiv.net/ajax/illust/${pid}`;
      this.logManager.addLog(`获取插画 ${pid} 基本信息`, 'info', this.taskId);
      this.logManager.addLog(`请求URL: ${requestUrl}`, 'info', this.taskId);
      
      const response = await fetch(requestUrl, {
        headers: this.headers,
        cf: {
          cacheTtl: 300,
          cacheEverything: true
        }
      } as CloudflareRequestInit);

      this.logManager.addLog(`响应状态: ${response.status} ${response.statusText}`, 'info', this.taskId);

      if (!response.ok) {
        let responseText = '';
        try {
          responseText = await response.text();
          this.logManager.addLog(`响应体内容: ${responseText}`, 'error', this.taskId);
        } catch (readError) {
          this.logManager.addLog(`无法读取响应体: ${readError instanceof Error ? readError.message : String(readError)}`, 'error', this.taskId);
        }
        
        this.logManager.addLog(`获取插画 ${pid} 信息失败: HTTP ${response.status}`, 'error', this.taskId);
        return null;
      }

      const responseText = await response.text();
      this.logManager.addLog(`响应体长度: ${responseText.length} 字符`, 'info', this.taskId);
      this.logManager.addLog(`响应体内容: ${responseText}`, 'info', this.taskId);

      let resJson: PixivIllustInfo;
      try {
        resJson = JSON.parse(responseText);
      } catch (parseError) {
        this.logManager.addLog(`JSON解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`, 'error', this.taskId);
        this.logManager.addLog(`原始响应: ${responseText}`, 'error', this.taskId);
        return null;
      }
      
      this.logManager.addLog(`解析后的JSON结构:`, 'info', this.taskId);
      this.logManager.addLog(`  error: ${resJson.error}`, 'info', this.taskId);
      this.logManager.addLog(`  message: ${resJson.message || 'N/A'}`, 'info', this.taskId);
      this.logManager.addLog(`  body存在: ${!!resJson.body}`, 'info', this.taskId);
      this.logManager.addLog(`  userName: ${resJson.body?.userName || 'N/A'}`, 'info', this.taskId);
      
      if (resJson.error === false && resJson.body && resJson.body.userName) {
        const userName = resJson.body.userName;
        this.logManager.addLog(`获取到画师名字: ${userName}`, 'info', this.taskId);
        return userName;
      }
      
      this.logManager.addLog(`未找到插画 ${pid} 的画师名字`, 'warning', this.taskId);
      this.logManager.addLog(`错误详情: error=${resJson.error}, message=${resJson.message || 'N/A'}`, 'warning', this.taskId);
      return null;
    } catch (error) {
      this.logManager.addLog(`获取画师名字异常: ${error instanceof Error ? error.message : String(error)}`, 'error', this.taskId);
      this.logManager.addLog(`异常堆栈: ${error instanceof Error ? error.stack : 'N/A'}`, 'error', this.taskId);
      return null;
    }
  }

  /**
   * 代理访问图片
   */
  async proxyImage(pid: string, targetSize?: string): Promise<ProxyImageResult> {
    try {
      this.logManager.addLog(`开始代理访问插画 ${pid}${targetSize ? `，目标尺寸: ${targetSize}` : ''}`, 'info', this.taskId);

      // 获取插画页面信息
      const pagesResponse = await this.getIllustPages(pid);
      if (!pagesResponse || pagesResponse.body.length === 0) {
        return { success: false, error: '未找到插画页面信息' };
      }

      // 获取画师名字（用于日志）
      await this.getArtistName(pid);

      // 如果指定了目标尺寸，优先尝试该尺寸
      if (targetSize) {
        const urls = pagesResponse.body[0].urls;
        const imageUrl = urls[targetSize as keyof typeof urls];
        
        if (imageUrl) {
          this.logManager.addLog(`尝试访问指定尺寸 ${targetSize}: ${imageUrl}`, 'info', this.taskId);
          const result = await this.tryDownloadImage(imageUrl, targetSize);
          if (result.success) {
            return result;
          }
          this.logManager.addLog(`指定尺寸 ${targetSize} 访问失败，尝试其他尺寸`, 'warning', this.taskId);
        } else {
          this.logManager.addLog(`指定尺寸 ${targetSize} 不存在，尝试其他尺寸`, 'warning', this.taskId);
        }
      }

      // 图片尺寸优先级 - 代理访问优先使用最小尺寸
      const imgSizes = ['thumb_mini', 'small', 'regular', 'original'];
      
      this.logManager.addLog(`开始代理访问插画 ${pid}，按优先级尝试尺寸: ${imgSizes.join(' → ')}`, 'info', this.taskId);
      
       for (const size of imgSizes) {
         const urls = pagesResponse.body[0].urls;
         const imageUrl = urls[size as keyof typeof urls];
         if (!imageUrl) {
           this.logManager.addLog(`插画 ${pid} 的 ${size} 尺寸图片链接不存在，跳过`, 'warning', this.taskId);
           continue;
         }

         this.logManager.addLog(`开始代理访问 ${pid} 的 ${size} 尺寸图片: ${imageUrl}`, 'info', this.taskId);

         // 首先尝试直接代理
         let result = await this.tryDownloadImage(imageUrl, size);
         if (result.success) {
           return result;
         }

         // 如果直接代理失败，尝试绕过 Cloudflare 防护
         this.logManager.addLog(`直接代理失败，尝试绕过 Cloudflare 防护`, 'warning', this.taskId);
         result = await this.tryBypassCloudflare(imageUrl, size);
         if (result.success) {
           return result;
         }

         // 最后尝试第三方代理
         this.logManager.addLog(`Cloudflare 绕过失败，尝试第三方代理服务`, 'warning', this.taskId);
         result = await this.tryThirdPartyProxy(imageUrl, size);
         if (result.success) {
           return result;
         }
       }

      return { success: false, error: '所有尺寸的图片都无法访问' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logManager.addLog(`代理访问插画 ${pid} 异常: ${errorMessage}`, 'error', this.taskId);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 重写 Pixiv 图片 URL 以绕过防盗链
   */
  private rewritePixivImageUrl(imageUrl: string): string {
    // 如果已经是 i.pixiv.cat 域名，直接返回
    if (imageUrl.includes('i.pixiv.cat')) {
      return imageUrl;
    }
    
    // 将 i.pximg.net 替换为 i.pixiv.cat 以绕过防盗链
    if (imageUrl.includes('i.pximg.net')) {
      const rewrittenUrl = imageUrl.replace('i.pximg.net', 'i.pixiv.cat');
      this.logManager.addLog(`重写图片URL: ${imageUrl} -> ${rewrittenUrl}`, 'info', this.taskId);
      return rewrittenUrl;
    }
    
    return imageUrl;
  }

  /**
   * 使用第三方代理服务
   */
  private async tryThirdPartyProxy(imageUrl: string, size: string): Promise<ProxyImageResult> {
    try {
      // 使用 pixiv.cat 作为备用代理
      const proxyUrl = `https://pixiv.cat/${imageUrl.split('/').pop()}`;
      this.logManager.addLog(`尝试第三方代理: ${proxyUrl}`, 'info', this.taskId);
      
      const response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.pixiv.net/',
          'Cache-Control': 'no-cache',
          // 添加 Cookie 认证
          'Cookie': this.headers.cookie || ''
        },
        cf: {
          cacheTtl: 0,
          cacheEverything: false
        }
      } as CloudflareRequestInit);

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const fileSizeMB = imageBuffer.byteLength / (1024 * 1024);
        
        this.logManager.addLog(`第三方代理访问成功，尺寸: ${size}，文件大小: ${fileSizeMB.toFixed(2)}MB`, 'success', this.taskId);
        
        return {
          success: true,
          imageBuffer,
          contentType: 'image/jpeg' // pixiv.cat 通常返回 JPEG
        };
      } else {
        this.logManager.addLog(`第三方代理访问失败: HTTP ${response.status}`, 'warning', this.taskId);
      }
    } catch (error) {
      this.logManager.addLog(`第三方代理访问异常: ${error instanceof Error ? error.message : String(error)}`, 'warning', this.taskId);
    }
    
    return { success: false, error: '第三方代理访问失败' };
  }

  /**
   * 尝试使用不同的代理服务绕过 Cloudflare 防护
   */
  private async tryBypassCloudflare(imageUrl: string, size: string): Promise<ProxyImageResult> {
    const proxyServices = [
      // 方法1: 使用 i.pixiv.cat 直接代理
      {
        name: 'i.pixiv.cat',
        url: imageUrl.replace('i.pximg.net', 'i.pixiv.cat'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': 'https://www.pixiv.net/',
          'Cache-Control': 'no-cache'
        }
      },
      // 方法2: 使用 pixiv.cat 服务
      {
        name: 'pixiv.cat',
        url: `https://pixiv.cat/${imageUrl.split('/').pop()}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': 'https://www.pixiv.net/'
        }
      },
      // 方法3: 使用不同的 User-Agent
      {
        name: 'alternative-ua',
        url: imageUrl.replace('i.pximg.net', 'i.pixiv.cat'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          'Accept': 'image/*,*/*;q=0.8',
          'Referer': 'https://www.pixiv.net/',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        }
      }
    ];

    for (const service of proxyServices) {
      try {
        this.logManager.addLog(`尝试 ${service.name} 代理: ${service.url}`, 'info', this.taskId);
        
        const response = await fetch(service.url, {
          headers: service.headers,
          cf: {
            cacheTtl: 0,
            cacheEverything: false
          }
        } as CloudflareRequestInit);

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const fileSizeMB = imageBuffer.byteLength / (1024 * 1024);
          
          this.logManager.addLog(`${service.name} 代理访问成功，尺寸: ${size}，文件大小: ${fileSizeMB.toFixed(2)}MB`, 'success', this.taskId);
          
          return {
            success: true,
            imageBuffer,
            contentType: 'image/jpeg'
          };
        } else {
          this.logManager.addLog(`${service.name} 代理访问失败: HTTP ${response.status}`, 'warning', this.taskId);
        }
      } catch (error) {
        this.logManager.addLog(`${service.name} 代理访问异常: ${error instanceof Error ? error.message : String(error)}`, 'warning', this.taskId);
      }
    }
    
    return { success: false, error: '所有代理服务都无法访问' };
  }

  /**
   * 尝试下载指定URL的图片
   */
  private async tryDownloadImage(imageUrl: string, size: string): Promise<ProxyImageResult> {
    try {
      // 重写 URL 以绕过防盗链
      const rewrittenUrl = this.rewritePixivImageUrl(imageUrl);
      this.logManager.addLog(`开始代理访问图片: ${imageUrl}`, 'info', this.taskId);
      if (rewrittenUrl !== imageUrl) {
        this.logManager.addLog(`使用重写后的URL: ${rewrittenUrl}`, 'info', this.taskId);
      }
      
      // 构建更完整的请求头，模拟真实浏览器
      const requestHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.pixiv.net/',
        'Origin': 'https://www.pixiv.net',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        // 添加 Pixiv 特定的头部
        'X-Requested-With': 'XMLHttpRequest',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        // 添加 Cookie 认证
        'Cookie': this.headers.cookie || ''
      };

      this.logManager.addLog(`请求头信息:`, 'info', this.taskId);
      for (const key in requestHeaders) {
        if (requestHeaders.hasOwnProperty(key)) {
          const value = requestHeaders[key as keyof typeof requestHeaders];
          // 对 Cookie 进行脱敏处理
          if (key === 'Cookie') {
            const cookieValue = value as string;
            if (cookieValue) {
              // 只显示前20个字符，其余用*代替
              const maskedCookie = cookieValue.length > 20 
                ? cookieValue.substring(0, 20) + '...' 
                : cookieValue;
              this.logManager.addLog(`  ${key}: ${maskedCookie}`, 'info', this.taskId);
            } else {
              this.logManager.addLog(`  ${key}: (空)`, 'warning', this.taskId);
            }
          } else {
            this.logManager.addLog(`  ${key}: ${value}`, 'info', this.taskId);
          }
        }
      }

      // 检查 Cookie 是否有效
      if (!this.headers.cookie) {
        this.logManager.addLog(`警告: 没有提供 Pixiv Cookie，可能导致 403 错误`, 'warning', this.taskId);
      } else {
        this.logManager.addLog(`Cookie 已提供，长度: ${this.headers.cookie.length} 字符`, 'info', this.taskId);
      }

      // 代理访问图片
      const response = await fetch(rewrittenUrl, {
        method: 'GET',
        headers: requestHeaders,
        cf: {
          // 禁用缓存以避免 403 错误
          cacheTtl: 0,
          cacheEverything: false
        }
      } as CloudflareRequestInit);

      // 记录响应状态和头部信息
      this.logManager.addLog(`响应状态: ${response.status} ${response.statusText}`, 'info', this.taskId);
      this.logManager.addLog(`响应头信息:`, 'info', this.taskId);
      response.headers.forEach((value, key) => {
        this.logManager.addLog(`  ${key}: ${value}`, 'info', this.taskId);
      });

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const fileSizeMB = imageBuffer.byteLength / (1024 * 1024);
        
        this.logManager.addLog(`代理访问成功，尺寸: ${size}，文件大小: ${fileSizeMB.toFixed(2)}MB`, 'success', this.taskId);
        
        // 获取文件扩展名和Content-Type
        const urlParts = imageUrl.split('.');
        const extension = urlParts[urlParts.length - 1].split('?')[0];
        const contentType = this.getContentType(extension);
        
        return {
          success: true,
          imageBuffer,
          contentType
        };
      } else {
        // 尝试读取错误响应体
        let errorText = '';
        try {
          errorText = await response.text();
          this.logManager.addLog(`错误响应体: ${errorText}`, 'error', this.taskId);
        } catch (readError) {
          this.logManager.addLog(`无法读取错误响应体: ${readError instanceof Error ? readError.message : String(readError)}`, 'error', this.taskId);
        }
        
        this.logManager.addLog(`代理访问 ${size} 尺寸失败: HTTP ${response.status} ${response.statusText}`, 'error', this.taskId);
        
        // 检查是否是 Cloudflare 防护页面
        if (errorText.includes('Cloudflare') && errorText.includes('Attention Required')) {
          this.logManager.addLog(`检测到 Cloudflare 防护页面，Ray ID: ${this.extractCloudflareRayId(errorText)}`, 'error', this.taskId);
          this.logManager.addLog(`Cloudflare 防护原因:`, 'error', this.taskId);
          this.logManager.addLog(`  1. 请求频率过高被限制`, 'error', this.taskId);
          this.logManager.addLog(`  2. IP 地址被 Cloudflare 标记为可疑`, 'error', this.taskId);
          this.logManager.addLog(`  3. 请求模式被识别为自动化工具`, 'error', this.taskId);
          this.logManager.addLog(`  4. 缺少必要的浏览器指纹信息`, 'error', this.taskId);
        } else if (response.status === 403) {
          this.logManager.addLog(`403 错误可能原因:`, 'error', this.taskId);
          this.logManager.addLog(`  1. Pixiv 防盗链保护 - 检查 Referer 头`, 'error', this.taskId);
          this.logManager.addLog(`  2. User-Agent 被识别为爬虫`, 'error', this.taskId);
          this.logManager.addLog(`  3. IP 地址被 Pixiv 封禁`, 'error', this.taskId);
          this.logManager.addLog(`  4. 图片 URL 已过期或无效`, 'error', this.taskId);
        }
      }
    } catch (error) {
      this.logManager.addLog(`代理访问 ${size} 尺寸失败: ${error instanceof Error ? error.message : String(error)}`, 'warning', this.taskId);
    }
    
    return { success: false, error: `尺寸 ${size} 访问失败` };
  }

  /**
   * 提取 Cloudflare Ray ID
   */
  private extractCloudflareRayId(html: string): string {
    const rayIdMatch = html.match(/Cloudflare Ray ID: <strong[^>]*>([^<]+)<\/strong>/);
    return rayIdMatch ? rayIdMatch[1] : 'unknown';
  }

  /**
   * 根据文件扩展名获取Content-Type
   */
  private getContentType(extension: string): string {
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp'
    };
    
    return contentTypeMap[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * 获取日志管理器
   */
  getLogManager(): ILogManager {
    return this.logManager;
  }
}

/**
 * 创建默认的 PixivProxy 实例
 */
export function createPixivProxy(
  headers?: Partial<PixivHeaders>,
  logManager?: ILogManager,
  taskId?: string
): PixivProxy {
  const defaultHeaders: PixivHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'cookie': '',
    'Referer': 'https://www.pixiv.net/',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    ...headers
  };

  return new PixivProxy(defaultHeaders, logManager, taskId);
}