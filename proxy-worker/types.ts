/**
 * Pixiv API 相关类型定义
 */
export interface PixivHeaders {
  'User-Agent': string;
  cookie: string;
  Referer: string;
  'Accept-Language': string;
  [key: string]: string;
}

/**
 * Pixiv 插画页面信息
 */
export interface PixivIllustPage {
  urls: {
    original: string;
    regular: string;
    small: string;
    thumb_mini: string;
  };
}

/**
 * Pixiv 插画页面响应
 */
export interface PixivIllustPagesResponse {
  body: PixivIllustPage[];
  error: boolean;
  message?: string;
}

/**
 * Pixiv 插画信息响应
 */
export interface PixivIllustInfo {
  body: {
    userId: string;
    title: string;
    userName: string;
    tags: {
      tags: Array<{
        tag: string;
        translation?: {
          en: string;
        };
      }>;
    };
    likeCount: number;
    bookmarkCount: number;
    viewCount: number;
    illusts?: Array<{ id: string }>;
    recommendUsers?: Array<{
      userId: string;
      illustIds: string[];
    }>;
  };
  error: boolean | string;
  message?: string;
}

/**
 * 代理图片结果
 */
export interface ProxyImageResult {
  success: boolean;
  imageBuffer?: ArrayBuffer;
  contentType?: string;
  error?: string;
}

/**
 * 日志类型
 */
export type LogType = 'info' | 'error' | 'warning' | 'success';

/**
 * 日志条目
 */
export interface LogEntry {
  message: string;
  type: LogType;
  taskId?: string;
  timestamp: string;
}

/**
 * 日志管理器接口
 */
export interface ILogManager {
  addLog(message: string, type: LogType, taskId?: string): void;
  getLogs(): LogEntry[];
  clearLogs(): void;
}

/**
 * Worker 环境变量
 */
export interface Env {
  // Pixiv 相关配置
  PIXIV_USER_AGENT?: string;
  PIXIV_COOKIE?: string;
  PIXIV_REFERER?: string;
  PIXIV_ACCEPT_LANGUAGE?: string;
  
  // 其他可能的环境变量
  [key: string]: string | undefined;
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Cloudflare Worker ExecutionContext
 */
export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

/**
 * Cloudflare Worker RequestInit 扩展
 */
export interface CloudflareRequestInit extends RequestInit {
  cf?: {
    cacheTtl?: number;
    cacheEverything?: boolean;
  };
}