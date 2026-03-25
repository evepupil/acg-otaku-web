import 'server-only'

import { env } from '@/env'

const DEFAULT_ARTIST_CRAWL_ACTIONS = [
  'crawl-artist-by-id',
  'crawl-artist',
  'artist-crawl',
]

export interface TriggerArtistCrawlResult {
  attempted: boolean
  success: boolean
  message: string
  action?: string
}

async function postCrawlerAction(action: string, payload: Record<string, unknown>) {
  const response = await fetch(env.CRAWLER_SERVER_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
    cache: 'no-store',
  })

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  return { ok: response.ok, status: response.status, body }
}

export async function triggerArtistCrawlById(
  artistId: string,
  limit: number
): Promise<TriggerArtistCrawlResult> {
  if (!env.CRAWLER_SERVER_URL) {
    return {
      attempted: false,
      success: false,
      message: '未配置 CRAWLER_SERVER_URL，跳过爬虫触发',
    }
  }

  for (const action of DEFAULT_ARTIST_CRAWL_ACTIONS) {
    try {
      const result = await postCrawlerAction(action, { artistId, limit })
      if (result.ok) {
        return {
          attempted: true,
          success: true,
          action,
          message: `已触发爬虫任务 (${action})`,
        }
      }
    } catch {
      // 尝试下一个 action
    }
  }

  return {
    attempted: true,
    success: false,
    message: '爬虫接口未命中已知 action，已返回本地候选结果',
  }
}
