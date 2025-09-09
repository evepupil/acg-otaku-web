import {
  PixivHeaders,
  PixivIllustPagesResponse,
  PixivIllustInfo,
  ProxyImageResult,
  ILogManager,
  LogType
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
      
      const response = await fetch(
        `https://www.pixiv.net/ajax/illust/${pid}/pages?lang=zh`,
        {
          headers: this.headers,
          cf: {
            // Cloudflare 特定配置
            cacheTtl: 300, // 缓存 5 分钟
            cacheEverything: true
          } as any
        }
      );

      if (!response.ok) {
        this.logManager.addLog(`获取插画 ${pid} 页面信息失败: HTTP ${response.status}`, 'error', this.taskId);
        return null;
      }

      const resJson: PixivIllustPagesResponse = await response.json();
      
      if (resJson.error === false && resJson.body && resJson.body.length > 0) {
        this.logManager.addLog(`获取插画 ${pid} 页面信息成功，共 ${resJson.body.length} 张图片`, 'info', this.taskId);
        
        // 打印所有可用的图片尺寸和链接
        const urls = resJson.body[0].urls;
        this.logManager.addLog(`插画 ${pid} 可用图片尺寸:`, 'info', this.taskId);
        Object.entries(urls).forEach(([size, url]) => {
          this.logManager.addLog(`  ${size}: ${url}`, 'info', this.taskId);
        });
        
        return resJson;
      } else {
        this.logManager.addLog(`获取插画 ${pid} 页面信息失败或为空`, 'warning', this.taskId);
        return null;
      }
    } catch (error) {
      this.logManager.addLog(`获取插画 ${pid} 页面信息异常: ${error instanceof Error ? error.message : String(error)}`, 'error', this.taskId);
      return null;
    }
  }

  /**
   * 获取画师名字
   */
  private async getArtistName(pid: string): Promise<string | null> {
    try {
      // 使用新的API方法获取插画信息，更加高效
      const response = await fetch(
        `https://www.pixiv.net/ajax/illust/${pid}`,
        {
          headers: this.headers,
          cf: {
            cacheTtl: 300,
            cacheEverything: true
          } as any
        }
      );

      if (!response.ok) {
        this.logManager.addLog(`获取插画 ${pid} 信息失败: HTTP ${response.status}`, 'error', this.taskId);
        return null;
      }

      const resJson: PixivIllustInfo = await response.json();
      
      if (resJson.error === false && resJson.body && resJson.body.userName) {
        const userName = resJson.body.userName;
        this.logManager.addLog(`获取到画师名字: ${userName}`, 'info', this.taskId);
        return userName;
      }
      
      this.logManager.addLog(`未找到插画 ${pid} 的画师名字`, 'warning', this.taskId);
      return null;
    } catch (error) {
      this.logManager.addLog(`获取画师名字异常: ${error instanceof Error ? error.message : String(error)}`, 'error', this.taskId);
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

        const result = await this.tryDownloadImage(imageUrl, size);
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
   * 尝试下载指定URL的图片
   */
  private async tryDownloadImage(imageUrl: string, size: string): Promise<ProxyImageResult> {
    try {
      // 代理访问图片
      const response = await fetch(imageUrl, {
        headers: {
          ...this.headers,
          'Referer': 'https://www.pixiv.net/'
        },
        cf: {
          // 图片缓存时间更长
          cacheTtl: 3600, // 1小时
          cacheEverything: true
        } as any
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
        this.logManager.addLog(`代理访问 ${size} 尺寸失败: HTTP ${response.status}`, 'warning', this.taskId);
      }
    } catch (error) {
      this.logManager.addLog(`代理访问 ${size} 尺寸失败: ${error instanceof Error ? error.message : String(error)}`, 'warning', this.taskId);
    }
    
    return { success: false, error: `尺寸 ${size} 访问失败` };
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