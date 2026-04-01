import 'server-only'

import { env } from '@/env'

const DEFAULT_ARTIST_CRAWL_ACTIONS = ['crawl-artist-by-id', 'crawl-artist', 'artist-crawl']

export interface TriggerArtistCrawlResult {
  attempted: boolean
  success: boolean
  message: string
  action?: string
}

export interface TriggerArtworkArchiveResult {
  attempted: boolean
  success: boolean
  message: string
  requestedSizes: string[]
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
      message: 'CRAWLER_SERVER_URL is not configured, skip crawler trigger',
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
          message: `Crawler triggered (${action})`,
        }
      }
    } catch {
      // Try the next compatible action name.
    }
  }

  return {
    attempted: true,
    success: false,
    message: 'Crawler endpoint did not accept any known artist crawl action',
  }
}

export async function triggerArtworkArchiveByPid(
  pid: string,
  requestedSizes: string[]
): Promise<TriggerArtworkArchiveResult> {
  const sizes = Array.from(
    new Set(
      requestedSizes
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )

  if (!env.CRAWLER_SERVER_URL) {
    return {
      attempted: false,
      success: false,
      requestedSizes: sizes,
      message: 'CRAWLER_SERVER_URL is not configured, skip archive trigger',
    }
  }

  try {
    const result = await postCrawlerAction('batch-download', {
      pids: [pid],
      sizes,
    })

    if (!result.ok) {
      return {
        attempted: true,
        success: false,
        requestedSizes: sizes,
        message: `Archive trigger failed with HTTP ${result.status}`,
      }
    }

    return {
      attempted: true,
      success: true,
      requestedSizes: sizes,
      message: `Archive triggered (${sizes.join(', ')})`,
    }
  } catch (error) {
    return {
      attempted: true,
      success: false,
      requestedSizes: sizes,
      message: error instanceof Error ? error.message : 'Archive trigger failed',
    }
  }
}
